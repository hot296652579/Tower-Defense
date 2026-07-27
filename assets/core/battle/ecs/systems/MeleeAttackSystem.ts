import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import { EntityType } from "../../data/UnitConfigType";
import EcsSystem from "../base/EcsSystem";
import AttackComp from "../components/AttackComp";
import AttackLimitComp from "../components/AttackLimitComp";
import AttackModeComp, { AttackMode } from "../components/AttackModeComp";
import CampComp from "../components/CampComp";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import HPComp from "../components/HPComp";
import MoveComp from "../components/MoveComp";
import TransformComp from "../components/TransformComp";

//MeleeAttackSystem 只负责 AI 寻敌、攻击判定、冷却、目标锁定
export default class MeleeAttackSystem extends EcsSystem {
    public update(dt: number): void {
        // 阶段1：每帧重置所有受击实体同时攻击计数
        const allVictimEntities = this.world.queryEntities([AttackLimitComp]);
        for (const targetId of allVictimEntities) {
            const limitComp = this.world.getComponent(targetId, AttackLimitComp);
            limitComp.curAttackCount = 0;
        }

        const attackerEntities = this.world.queryEntities([
            AttackComp,
            MoveComp,
            FsmStateComp,
            CampComp,
            TransformComp,
            AttackModeComp
        ]);

        // 阶段2：先结算冷却中的交战锁定，优先占用攻击名额
        for (const attackerId of attackerEntities) {
            if (this.world.getComponent(attackerId, AttackModeComp).mode !== AttackMode.MELEE) {
                continue;
            }

            const attackComp = this.world.getComponent(attackerId, AttackComp);
            const fsmComp = this.world.getComponent(attackerId, FsmStateComp);
            const attackerPos = this.world.getComponent(attackerId, TransformComp);
            const moveComp = this.world.getComponent(attackerId, MoveComp);
            const attackerCamp = this.world.getComponent(attackerId, CampComp).camp;

            attackComp.isAttacking = false;
            moveComp.isMoving = !moveComp.isHero;

            if (fsmComp.state === EntityFsmState.DEAD || fsmComp.state === EntityFsmState.HURT) {
                attackComp.targetEntityId = 0;
                continue;
            }

            if (attackComp.atkCd <= 0) continue;

            attackComp.atkCd -= dt;
            if (attackComp.targetEntityId === 0) continue;

            const targetId = attackComp.targetEntityId;
            if (this.isHostileTarget(attackerCamp, targetId)
                && this.tryOccupyEngagedTarget(attackerPos, attackComp, targetId)) {
                moveComp.isMoving = false;
            } else {
                attackComp.targetEntityId = 0;
            }
        }

        // 阶段3：冷却结束的单位寻敌并攻击
        for (const attackerId of attackerEntities) {
            if (this.world.getComponent(attackerId, AttackModeComp).mode !== AttackMode.MELEE) {
                continue;
            }

            const attackComp = this.world.getComponent(attackerId, AttackComp);
            const fsmComp = this.world.getComponent(attackerId, FsmStateComp);
            const attackerPos = this.world.getComponent(attackerId, TransformComp);
            const moveComp = this.world.getComponent(attackerId, MoveComp);
            const attackerCamp = this.world.getComponent(attackerId, CampComp).camp;

            if (fsmComp.state === EntityFsmState.DEAD || fsmComp.state === EntityFsmState.HURT) {
                continue;
            }
            // 仍在冷却：阶段2已处理
            if (attackComp.atkCd > 0) continue;

            // 收集射程内敌对目标
            const rangeTargetList: Array<{ entityId: number; dist: number }> = [];
            const allValidVictims = this.world.queryEntities([HPComp, AttackLimitComp, TransformComp, CampComp]);
            for (const targetId of allValidVictims) {
                if (targetId === attackerId) continue;
                if (!this.isHostileTarget(attackerCamp, targetId)) continue;

                const targetHp = this.world.getComponent(targetId, HPComp);
                const targetPos = this.world.getComponent(targetId, TransformComp);
                if (targetHp.curHp <= 0) continue;

                const distance = this.calcDistance(
                    attackerPos.pos.x, attackerPos.pos.y,
                    targetPos.pos.x, targetPos.pos.y
                );
                if (distance <= attackComp.atkRange) {
                    rangeTargetList.push({ entityId: targetId, dist: distance });
                }
            }

            if (rangeTargetList.length <= 0) {
                attackComp.targetEntityId = 0;
                moveComp.isMoving = !moveComp.isHero;
                continue;
            }

            rangeTargetList.sort((a, b) => a.dist - b.dist);

            let hitTargetId = 0;
            for (const targetInfo of rangeTargetList) {
                const limitComp = this.world.getComponent(targetInfo.entityId, AttackLimitComp);
                if (limitComp.curAttackCount < limitComp.maxAttackCount) {
                    hitTargetId = targetInfo.entityId;
                    break;
                }
            }

            if (hitTargetId !== 0) {
                attackComp.targetEntityId = hitTargetId;
                attackComp.isAttacking = true;
                moveComp.isMoving = false;

                const targetLimit = this.world.getComponent(hitTargetId, AttackLimitComp);
                targetLimit.curAttackCount += 1;
                attackComp.atkCd = attackComp.atkInterval;

                EventManager.getInstance().emit(
                    GameEvent.ENTITY_ATTACK,
                    attackerId,
                    hitTargetId,
                    attackComp.atk,
                    attackComp.damageType
                );
                EventManager.getInstance().emit(
                    GameEvent.ENTITY_STATE_CHANGE,
                    attackerId,
                    EntityFsmState.ATTACK
                );
            } else {
                // 名额已满：清空锁定，怪物继续沿路径走
                attackComp.targetEntityId = 0;
                moveComp.isMoving = !moveComp.isHero;
            }
        }
    }

    /** 冷却交战中占用名额；目标无效或离开射程返回 false */
    private tryOccupyEngagedTarget(
        attackerPos: TransformComp,
        attackComp: AttackComp,
        targetId: number
    ): boolean {
        const targetHp = this.world.tryGetComponent(targetId, HPComp);
        const targetPos = this.world.tryGetComponent(targetId, TransformComp);
        const targetLimit = this.world.tryGetComponent(targetId, AttackLimitComp);
        if (!targetHp || !targetPos || !targetLimit || targetHp.curHp <= 0) {
            return false;
        }

        const distance = this.calcDistance(
            attackerPos.pos.x, attackerPos.pos.y,
            targetPos.pos.x, targetPos.pos.y
        );
        if (distance > attackComp.atkRange) {
            return false;
        }

        targetLimit.curAttackCount += 1;
        return true;
    }

    /** 不同阵营才可攻击 */
    private isHostileTarget(attackerCamp: EntityType, targetId: number): boolean {
        const targetCamp = this.world.tryGetComponent(targetId, CampComp);
        if (!targetCamp) return false;
        return targetCamp.camp !== attackerCamp;
    }

    private calcDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
