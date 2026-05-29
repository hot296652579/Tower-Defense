import { AnimDir, AnimState, UnitType } from "./AnimDefine";

// 按单位类型 + 状态 + 方向 → 自动生成动画名
export const AnimNameMap: Record<UnitType, Record<AnimState, (dir: AnimDir) => string>> = {
    // 地面士兵：仅左右
    [UnitType.SOLDIER]: {
        [AnimState.IDLE]: (d: AnimDir) => `idle_${d === AnimDir.LEFT ? 'left' : 'right'}`,
        [AnimState.MOVE]: (d: AnimDir) => `move_${d === AnimDir.LEFT ? 'left' : 'right'}`,
        [AnimState.ATTACK]: (d: AnimDir) => `attack_${d === AnimDir.LEFT ? 'left' : 'right'}`,
        [AnimState.DEAD]: () => 'dead',
    },

    // 塔防士兵：8方向
    [UnitType.TURRET]: {
        [AnimState.IDLE]: (d: AnimDir) => `idle_${d}`,
        [AnimState.MOVE]: (d: AnimDir) => `move_${d}`,
        [AnimState.ATTACK]: (d: AnimDir) => `attack_${d}`,
        [AnimState.DEAD]: () => 'dead',
    },

    // 怪物：移动4方向，攻击仅左右
    [UnitType.MONSTER]: {
        [AnimState.IDLE]: (d: AnimDir) => `idle_${d}`,
        [AnimState.MOVE]: (d: AnimDir) => `move_${d}`,
        [AnimState.ATTACK]: () => 'attack_right', // 或根据方向取左右
        [AnimState.DEAD]: () => 'dead',
    },
};