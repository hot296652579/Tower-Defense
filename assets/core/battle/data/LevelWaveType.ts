/** 单个怪物刷怪单元 */
export interface SpawnMonsterItem {
    monsterId: number;
    count: number;
    spawnInterval: number;
}

/** 延迟刷怪组，同一波次可多组错开生成 */
export interface SpawnGroup {
    delay: number;
    list: SpawnMonsterItem[];
}

/** 单波次配置 */
export interface WaveConfig {
    waveLocalId: number;
    waveName: string;
    spawnGroups: SpawnGroup[];
    rewardGold: number;
    tipText: string;
}

/** 星级通关规则 */
export interface StarRuleConfig {
    star1: number;
    star2: number;
    star3: number;
}

/** 完整关卡配置表一行 */
export interface LevelConfig {
    id: number;
    levelName: string;
    mapAssetPath: string;
    initGold: number;
    baseMaxHp: number;
    starRule: StarRuleConfig;
    unlockTowerIdList: number[];
    unlockHeroIdList: number[];
    passRewardGold: number;
    paths: string[];
    waves: WaveConfig[];
}

/** 单个刷怪组运行时数据 */
export class SpawnGroupRuntimeData {
    // 组延迟倒计时
    public groupDelayTimer: number = 0;
    // 该组下所有怪物生成单元运行数据
    public itemRuntimeList: SpawnItemRuntimeData[] = [];
}

/** 单个怪物生成单元运行时数据 */
export class SpawnItemRuntimeData {
    public monsterId: number = 0;
    public totalCount: number = 0;
    public spawnedCount: number = 0;
    public pathsId: string[] = [];
    /** 配置的刷怪间隔（秒） */
    public spawnInterval: number = 1;
    public spawnIntervalTimer: number = 0;
}

/** 当前波次运行时状态 */
export enum WaveState {
    IDLE = 0,       // 空闲，等待手动开启下一波
    SPAWNING = 1,   // 正在刷怪
    FINISH = 2      // 当前波次全部怪物生成完毕，等待下一波
}