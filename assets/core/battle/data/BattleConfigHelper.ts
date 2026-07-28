import { ConfigManager } from "../../../framework/config/ConfigManager";
import EcsWorld from "../ecs/base/EcsWorld";
import HeroComp from "../ecs/components/HeroComp";
import EnemyComp from "../ecs/components/EnemyComp";
import CampComp from "../ecs/components/CampComp";
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
}