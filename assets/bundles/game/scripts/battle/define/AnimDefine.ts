/**
 * 动画状态枚举
 */
export enum AnimState {
    IDLE = 'idle',
    MOVE = 'move',
    ATTACK = 'attack',
    DEAD = 'dead',
}

/**
 * 8方向朝向枚举
 */
export enum AnimDir {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
    UP_LEFT = 'up_left',
    UP_RIGHT = 'up_right',
    DOWN_LEFT = 'down_left',
    DOWN_RIGHT = 'down_right',
}

/**
 * 单位类型枚举
 */
export enum UnitType {
    SOLDIER = 'soldier',     // 地面士兵（2方向）
    TURRET = 'turret',       // 塔上士兵（8方向）
    MONSTER = 'monster',     // 怪物（移动4，攻击2）
}