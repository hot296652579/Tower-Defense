import { _decorator } from 'cc';
import { AttackType } from '../../ecs/define/AttackType';
import { SkillData } from '../skill/SkillData';
import { BaseView } from './BaseView';

const { ccclass, property } = _decorator;

@ccclass('PlayerView')
export class PlayerView extends BaseView {

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

    protected start(): void {

    }
}
