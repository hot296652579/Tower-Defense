import EcsComponent from "../base/EcsComponent";

export default class RangerBulletComp extends EcsComponent {
    /** 子弹伤害 */
    public damage: number = 0;
    /** 子弹飞行速度 */
    public bulletSpeed: number = 600;
    /** 目标实体ID */
    public targetId: number = 0;
    /** 溅射半径，0代表无溅射 */
    public splashRadius: number = 0;
    /** 发射者实体ID */
    public sourceEntityId: number = 0;
}