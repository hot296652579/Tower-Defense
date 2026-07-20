/**
 * 全局事件名枚举
 */
export enum GameEvent {
    // 通用弹窗提示
    SHOW_TIPS = "SHOW_TIPS",

    // 经济金币
    GOLD_CHANGE = "GOLD_CHANGE",

    // 炮塔建造相关
    TOWER_BUILD_CLICK = "TOWER_BUILD_CLICK",
    TOWER_UPGRADE = "TOWER_UPGRADE",
    TOWER_SELL = "TOWER_SELL",
    TOWER_SELECT = "TOWER_SELECT",

    // 敌人&波次
    WAVE_START = "WAVE_START",
    WAVE_END = "WAVE_END",
    ENEMY_SPAWN = "ENEMY_SPAWN",
    ENEMY_DIE = "ENEMY_DIE",

    // 战斗流程
    BATTLE_START = "BATTLE_START",
    BATTLE_WIN = "BATTLE_WIN",
    BATTLE_LOSE = "BATTLE_LOSE",

    // 资源加载
    RES_LOAD_FINISH = "RES_LOAD_FINISH",
}