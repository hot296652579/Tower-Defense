import EcsSystem from "../base/EcsSystem";
import TransformComp from "../components/TransformComp";
import AttackComp from "../components/AttackComp";
import CampComp from "../components/CampComp";
import HPComp from "../components/HPComp";
import HealerComp from "../components/HealerComp";
import AttackModeComp, { AttackMode } from "../components/AttackModeComp";

import { Vec2, math } from "cc";
import { EntityType } from "../../data/UnitConfigType";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import { BattleConfigHelper } from "../../data/BattleConfigHelper";
import { EffectManager } from "../../manager/EffectManager";

export default class HealerSystem extends EcsSystem {
    private _effectMgr = EffectManager.getInstance();

    public update(dt: number): void {
        this.handleHealLogic(dt);
    }

    private handleHealLogic(dt: number) {
        // 查询：携带治疗组件、攻击组件、攻击模式组件的单位
        const healerEntityList = this.world.queryEntities([
            TransformComp,
            AttackComp,
            CampComp,
            HPComp,
            HealerComp,
            AttackModeComp
        ]);

        for (const eid of healerEntityList) {
            const trans = this.world.getComponent(eid, TransformComp);
            const healerComp = this.world.getComponent(eid, HealerComp);
            const campComp = this.world.getComponent(eid, CampComp);
            const atkComp = this.world.getComponent(eid, AttackComp);

            // 每帧清攻击标记，治疗不应让怪物长期卡在 ATTACK 导致不走路
            atkComp.isAttacking = false;

            healerComp.healCd -= dt;
            if (healerComp.healCd > 0) continue;

            const targetHealEid = this.findLowHpAllyInRange(eid, campComp.camp, trans.pos, healerComp.healRange);
            if (targetHealEid <= 0) continue;

            healerComp.healCd = healerComp.healInterval;
            atkComp.isAttacking = true;

            const healCfg = BattleConfigHelper.getBattleByBulletConfig(this.world, eid);

            EventManager.getInstance().emit(
                GameEvent.ENTITY_STATE_CHANGE,
                eid,
                EntityFsmState.ATTACK
            );

            EventManager.getInstance().emit(
                GameEvent.UNIT_HEAL,
                eid,
                targetHealEid,
                healerComp.healValue
            );

            const targetTrans = this.world.getComponent(targetHealEid, TransformComp);
            if (healCfg.hitEffectPath || healCfg.effectPath) {
                this._effectMgr.playEffect(healCfg.effectPath || healCfg.hitEffectPath, targetTrans.pos, 1);
            }
        }
    }

    /**
     * 寻找范围内血量最低的同阵营单位（不分英雄/怪物）
     * 对齐远程系统 findEnemyTargetInRange 
     */
    private findLowHpAllyInRange(healerEid: number, selfCamp: EntityType, healerPos: Vec2, healRange: number): number {
        const allAllyTargets = this.world.queryEntities([TransformComp, HPComp, CampComp]);
        let nearestHealTargetId = 0;
        let maxLostHp = 0;

        for (const targetEid of allAllyTargets) {
            // 跳过自身，不自我治疗
            if (targetEid === healerEid) continue;

            const targetHpComp = this.world.getComponent(targetEid, HPComp);
            const targetCamp = this.world.getComponent(targetEid, CampComp).camp;
            const targetState = this.world.getComponent(targetEid, FsmStateComp);
            // 过滤规则：敌方单位 / 满血 / 已死亡单位
            if (targetCamp !== selfCamp || targetHpComp.curHp >= targetHpComp.maxHp || targetHpComp.curHp <= 0 || targetState.state == EntityFsmState.DEAD) continue;

            const targetTrans = this.world.getComponent(targetEid, TransformComp);
            const distance = math.Vec2.distance(healerPos, targetTrans.pos);
            if (distance > healRange) continue;

            // 优先缺失血量最多的单位
            const lostHp = targetHpComp.maxHp - targetHpComp.curHp;
            if (nearestHealTargetId === 0 || lostHp > maxLostHp) {
                maxLostHp = lostHp;
                nearestHealTargetId = targetEid;
            }
        }
        return nearestHealTargetId;
    }

    /** 关卡刷新清空接口，和远程系统clearAllBullet规范对齐 */
    public clearAllHeal() { }
}