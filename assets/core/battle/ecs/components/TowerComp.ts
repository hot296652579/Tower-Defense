import EcsComponent from "../base/EcsComponent";

export default class TowerComp extends EcsComponent {
    /** 炮塔配置ID */
    public configId: number = 0;
    /** 当前等级 */
    public level: number = 1;
    /** 建造点位索引 */
    public buildGridIndex: number = 0;
}