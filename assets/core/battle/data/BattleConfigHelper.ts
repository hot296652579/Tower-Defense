import { ConfigManager } from "../../../framework/config/ConfigManager";
import EcsWorld from "../ecs/base/EcsWorld";
import CampComp from "../ecs/components/CampComp";
import EnemyComp from "../ecs/components/EnemyComp";
import HeroComp from "../ecs/components/HeroComp";
import { TowerConfig, TowerUpgradeData } from "./TowerDataType";
import { EntityType } from "./UnitConfigType";

/** 单位子弹/特效配置返回结构 */
export type UnitBulletConfig = {
    bulletPath: string;
    hitEffectPath: string;
    effectPath: string;
};

export class BattleConfigHelper {
    /**
     * 根据实体ID读取对应配置表
     * @param world ECS世界实例
     * @param entityId 单位实体ID
     * @returns 子弹、特效资源路径
     */
    public static getBattleByBulletConfig(world: EcsWorld, entityId: number): UnitBulletConfig {
        const campComp = world.getComponent(entityId, CampComp);
        // 英雄单位
        if (campComp.camp === EntityType.HERO) {
            const heroComp = world.getComponent(entityId, HeroComp);
            const cfg = ConfigManager.getInstance().getRowById("hero_table", heroComp.configId);
            return {
                bulletPath: cfg.bulletPath ?? "",
                hitEffectPath: cfg.bulletEffectPath ?? "",
                effectPath: cfg.effectPath ?? ""
            };
        }
        // 怪物单位
        if (campComp.camp === EntityType.ENEMY) {
            const enemyComp = world.getComponent(entityId, EnemyComp);
            const cfg = ConfigManager.getInstance().getRowById("enemy_table", enemyComp.configId);
            return {
                bulletPath: cfg.bulletPath ?? "",
                hitEffectPath: cfg.bulletEffectPath ?? "",
                effectPath: cfg.effectPath ?? ""
            };
        }
        // 无匹配单位，返回空路径
        return { bulletPath: "", hitEffectPath: "", effectPath: "" };
    }

    /**
     * 获取塔升到下一级需要金币
     * @param cfg 塔配置
     * @param curLevel 当前等级
     */
    public getTowerNextUpgradeCost(cfg: TowerConfig, curLevel: number): number | null {
        const maxLv = cfg.upgradeList.length + 1;
        if (curLevel >= maxLv) return null;
        const idx = curLevel - 1;
        return cfg.upgradeList[idx].cost;
    }

    /**
     * 获取塔从1级升到当前等级，所有升级累计花费
     */
    public getTowerTotalUpgradeCost(cfg: TowerConfig, curLevel: number): number {
        let total = 0;
        for (let i = 0; i < curLevel - 1; i++) {
            total += cfg.upgradeList[i].cost;
        }
        return total;
    }

    /**
     * 获取塔全部累计投入金币（建造+全部升级）
     */
    public getTowerTotalInvestGold(cfg: TowerConfig, curLevel: number): number {
        const upgradeCost = this.getTowerTotalUpgradeCost(cfg, curLevel);
        return cfg.buildCost + upgradeCost;
    }

    /**
     * 获取当前等级全部属性增量
     */
    public getTowerLevelAddData(cfg: TowerConfig, curLevel: number): TowerUpgradeData {
        const addData: TowerUpgradeData = {};
        for (let i = 0; i < curLevel - 1; i++) {
            const data = cfg.upgradeList[i];
            // 累加所有等级增量
            addData.cost = curLevel == 1 ? cfg.buildCost : cfg.upgradeList[curLevel - 1].cost;
            addData.atkAdd = (addData.atkAdd ?? 0) + (data.atkAdd ?? 0);
            addData.atkRangeAdd = (addData.atkRangeAdd ?? 0) + (data.atkRangeAdd ?? 0);
            addData.atkIntervalAdd = (addData.atkIntervalAdd ?? 0) + (data.atkIntervalAdd ?? 0);
            addData.splashRadiusAdd = (addData.splashRadiusAdd ?? 0) + (data.splashRadiusAdd ?? 0);
            addData.spawnIntervalAdd = (addData.spawnIntervalAdd ?? 0) + (data.spawnIntervalAdd ?? 0);
            addData.maxUnitAdd = (addData.maxUnitAdd ?? 0) + (data.maxUnitAdd ?? 0);
        }
        return addData;
    }
}