
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import EcsSystem from "../base/EcsSystem";
import AttackComp from "../components/AttackComp";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import HPComp from "../components/HPComp";
import MoveComp from "../components/MoveComp";

export default class FsmSwitchSystem extends EcsSystem {

    public update(dt: number): void {
        const entityList = this.world.queryEntities([
            FsmStateComp,
            HPComp,
            MoveComp
        ]);

        for (const entityId of entityList) {
            const fsmComp = this.world.getComponent(entityId, FsmStateComp);
            const attackComp = this.world.tryGetComponent(entityId, AttackComp);
            const hpComp = this.world.getComponent(entityId, HPComp);
            const moveComp = this.world.getComponent(entityId, MoveComp);
            const oldState = fsmComp.state;
            let newState = oldState;

            // 优先级：死亡 > 出刀帧 > 交战冷却维持攻击 > 受伤 > 移动 > 待机
            if (hpComp.curHp <= 0) {
                newState = EntityFsmState.DEAD;
            }
            else if (attackComp && attackComp.isAttacking) {
                newState = EntityFsmState.ATTACK;
            }
            else if (attackComp && attackComp.atkCd > 0 && attackComp.targetEntityId !== 0) {
                newState = EntityFsmState.ATTACK;
            }
            else if (hpComp.isHurt || hpComp.hurtCd > 0) {
                newState = EntityFsmState.HURT;
            }
            else if (moveComp.isMoving) {
                newState = EntityFsmState.WALK;
            } else {
                newState = EntityFsmState.IDLE;
            }

            // 状态变更派发事件
            if (newState !== oldState) {
                fsmComp.state = newState;
                // console.log(`实体${entityId} 状态变更：${oldState} -> ${newState}`);
                EventManager.getInstance().emit(GameEvent.ENTITY_STATE_CHANGE, entityId, newState);
            }
        }
    }
}