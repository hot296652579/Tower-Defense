import EcsComponent from "../base/EcsComponent";

/** 攻击方式：近战 / 远程 */
export enum AttackMode {
    MELEE = "melee",
    RANGER = "ranger",
    HEALER = "healer",
}

export default class AttackModeComp extends EcsComponent {
    public mode: AttackMode = AttackMode.MELEE;
}
