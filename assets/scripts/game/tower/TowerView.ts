import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('TowerView')
export class TowerView extends Component {

    @property({ displayName: '物理攻击' })
    attack = 10;

    @property({ displayName: '魔法攻击' })
    magicAttack = 10;

    @property({ displayName: '攻击范围' })
    attackRange = 100;

    @property({ type: [String], displayName: '技能' })
    skills: string[] = [];

    entity = -1;

    start() {
    }

    init(entity: number) {
        this.entity = entity;
    }
}