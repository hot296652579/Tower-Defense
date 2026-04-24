import { _decorator, Component } from 'cc';
import { StateComp } from '../../ecs/components/StateComp';
import { EntityState, World } from '../../ecs/core/World';
import { AttackSystem } from '../../ecs/systems/AttackSystem';
import { SkillSystem } from '../../ecs/systems/SkillSystem';

const { ccclass } = _decorator;

// 动画事件代理中转
@ccclass('AnimationEventProxy')
export class AnimationEventProxy extends Component {

    private _entity = -1;

    start() {

        //从父节点拿 entityId
        const parent = this.node.parent!;
        this._entity = parent["entityId"];

    }

    /** 普攻命中 */
    onAttackHit() {

        World.inst.getSystem(AttackSystem).hit(this._entity);

    }

    /** 普攻结束 */
    onAttackEnd() {

        const state = World.inst.getComponent(this._entity, StateComp)!;
        state.changeState(EntityState.Idle);

    }

    /** 技能命中 */
    onSkillHit(skillName: string) {

        World.inst.getSystem(SkillSystem).hit(this._entity, skillName);

    }

    /** 技能结束 */
    onSkillEnd() {

        const state = World.inst.getComponent(this._entity, StateComp)!;
        state.changeState(EntityState.Idle);

    }

}