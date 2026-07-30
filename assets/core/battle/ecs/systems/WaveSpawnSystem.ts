import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import { LevelConfig, SpawnGroupRuntimeData, SpawnItemRuntimeData, WaveConfig, WaveState } from "../../data/LevelWaveType";
import EcsSystem from "../base/EcsSystem";
import BattleGlobalComp from "../components/BattleGlobalComp";
import WaveRuntimeComp from "../components/WaveRuntimeComp";
import { EnemyFactory } from "../factory/EnemyFactory";

/**
 * 波次刷怪系统
 * - initLevelWave：关卡/UI就绪后调用，只做数据初始化，不立刻刷怪
 * - startNextWave：UI 开波 / 自动开第一波时调用
 */
export default class WaveSpawnSystem extends EcsSystem {

    public update(dt: number): void {
        const globalEid = this.world.GLOBAL_ENTITY_ID;
        const waveRuntime = this.world.tryGetComponent(globalEid, WaveRuntimeComp);
        const globalBattle = this.world.tryGetComponent(globalEid, BattleGlobalComp);
        if (!waveRuntime || !globalBattle) return;

        // 未加载关卡 / 空闲 / 本波已刷完：不刷怪
        if (!waveRuntime.levelCfg) return;
        if (waveRuntime.waveState !== WaveState.SPAWNING) return;

        // dt 已在 BattleRoot 乘过 gameSpeed，这里不再重复乘
        this.tickAllSpawnGroup(dt, waveRuntime);

        if (this.checkWaveAllSpawnDone(waveRuntime) && !waveRuntime.waveRewardGiven) {
            this.onWaveSpawnFinished(waveRuntime, globalBattle);
        }
    }

    /** 初始化关卡波次*/
    public initLevelWave(levelCfg: LevelConfig): void {
        const globalEid = this.world.GLOBAL_ENTITY_ID;
        let waveRuntime = this.world.tryGetComponent(globalEid, WaveRuntimeComp);
        if (!waveRuntime) {
            waveRuntime = this.world.addComponent(globalEid, WaveRuntimeComp);
        }

        waveRuntime.levelCfg = levelCfg;
        waveRuntime.waveState = WaveState.IDLE;
        waveRuntime.curWaveCfg = null;
        waveRuntime.groupRuntimeList = [];
        waveRuntime.waveRewardGiven = false;

        const globalBattle = this.world.getComponent(globalEid, BattleGlobalComp);
        globalBattle.gold = levelCfg.initGold;
        globalBattle.baseMaxHp = levelCfg.baseMaxHp;
        globalBattle.baseHp = levelCfg.baseMaxHp;
        globalBattle.curWaveIndex = 0;
        globalBattle.canStartNextWave = true;

        EventManager.getInstance().emit(GameEvent.UI_GLOBAL_GOLD_CHANGE, {
            oldValue: 0,
            newValue: globalBattle.gold
        });
        EventManager.getInstance().emit(GameEvent.UI_GLOBAL_BASE_HP_CHANGE, {
            oldValue: 0,
            newValue: globalBattle.baseHp,
            maxHp: globalBattle.baseMaxHp
        });
        // 波次 UI：0 / N，等待开波
        EventManager.getInstance().emit(GameEvent.WAVE_CHANGE, null, 0, levelCfg.waves.length);
    }

    /** 开启下一波（UI 按钮 / 开战自动调用） */
    public startNextWave(): boolean {
        const globalEid = this.world.GLOBAL_ENTITY_ID;
        const waveRuntime = this.world.tryGetComponent(globalEid, WaveRuntimeComp);
        const globalBattle = this.world.tryGetComponent(globalEid, BattleGlobalComp);
        if (!waveRuntime || !globalBattle || !waveRuntime.levelCfg) {
            console.warn("WaveSpawnSystem.startNextWave: 波次未初始化");
            return false;
        }
        if (!globalBattle.canStartNextWave) return false;

        const waveList = waveRuntime.levelCfg.waves;
        const curIdx = globalBattle.curWaveIndex;
        if (curIdx >= waveList.length) {
            EventManager.getInstance().emit(GameEvent.BATTLE_WIN);
            return false;
        }

        const targetWave = waveList[curIdx];
        waveRuntime.curWaveCfg = targetWave;
        waveRuntime.waveState = WaveState.SPAWNING;
        waveRuntime.waveRewardGiven = false;
        globalBattle.canStartNextWave = false;

        const levelPaths = waveRuntime.levelCfg.paths ?? [];
        waveRuntime.groupRuntimeList = [];
        for (const groupCfg of targetWave.spawnGroups) {
            const groupRun = new SpawnGroupRuntimeData();
            groupRun.groupDelayTimer = groupCfg.delay;
            for (const itemCfg of groupCfg.list) {
                const itemRun = new SpawnItemRuntimeData();
                itemRun.pathsId = levelPaths.slice();
                itemRun.monsterId = itemCfg.monsterId;
                itemRun.totalCount = itemCfg.count;
                itemRun.spawnedCount = 0;
                // 组延迟结束后立刻刷第一只
                itemRun.spawnIntervalTimer = 0;
                itemRun.spawnInterval = itemCfg.spawnInterval > 0 ? itemCfg.spawnInterval : 1;
                groupRun.itemRuntimeList.push(itemRun);
            }
            waveRuntime.groupRuntimeList.push(groupRun);
        }

        EventManager.getInstance().emit(GameEvent.WAVE_START, targetWave, curIdx);
        EventManager.getInstance().emit(
            GameEvent.WAVE_CHANGE,
            targetWave,
            curIdx + 1,
            waveList.length
        );
        return true;
    }

    private tickAllSpawnGroup(dt: number, waveRuntime: WaveRuntimeComp): void {
        for (const groupRun of waveRuntime.groupRuntimeList) {
            if (groupRun.groupDelayTimer > 0) {
                groupRun.groupDelayTimer -= dt;
                if (groupRun.groupDelayTimer > 0) continue;
                groupRun.groupDelayTimer = 0;
            }
            this.tickSpawnItemList(dt, groupRun);
        }
    }

    private tickSpawnItemList(delta: number, groupRun: SpawnGroupRuntimeData): void {
        for (const itemRun of groupRun.itemRuntimeList) {
            if (itemRun.spawnedCount >= itemRun.totalCount) continue;

            itemRun.spawnIntervalTimer -= delta;
            if (itemRun.spawnIntervalTimer > 0) continue;

            this.spawnOneMonster(itemRun);
            itemRun.spawnedCount++;
            // 下一只间隔；若已刷完不再设置
            if (itemRun.spawnedCount < itemRun.totalCount) {
                itemRun.spawnIntervalTimer = itemRun.spawnInterval;
            }
        }
    }

    private spawnOneMonster(itemRun: SpawnItemRuntimeData): void {
        const paths = itemRun.pathsId;
        let pathId: string | undefined;
        if (paths && paths.length > 0) {
            pathId = paths[Math.floor(Math.random() * paths.length)];
        }
        const eid = EnemyFactory.createEnemy(itemRun.monsterId, pathId);
        if (eid > 0) {
            EventManager.getInstance().emit(GameEvent.ENEMY_SPAWN, eid, itemRun.monsterId);
        }
    }

    private checkWaveAllSpawnDone(waveRuntime: WaveRuntimeComp): boolean {
        for (const groupRun of waveRuntime.groupRuntimeList) {
            if (groupRun.groupDelayTimer > 0) return false;
            for (const itemRun of groupRun.itemRuntimeList) {
                if (itemRun.spawnedCount < itemRun.totalCount) return false;
            }
        }
        return true;
    }

    private onWaveSpawnFinished(waveRuntime: WaveRuntimeComp, globalBattle: BattleGlobalComp): void {
        const waveCfg = waveRuntime.curWaveCfg!;
        this.giveWaveReward(waveCfg, globalBattle);
        waveRuntime.waveRewardGiven = true;
        waveRuntime.waveState = WaveState.FINISH;
        globalBattle.canStartNextWave = true;
        // 指向下一波索引
        globalBattle.curWaveIndex += 1;

        EventManager.getInstance().emit(GameEvent.WAVE_ALL_SPAWN_FINISH, waveCfg);
        EventManager.getInstance().emit(GameEvent.WAVE_END, waveCfg);

        // 全部波次刷完（胜利仍需等场上怪清完，这里只标记波次刷怪结束）
        const levelCfg = waveRuntime.levelCfg!;
        if (globalBattle.curWaveIndex >= levelCfg.waves.length) {
            console.log("全部波次刷怪完成");
        }
    }

    private giveWaveReward(waveCfg: WaveConfig, globalBattle: BattleGlobalComp): void {
        const oldGold = globalBattle.gold;
        globalBattle.gold += waveCfg.rewardGold;
        EventManager.getInstance().emit(GameEvent.UI_GLOBAL_GOLD_CHANGE, {
            oldValue: oldGold,
            newValue: globalBattle.gold
        });
    }

    public clearWaveData(): void {
        const globalEid = this.world.GLOBAL_ENTITY_ID;
        if (this.world.tryGetComponent(globalEid, WaveRuntimeComp)) {
            this.world.removeComponent(globalEid, WaveRuntimeComp);
        }
    }
}
