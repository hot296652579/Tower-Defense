import { TowerType } from "../../data/TowerType";
import EcsComponent from "../base/EcsComponent";

export default class TowerComp extends EcsComponent {
    /** 炮塔配置ID */
    public configId: number = 0;
    /** 当前等级 */
    public level: number = 1;
    // 塔类型
    public towerType: TowerType = TowerType.barrack;
    // 建造总耗时
    public buildTotalTime: number = 0;
    // 当前建造计时
    public buildTimer: number = 0;
    /** 是否建造完成 false=建造中 */
    public isBuildComplete: boolean = false;
    // 建造花费金币
    public buildCost: number = 0;
    // 出售比例
    public sellRatio: number = 0;
    // 场景建造点位节点唯一标识（可选，用于定位建造点）
    public slotUid: string = "";

}