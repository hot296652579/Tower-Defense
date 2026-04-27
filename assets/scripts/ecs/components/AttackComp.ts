import { AttackType } from "../define/AttackType"

/**
 * 攻击组件
 * @param attack 攻击力
 * @param range 攻击范围
 * @param interval 攻击间隔
 * @param type 攻击类型
*/
export class AttackComp {

    attack: number = 0
    range: number = 0
    interval: number = 1
    attackType: AttackType = AttackType.PHYSICAL

    timer: number = 0
    target: number = -1

    lockTarget: number = -1
}