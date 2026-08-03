import { TowerType } from "./TowerType";

// TowerDataType.ts
export interface TowerUpgradeData {
    cost?: number;
    // 属性增量，按需扩充，不存在即为0
    atkAdd?: number;
    atkRangeAdd?: number;
    atkIntervalAdd?: number;
    splashRadiusAdd?: number;
    spawnIntervalAdd?: number;
    maxUnitAdd?: number;
}

export interface TowerConfig {
    towerId: number;
    name: string;
    towerType: TowerType;
    buildCost: number;
    sellRatio: number;
    buildTime: number;
    prefabPath: string;

    // 兵营塔
    spawnUnitId?: number;
    spawnInterval?: number;
    maxUnitCount?: number;
    unitStandRange?: number;

    // 箭塔
    mountUnitId?: number;

    // 火炮塔
    atk?: number;
    atkRange?: number;
    atkInterval?: number;
    splashRadius?: number;
    bulletPath?: string;

    upgradeList: TowerUpgradeData[];
}