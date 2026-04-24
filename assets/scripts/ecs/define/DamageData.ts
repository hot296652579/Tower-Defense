// ecs/define/DamageData.ts

import { AttackType } from "./AttackType"

/**
 * 伤害数据
 * @description 伤害数据，包含伤害类型、伤害值、攻击者、目标者
 */
export interface DamageData {

    type: AttackType
    value: number

    attacker: number
    target: number

}