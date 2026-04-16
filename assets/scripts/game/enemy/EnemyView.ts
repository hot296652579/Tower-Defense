import { _decorator, Component } from 'cc';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { StateComp } from '../../ecs/components/StateComp';
import { EntityState, World } from '../../ecs/core/World';

const { ccclass, property } = _decorator;

@ccclass('EnemyView')
export class EnemyView extends Component {

    @property
    hp = 100;

    @property
    attack = 10;

    @property
    speed = 100;

    @property
    attackRange = 100;

    @property([String])
    skills: string[] = [];

    entity = -1;

    start() {

        this.entity = World.inst.createEntity();

        // 属性
        World.inst.addComponent(this.entity, new AttributeComp(this.hp, this.attack));

        // 移动
        // World.inst.addComponent(this.entity, new MoveComp(this.speed));

        // 状态
        const state = new StateComp();
        state.changeState(EntityState.Move);
        World.inst.addComponent(this.entity, state);

        // 技能
        // World.inst.addComponent(this.entity, new SkillComp(this.skills));

        // 目标
        // World.inst.addComponent(this.entity, new TargetComp(this.attackRange));

        World.inst.bindNode(this.entity, this.node);
    }
}