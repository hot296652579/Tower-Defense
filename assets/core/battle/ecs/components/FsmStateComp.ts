import EcsComponent from "../base/EcsComponent";

//实体逻辑状态，驱动表现层动画
export enum EntityFsmState {
    IDLE = 0,
    WALK = 1,
    ATTACK = 2,
    HURT = 3,
    DEAD = 4
}

export default class FsmStateComp extends EcsComponent {
    public state: EntityFsmState = EntityFsmState.IDLE;
}