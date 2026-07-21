
/** 单位类型 */
export enum UnitType {
    MELEE = "melee",    // 近战战士
    RANGER = "ranger",  // 远程法师
    HEALER = "healer",  // 治疗辅助
    BUFFER = "buffer"   // BUFF增益辅助
}

/** 伤害类型 */
export enum DamageType {
    PHYSIC = "physic",  // 物理伤害
    MAGIC = "magic"     // 法术伤害
}

/** BUFF类型 */
export enum BuffType {
    ATK_UP = "atk_up",     // 攻击力提升
    SPEED_UP = "speed_up", // 移速提升
    DEF_UP = "def_up",     // 防御提升
    HEAL_PER_SEC = "hps"   // 持续回血
}

/** 单位基础通用配置 */
export interface BaseUnitConfig {
    id: number;                  // 唯一ID
    name: string;                // 名称
    unitType: UnitType;          // 单位类型（近战/远程/治疗/buff）
    hp: number;                  // 最大血量
    def: number;                 // 防御力（减伤系数）
    moveSpeed: number;           // 移动速度
    atk: number;                 // 基础攻击力
    atkInterval: number;         // 攻击间隔（秒）
    atkRange: number;            // 攻击判定范围
    damageType: DamageType;      // 伤害类型
    animKey: string;             // 动画集名（idle/walk/attack/hurt/dead）
    prefabPath: string;          // game分包内预制体路径
    goldDrop: number;            // 死亡掉落金币（怪物生效，英雄无效）
}

export interface MeleeUnitCfg extends BaseUnitConfig {
    unitType: UnitType.MELEE;
    blockRate: number; // 格挡概率 0~1 格挡减少50%伤害
}

export interface RangerUnitCfg extends BaseUnitConfig {
    unitType: UnitType.RANGER;
    bulletPath: string; // 子弹预制体路径(game分包)
    bulletSpeed: number; // 子弹飞行速度
    splashRadius?: number; // 可选：溅射伤害范围
}

export interface HealerUnitCfg extends BaseUnitConfig {
    unitType: UnitType.HEALER;
    healValue: number;      // 单次治疗量
    healRange: number;      // 治疗友军范围
    healInterval: number;   // 治疗冷却
}

export interface BufferUnitCfg extends BaseUnitConfig {
    unitType: UnitType.BUFFER;
    buffType: BuffType;     // 增益类型
    buffValue: number;      // 增益数值
    buffDuration: number;   // BUFF持续时间(秒)
    buffRange: number;      // BUFF生效范围
}

export type UnitConfig = MeleeUnitCfg | RangerUnitCfg | HealerUnitCfg | BufferUnitCfg;