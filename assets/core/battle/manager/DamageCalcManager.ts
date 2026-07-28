import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import EcsWorld from "../ecs/base/EcsWorld";
import HPComp from "../ecs/components/HPComp";
import TransformComp from "../ecs/components/TransformComp";
import BaseSingleton from "db://assets/framework/base/BaseSingleton";
import EnemyComp from "../ecs/components/EnemyComp";
import BattleGlobalComp from "../ecs/components/BattleGlobalComp";
import CampComp from "../ecs/components/CampComp";
import { EntityType } from "../data/UnitConfigType";

export class DamageCalcManager extends BaseSingleton {
    public static instance: DamageCalcManager = new DamageCalcManager();
    private world: EcsWorld = null!;

    public async init(world: EcsWorld): Promise<void> {
        this.world = world;
        EventManager.getInstance().on(GameEvent.ENTITY_ATTACK, this.onAttackEvent, this);
        EventManager.getInstance().on(GameEvent.UNIT_HEAL, this.onHealEvent, this);
        EventManager.getInstance().on(GameEvent.ATTACK_BASE, this.onAttackBaseEvent, this);
    }

    destroy() {
        EventManager.getInstance().off(GameEvent.ENTITY_ATTACK, this.onAttackEvent, this);
        EventManager.getInstance().off(GameEvent.UNIT_HEAL, this.onHealEvent, this);
        EventManager.getInstance().off(GameEvent.ATTACK_BASE, this.onAttackBaseEvent, this);
    }

    /** 监听攻击事件，统一计算伤害、修改血量、派发血量更新事件 */
    private onAttackEvent(attackerId: number, targetId: number, rawAtk: number, damageType: number) {
        const targetHp = this.world.tryGetComponent(targetId, HPComp);
        const targetTrans = this.world.tryGetComponent(targetId, TransformComp);
        if (!targetHp || !targetTrans || targetHp.curHp <= 0) return;

        //伤害减伤计算
        const realDamage = Math.max(1, rawAtk - targetHp.def);
        const oldHp = targetHp.curHp;
        targetHp.curHp = Math.max(0, targetHp.curHp - realDamage);
        const hpDelta = targetHp.curHp - oldHp;

        //设置受伤硬直状态
        // if (targetHp.hurtCd <= 0) {
        //     targetHp.isHurt = true;
        //     targetHp.hurtCd = 0.5;
        // }

        //派发血量更新事件，交给HpBarManager刷新UI
        EventManager.getInstance().emit(GameEvent.ENTITY_HP_UPDATE, {
            entityId: targetId,
            hpComp: targetHp,
            posComp: targetTrans,
            deltaHp: hpDelta
        });

        //血量归零，派发死亡事件回收血条
        if (targetHp.curHp <= 0) {
            console.log("血量归零，派发死亡事件回收血条", targetId);
            this.world.destroyEntity(targetId);
            this.onEnemyDead(targetId);
            EventManager.getInstance().emit(GameEvent.ENTITY_DESTROY, targetId);
        }
    }

    /** 监听治疗事件，统一计算治疗、修改血量、派发血量更新事件 */
    private onHealEvent(healerId: number, targetId: number, healValue: number) {
        console.log("onHealEvent", healerId, targetId, healValue);
        const targetHp = this.world.tryGetComponent(targetId, HPComp);
        const targetTrans = this.world.tryGetComponent(targetId, TransformComp);
        if (!targetHp || !targetTrans || targetHp.curHp <= 0) return;

        // 计算实际治疗量（不超过满血上限）
        const oldHp = targetHp.curHp;
        targetHp.curHp = Math.min(targetHp.curHp + healValue, targetHp.maxHp);
        const hpDelta = targetHp.curHp - oldHp;

        // 无实际回血直接返回（目标已经满血）
        if (hpDelta <= 0) return;

        //统一派发血量更新事件，血条管理器复用一套刷新逻辑
        EventManager.getInstance().emit(GameEvent.ENTITY_HP_UPDATE, {
            entityId: targetId,
            hpComp: targetHp,
            posComp: targetTrans,
            deltaHp: hpDelta
        });
    }

    /**怪物死亡 增加战斗金币*/
    private onEnemyDead(targetEid: number) {
        // 判断是否是敌方怪物
        const campComp = this.world.getComponent(targetEid, CampComp);
        if (campComp.camp !== EntityType.ENEMY) return;

        const enemyComp = this.world.getComponent(targetEid, EnemyComp);
        const dropGold = enemyComp.goldDrop ?? 0;
        if (dropGold <= 0) return;

        // 获取全局战斗组件，修改金币
        const globalComp = this.world.getComponent(this.world.GLOBAL_ENTITY_ID, BattleGlobalComp);
        const oldGold = globalComp.gold;
        globalComp.gold += dropGold;

        // 派发金币变更事件，通知UI刷新
        EventManager.getInstance().emit(GameEvent.UI_GLOBAL_GOLD_CHANGE, {
            oldValue: oldGold,
            newValue: globalComp.gold
        });
    }

    /** 监听攻击基地事件，统一计算伤害、修改血量、派发血量更新事件 */
    private onAttackBaseEvent() {
        const globalComp = this.world.getComponent(this.world.GLOBAL_ENTITY_ID, BattleGlobalComp);
        const oldHp = globalComp.baseHp;
        globalComp.baseHp = oldHp - 1;

        // 派发基地血量变更事件，通知UI刷新
        EventManager.getInstance().emit(GameEvent.UI_GLOBAL_BASE_HP_CHANGE, {
            oldValue: oldHp,
            newValue: globalComp.baseHp,
            maxHp: globalComp.baseMaxHp
        });

        if (globalComp.baseHp <= 0) {
            console.log("基地血量归零，派发战斗失败事件");
            EventManager.getInstance().emit(GameEvent.BATTLE_LOSE);
        }
    }
}