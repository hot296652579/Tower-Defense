import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import EcsWorld from "../ecs/base/EcsWorld";
import HPComp from "../ecs/components/HPComp";
import TransformComp from "../ecs/components/TransformComp";

export class DamageCalcManager {
    public static instance: DamageCalcManager = new DamageCalcManager();
    private world: EcsWorld = null!;

    // 初始化，注入ECS World，绑定事件监听
    init(world: EcsWorld) {
        this.world = world;
        EventManager.getInstance().on(GameEvent.ENTITY_ATTACK, this.onAttackEvent, this);
    }

    destroy() {
        EventManager.getInstance().off(GameEvent.ENTITY_ATTACK, this.onAttackEvent, this);
    }

    /** 监听攻击事件，统一计算伤害、修改血量、派发血量更新事件 */
    private onAttackEvent(attackerId: number, targetId: number, rawAtk: number, damageType: number) {
        const targetHp = this.world.tryGetComponent(targetId, HPComp);
        const targetTrans = this.world.tryGetComponent(targetId, TransformComp);
        if (!targetHp || !targetTrans || targetHp.curHp <= 0) return;

        // 1. 伤害减伤计算（统一收口，近战远程共用）
        const realDamage = Math.max(1, rawAtk - targetHp.def);
        const oldHp = targetHp.curHp;
        targetHp.curHp = Math.max(0, targetHp.curHp - realDamage);
        const hpDelta = targetHp.curHp - oldHp;

        // 2. 设置受伤硬直状态
        if (targetHp.hurtCd <= 0) {
            targetHp.isHurt = true;
            targetHp.hurtCd = 0.3;
        }

        // 3. 派发血量更新事件，交给HpBarManager刷新UI
        EventManager.getInstance().emit(GameEvent.ENTITY_HP_UPDATE, {
            entityId: targetId,
            hpComp: targetHp,
            posComp: targetTrans,
            deltaHp: hpDelta
        });

        // 4. 血量归零，派发死亡事件回收血条
        if (targetHp.curHp <= 0) {
            EventManager.getInstance().emit(GameEvent.ENTITY_ENTITY_DEAD, targetId);
        }
    }
}