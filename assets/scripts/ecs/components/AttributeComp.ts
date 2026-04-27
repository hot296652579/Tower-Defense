import { SkillData } from "../../game/skill/SkillData";

/**
 * 属性组件
 */
export class AttributeComp {
    level: number = 1;

    hp: number;
    maxHp: number;

    attack: number = 0; // 物理攻击
    defense: number = 0; // 物理防御
    magicAttack: number = 0; // 魔法攻击
    magicDefense: number = 0; // 魔法防御

    speed: number = 0; // 移动速度

    attackInterval: number = 1; // 攻击间隔

    attackRange: number = 0;

    skillIds: SkillData[] = [];

    isDead(): boolean {
        return this.hp <= 0;
    }
}