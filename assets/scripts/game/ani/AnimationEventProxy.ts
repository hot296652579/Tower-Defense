import { _decorator, Component } from 'cc';
import { AttackComp } from '../../ecs/components/AttackComp';
import { SkillComp } from '../../ecs/components/SkillComp';
import { World } from '../../ecs/core/World';
import { AttackSystem } from '../../ecs/systems/AttackSystem';
import { SkillSystem } from '../../ecs/systems/SkillSystem';

const { ccclass } = _decorator;

// 动画事件代理中转
@ccclass('AnimationEventProxy')
export class AnimationEventProxy extends Component {

    private _entity = -1;

    start() {
        this._entity = this.node.parent["entityId"];
    }

    /** 普攻命中 */
    onAttackHit() {
        // console.log('onAttackHit', this._entity);
        World.inst.getSystem(AttackSystem).hit(this._entity);

    }

    /** 普攻结束 */
    onAttackEnd() {
        const attack = World.inst.getComponent(this._entity, AttackComp)

        if (!attack) return

        attack.lockTarget = -1 //重置目标锁

    }

    /** 技能命中 */
    onSkillHit(skillName: string) {

        World.inst.getSystem(SkillSystem).hit(this._entity, skillName);

    }

    /** 技能结束 */
    onSkillEnd() {
        const skill = World.inst.getComponent(this._entity, SkillComp)

        if (skill) {
            skill.isCasting = false
        }
    }

}