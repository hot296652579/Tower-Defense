import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import EcsSystem from "../base/EcsSystem";
import AttackComp from "../components/AttackComp";
import AttackLimitComp from "../components/AttackLimitComp";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import HPComp from "../components/HPComp";
import MoveComp from "../components/MoveComp";
import { DamageType } from "../../data/UnitConfigType";
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

        // 阶段2：遍历所有近战攻击者
        const attackerEntities = this.world.queryEntities([
            AttackComp,
            MoveComp,
            FsmStateComp
        ]);

        for (const attackerId of attackerEntities) {
            const attackComp = this.world.getComponent(attackerId, AttackComp);
            const fsmComp = this.world.getComponent(attackerId, FsmStateComp);
            const attackerPos = this.world.getComponent(attackerId, TransformComp);
            const moveComp = this.world.getComponent(attackerId, MoveComp);

            // 重置攻击标记:怪物默认继续寻路，英雄站桩不置移动
            attackComp.isAttacking = false;
            moveComp.isMoving = !moveComp.isHero;

            // 死亡/受伤单位直接停止攻击逻辑
            if (fsmComp.state === EntityFsmState.DEAD || fsmComp.state === EntityFsmState.HURT) {
                attackComp.targetEntityId = 0;
                continue;
            }

            // 冷却倒计时
            if (attackComp.atkCd > 0) {
                attackComp.atkCd -= dt;
                // 冷却中：如果已有锁定目标且目标存活在射程，停止移动
                if (attackComp.targetEntityId !== 0) {
                    const targetId = attackComp.targetEntityId;
                    // 校验目标是否存在
                    if (this.world.getComponent(targetId, HPComp)
                        && this.world.getComponent(targetId, TransformComp)) {
                        const targetHp = this.world.getComponent(targetId, HPComp);
                        const targetPos = this.world.getComponent(targetId, TransformComp);
                        if (targetHp.curHp > 0) {
                            const distance = this.calcDistance(
                                attackerPos.pos.x, attackerPos.pos.y,
                                targetPos.pos.x, targetPos.pos.y
                            );
                            if (distance <= attackComp.atkRange) {
                                moveComp.isMoving = false;
                            }
                        }
                    }
                }
                continue;
            }

            // 阶段3：收集射程内所有存活可攻击目标
            const rangeTargetList: Array<{ entityId: number; dist: number }> = [];
            const allValidVictims = this.world.queryEntities([HPComp, AttackLimitComp, TransformComp]);
            for (const targetId of allValidVictims) {
                if (targetId === attackerId) continue;//排除自身

                const targetHp = this.world.getComponent(targetId, HPComp);
                const targetPos = this.world.getComponent(targetId, TransformComp);
                if (targetHp.curHp <= 0) continue;

                const distance = this.calcDistance(
                    attackerPos.pos.x, attackerPos.pos.y,
                    targetPos.pos.x, targetPos.pos.y
                );
                console.log('attackerId:', attackerId, 'attackComp.atkRange:', attackComp.atkRange, 'distance:', distance);
                if (distance <= attackComp.atkRange) {
                    rangeTargetList.push({ entityId: targetId, dist: distance });
                }
            }

            // 射程内无目标，清空锁定；怪物继续寻路，英雄保持站立
            if (rangeTargetList.length <= 0) {
                attackComp.targetEntityId = 0;
                moveComp.isMoving = !moveComp.isHero;
                continue;
            }

            // 按距离由近到远排序，优先打最近单位
            rangeTargetList.sort((a, b) => a.dist - b.dist);

            // 阶段4：寻找未达攻击上限的目标
            let hitTargetId = 0;
            for (const targetInfo of rangeTargetList) {
                const limitComp = this.world.getComponent(targetInfo.entityId, AttackLimitComp);
                if (limitComp.curAttackCount < limitComp.maxAttackCount) {
                    hitTargetId = targetInfo.entityId;
                    break;
                }
            }

            // 分支A：找到可用目标，执行攻击
            if (hitTargetId !== 0) {
                attackComp.targetEntityId = hitTargetId;
                attackComp.isAttacking = true;
                moveComp.isMoving = false;

                // 占用攻击名额
                const targetLimit = this.world.getComponent(hitTargetId, AttackLimitComp);
                targetLimit.curAttackCount += 1;

                // 重置攻击冷却
                attackComp.atkCd = attackComp.atkInterval;

                // 造成伤害，触发受伤状态
                const targetHp = this.world.getComponent(hitTargetId, HPComp);
                targetHp.curHp -= attackComp.atk;
                targetHp.isHurt = true;
                targetHp.hurtCd = 0.3;

                // 派发攻击事件（携带伤害类型）
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
            }
            // 分支B：范围内全部目标攻击上限已满，怪物游走寻找其他目标
            else {
                attackComp.targetEntityId = 0;
                moveComp.isMoving = !moveComp.isHero;
            }
        }
    }

    /** 二维两点距离计算 */
    private calcDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
}