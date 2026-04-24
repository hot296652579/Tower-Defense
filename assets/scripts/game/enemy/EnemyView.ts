import { _decorator, Component } from 'cc';
import { AttackType } from '../../ecs/define/AttackType';
import { SkillData } from '../skill/SkillData';

const { ccclass, property } = _decorator;

@ccclass('EnemyView')
export class EnemyView extends Component {

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

    entity = -1;

    start() { }

    init(entity: number) {
        this.entity = entity;
    }
}