import EcsComponent from "../base/EcsComponent";

export default class AttackLimitComp extends EcsComponent {
    // 同一帧允许同时被多少个敌人攻击
    public maxAttackCount: number = 2;
    // 当前帧正在攻击本实体的敌方数量
    public curAttackCount: number = 0;
    // 帧重置标记，每帧清空计数
    public frameClearMark: number = 0;
}