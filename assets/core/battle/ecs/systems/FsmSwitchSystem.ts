
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import EcsSystem from "../base/EcsSystem";
import AttackComp from "../components/AttackComp";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import HPComp from "../components/HPComp";
import MoveComp from "../components/MoveComp";

export default class FsmSwitchSystem extends EcsSystem {

    public update(dt: number): void {
        // 查询具备状态、血量、移动、攻击组件的实体（怪物/炮塔）
        const entityList = this.world.queryEntities([
            FsmStateComp,
            HPComp,
            MoveComp,
            AttackComp
        ]);

        for (const entityId of entityList) {
            const fsmComp = this.world.getComponent(entityId, FsmStateComp);
            const hpComp = this.world.getComponent(entityId, HPComp);
            const moveComp = this.world.getComponent(entityId, MoveComp);
            const atkComp = this.world.getComponent(entityId, AttackComp);

            // 缓存旧状态，用于判断是否需要派发切换事件
            const oldState = fsmComp.state;
            let newState = oldState;

            // 最高优先级：死亡
            if (hpComp.curHp <= 0) {
                newState = EntityFsmState.DEAD;
            }
            // 次优先级：受伤硬直
            else if (hpComp.isHurt || hpComp.hurtCd > 0) {
                newState = EntityFsmState.HURT;
                hpComp.hurtCd -= dt;
                if (hpComp.hurtCd <= 0) hpComp.isHurt = false;
            }
            // 攻击状态
            else if (atkComp.isAttacking) {
                newState = EntityFsmState.ATTACK;
            }
            // 移动状态（速度大于0代表正在向路径点前进）
            else if (moveComp.moveSpeed > 0) {
                newState = EntityFsmState.WALK;
            }
            // 待机
            else {
                newState = EntityFsmState.IDLE;
            }

            // 状态发生变化，更新并派发事件通知动画层
            if (newState !== oldState) {
                console.log(`派发事件：实体${entityId} 状态切换为:${newState}`);
                fsmComp.state = newState;
                // EventManager.getInstance().emit(GameEvent.ENTITY_STATE_CHANGE, entityId, newState);
                EventManager.getInstance().emit(GameEvent.ENTITY_STATE_CHANGE, entityId, newState);
            }
        }
    }
}