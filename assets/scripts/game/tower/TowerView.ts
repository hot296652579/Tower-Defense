import { _decorator, Component, Enum } from 'cc';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { World } from '../../ecs/core/World';
import { AttackType } from '../../ecs/define/AttackType';
import { TowerType } from '../../ecs/define/TowerType';
import { SkillData } from '../skill/SkillData';

const { ccclass, property } = _decorator;

@ccclass('TowerView')
export class TowerView extends Component {

    @property({ displayName: '物理攻击' })
    attack = 60;

    @property({ displayName: '魔法攻击' })
    magicAttack = 50;

    @property({ displayName: '攻击范围' })
    attackRange = 100;

    @property({ displayName: '攻击间隔' })
    attackInterval = 3;

    @property({ type: Enum(TowerType), displayName: '塔类型' })
    towerType = TowerType.Arrow;

    entity = -1;
    targetId = -1;

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

    start() {
    }

    init(entity: number) {
        this.entity = entity;
    }

    upgrade() {
        const tower = World.inst.getComponent(this.entity, AttributeComp);
        if (!tower) {
            return;
        }

        tower.level++;
        // TODO: 升级 提升属性 改变样式 
    }
}