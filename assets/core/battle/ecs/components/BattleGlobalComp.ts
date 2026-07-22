import EcsComponent from "../base/EcsComponent";

export default class BattleGlobalComp extends EcsComponent {
    /** 当前金币 */
    public gold: number = 200;
    /** 基地剩余血量 */
    public baseHp: number = 20;
    /** 基地最大血量 */
    public baseMaxHp: number = 20;
    /** 当前关卡波次索引 */
    public curWaveIndex: number = 0;
    /** 是否允许开启下一波 */
    public canStartNextWave: boolean = true;
    /** 游戏倍速 1 / 2 */
    public gameSpeed: number = 1;
    /** 是否暂停 */
    public isPause: boolean = false;
}