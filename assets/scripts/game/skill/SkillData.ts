
import { AttackType } from "../../ecs/define/AttackType"

/**
 * 技能数据
 * @param name 技能名称
 * @param damage 伤害值
 * @param range 伤害范围
 * @param interval 伤害间隔
 * @param type 伤害类型
*/
export interface SkillData {
    name: string
    description: string
    damage: number
    range: number
    interval: number
    type: AttackType
}