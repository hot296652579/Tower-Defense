import { WaveSpawnGroup } from "./WaveConfigType";

export interface LevelWaveItem {
    waveLocalId: number;       // 本关卡内波次序号 1、2、3...
    waveName: string;
    spawnGroups: WaveSpawnGroup[];
    rewardGold: number;
    tipText: string;
}

/** 关卡三星评价条件（KR风格） */
export interface LevelStarRule {
    star1: number; // 一星：基地剩余血量 ≥ X
    star2: number; // 二星：基地剩余血量 ≥ X
    star3: number; // 三星：基地满血通关
}

/** 关卡主配置 */
export interface LevelConfig {
    levelId: number;                  // 关卡唯一ID 1~10
    levelName: string;                // 关卡名称
    mapAssetPath: string;             // game分包地图prefab路径
    initGold: number;                 // 开局金币
    baseMaxHp: number;                // 基地最大血量
    starRule: LevelStarRule;          // 星级判定
    waves: LevelWaveItem[];           // 当前关卡全部波次序列
    unlockTowerIdList: number[];      // 本关可使用炮塔id列表
    unlockHeroIdList: number[];       // 本关可用英雄
    passRewardGold: number;           // 关卡通关一次性奖励
}