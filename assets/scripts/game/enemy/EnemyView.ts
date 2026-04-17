import { _decorator, Component } from 'cc';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { MoveComp } from '../../ecs/components/MoveComp';
import { PathComp } from '../../ecs/components/PathComp';
import { StateComp } from '../../ecs/components/StateComp';
import { EntityState, World } from '../../ecs/core/World';
import { MapManager } from '../map/MapManager';

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
        World.inst.addComponent(this.entity, new MoveComp(this.speed));

        World.inst.addComponent(this.entity, new PathComp(MapManager.inst.getPathData()));

        // 动画
        // World.inst.addComponent(this.entity, new AnimationComp());

        // 攻击
        // World.inst.addComponent(this.entity, new AttackComp());

        // 状态
        const state = new StateComp();
        state.changeState(EntityState.Move);
        World.inst.addComponent(this.entity, state);

        World.inst.bindNode(this.entity, this.node);
    }
}