import EcsComponent from "../base/EcsComponent";

/** 塔上挂载的战斗单位组件 */
export default class TowerMountComp extends EcsComponent {
    // 挂载在塔上的战斗单位id
    public unitCfgId: number = 0;
    // 已经创建出来的实体id
    public entityId: number = 0;
}