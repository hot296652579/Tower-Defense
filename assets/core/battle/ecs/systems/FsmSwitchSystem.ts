
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import EcsSystem from "../base/EcsSystem";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import HPComp from "../components/HPComp";
import MoveComp from "../components/MoveComp";
import AttackComp from "../components/AttackComp";

export default class FsmSwitchSystem extends EcsSystem {

    public update(dt: number): void {
        const entityList = this.world.queryEntities([
            FsmStateComp,
            HPComp,
            MoveComp
        ]);

        for (const entityId of entityList) {
            const fsmComp = this.world.getComponent(entityId, FsmStateComp);
            const attackComp = this.world.getComponent(entityId, AttackComp);
            const hpComp = this.world.getComponent(entityId, HPComp);
            const moveComp = this.world.getComponent(entityId, MoveComp);
            const oldState = fsmComp.state;
            let newState = oldState;

            // 最高优先级：死亡
            if (hpComp.curHp <= 0) {
                newState = EntityFsmState.DEAD;
            }
            else if (attackComp && (attackComp.isAttacking || attackComp.atkCd > 0)) {
                newState = EntityFsmState.ATTACK;
            }
            // 受伤优先级：受伤
            else if (hpComp.isHurt || hpComp.hurtCd > 0) {
                newState = EntityFsmState.HURT;
                hpComp.hurtCd -= dt;
                if (hpComp.hurtCd <= 0) hpComp.isHurt = false;
            }
            else if (moveComp.isMoving) {
                newState = EntityFsmState.WALK;
            } else {
                newState = EntityFsmState.IDLE;
            }

            // 状态变更，或首帧强制同步时派发事件
            if (newState !== oldState) {
                fsmComp.state = newState;
                console.log(`实体${entityId} 状态变更：${oldState} -> ${newState}`);
                EventManager.getInstance().emit(GameEvent.ENTITY_STATE_CHANGE, entityId, newState);
            }
        }
    }
}