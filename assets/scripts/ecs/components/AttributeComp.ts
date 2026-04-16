/**
 * 属性组件
 */
export class AttributeComp {

    hp: number;
    maxHp: number;

    attack: number;

    attackInterval: number = 1; // 攻速
    cd: number = 0;             // 当前CD

    constructor(hp: number, attack: number) {
        this.hp = hp;
        this.maxHp = hp;
        this.attack = attack;
    }

    isDead(): boolean {
        return this.hp <= 0;
    }
}