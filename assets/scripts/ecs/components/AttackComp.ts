/**
 * 攻击组件
 * @param dmg 攻击力
 * @param range 攻击范围
*/
export class AttackComp {
    damage: number;
    range: number;

    constructor(dmg: number, range: number) {
        this.damage = dmg;
        this.range = range;
    }
}