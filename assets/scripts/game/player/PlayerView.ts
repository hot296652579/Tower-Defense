import { _decorator, Component } from 'cc';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { World } from '../../ecs/core/World';
import { AttackType } from '../../ecs/define/AttackType';
import { SkillData } from '../skill/SkillData';

const { ccclass, property } = _decorator;

@ccclass('PlayerView')
export class PlayerView extends Component {

    @property({ displayName: '生命值' })
    hp = 100;

    @property({ displayName: '最大生命值' })
    hpMax = 100;

    @property({ displayName: '物理攻击' })
    attack = 10;
    @property({ displayName: '物理防御' })
    defense = 10;

    @property({ displayName: '魔法攻击' })
    magicAttack = 10;
    @property({ displayName: '魔法防御' })
    magicDefense = 10;

    @property({ displayName: '移动速度' })
    speed = 100;

    @property({ displayName: '攻击范围' })
    attackRange = 100;

    @property({ displayName: '攻击间隔' })
    attackInterval = 1;

    entity = -1;

    skills: SkillData[] = [
        {
            name: "skill_0",
            description: "火球术是一种魔法攻击，对目标造成魔法伤害",
            damage: 80,
            range: 10,
            interval: 1.5,
            type: AttackType.MAGIC
        },
        {
            name: "skill_1",
            description: "挥砍是一种物理攻击，对目标造成物理伤害",
            damage: 30,
            range: 2,
            interval: 0.6,
            type: AttackType.PHYSICAL
        }
    ];

    start() { }

    init(entity: number) {
        this.entity = entity;

        const world = World.inst;
        const e = world.getEntity(entity);

        const attributeComp = new AttributeComp();

        //把属性值映射到属性组件
        attributeComp.hp = this.hp;
        attributeComp.maxHp = this.hpMax;
        attributeComp.attack = this.attack;
        attributeComp.defense = this.defense;
        attributeComp.magicAttack = this.magicAttack;
        attributeComp.magicDefense = this.magicDefense;
        attributeComp.speed = this.speed;
        attributeComp.attackRange = this.attackRange;
        attributeComp.attackInterval = this.attackInterval;
        attributeComp.skillIds = this.skills;

        //添加属性组件到实体
        world.addComponent(entity, attributeComp);
    }
}