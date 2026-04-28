import { AttackType } from "../define/AttackType"

/**
 * 攻击组件
 * @param attack 攻击力
 * @param range 攻击范围
 * @param currentInterval 当前攻击间隔
 * @param type 攻击类型
 * @param target 目标实体ID
*/
export class AttackComp {

    attack: number = 0
    range: number = 0
    currentInterval: number = 0
    attackType: AttackType = AttackType.PHYSICAL

    target: number = -1

    lockTarget: number = -1
}