import EcsComponent from "../base/EcsComponent";

/** 火炮塔组件 */
export default class TowerCannonComp extends EcsComponent {
    // 攻击力
    public atk: number = 0;
    // 攻击范围
    public atkRange: number = 0;
    // 攻击间隔
    public atkInterval: number = 0;
    // 攻击计时
    public atkCd: number = 0;
    // 溅射范围
    public splashRadius: number = 0;
    // 炮弹预制体路径
    public bulletPath: string = "";
}