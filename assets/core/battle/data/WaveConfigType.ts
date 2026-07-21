
export interface WaveItem {
    monsterId: number;
    count: number;
    spawnInterval: number;
}

export interface WaveSpawnGroup {
    delay: number;
    list: WaveItem[];
}

export interface WaveConfig {
    waveId: number;
    waveName: string;
    spawnGroups: WaveSpawnGroup[];
    rewardGold: number;
    tipText: string;
}