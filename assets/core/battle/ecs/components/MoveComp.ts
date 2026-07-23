import EcsComponent from "../base/EcsComponent";

export default class MoveComp extends EcsComponent {
    /** 移动速度 */
    public moveSpeed: number = 1;
    /** 当前使用路径ID（对应地图path_0、path_1等） */
    public pathId: string = "path_0";
    /** 当前路径点位索引 */
    public pathIndex: number = 0;
    /** 减速倍率 1=正常速度 */
    public slowRate: number = 1;

    public isFirstSpawn: boolean = true;
    public isHero: boolean = false;
}