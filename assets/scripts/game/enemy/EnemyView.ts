import { _decorator, CCString, Component } from 'cc';

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

    @property({ type: [CCString], displayName: '技能' })
    skills: string[] = [];

    entity = -1;

    start() { }

    init(entity: number) {
        this.entity = entity;
    }
}