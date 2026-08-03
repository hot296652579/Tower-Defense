import EcsComponent from "../base/EcsComponent";

/** 兵营塔组件 */
export default class TowerBarrackComp extends EcsComponent {
    // 需要生成的单位配置ID
    public spawnUnitId: number = 0;
    // 生成间隔
    public spawnInterval: number = 0;
    public spawnCd: number = 0;
    // 最大同时存在的小兵数量
    public maxUnit: number = 0;
    // 当前由这个塔生成的实体id列表
    public spawnedUnitIds: number[] = [];
    // 小兵在塔附近游荡站立范围
    public standRange: number = 0;
}