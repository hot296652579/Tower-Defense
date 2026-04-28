import { AttackType } from "../define/AttackType"

/**
 * 攻击组件
 * @param attack 攻击力
 * @param range 攻击范围
 * @param interval 攻击间隔
 * @param type 攻击类型
 * @param timer 攻击CD定时器
 * @param target 目标实体ID
 * @param lockTarget 锁定目标实体ID
 * @param searchCooldown 击杀目标后重新寻找目标的冷却时间
*/
export class AttackComp {

    attack: number = 0
    range: number = 0
    interval: number = 1
    attackType: AttackType = AttackType.PHYSICAL

    timer: number = 0
    target: number = -1

    lockTarget: number = -1

    searchCooldown: number = 0 // 重新寻找目标的冷却时间
    searchCooldownDuration: number = 1 // 冷却持续时间
}