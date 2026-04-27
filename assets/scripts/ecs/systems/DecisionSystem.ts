import { AttackComp } from "../components/AttackComp"
import { BehaviorComp, BehaviorType } from "../components/BehaviorComp"
import { SkillComp } from "../components/SkillComp"
import { StateComp } from "../components/StateComp"
import { System } from "../core/System"
import { EntityState } from "../core/World"

export class DecisionSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(StateComp)

        for (const eid of entities) {

            const stateComp = this.world.getComponent(eid, StateComp)!

            const nextState = this.decide(eid)

            if (nextState !== stateComp.state) {
                stateComp.changeState(nextState)
            }
        }
    }

    private decide(eid: number): EntityState {

        const stateComp = this.world.getComponent(eid, StateComp)!
        const attack = this.world.getComponent(eid, AttackComp)
        const skill = this.world.getComponent(eid, SkillComp)

        if (stateComp.state === EntityState.Dead) {
            return EntityState.Dead
        }

        if (skill && skill.isCasting) {
            return EntityState.Skill
        }

        //攻击判断
        if (attack) {
            console.log('有攻击者 目标id:', attack.target);
            // 目标存在
            if (attack.target !== -1) {

                const targetState = this.world.getComponent(attack.target, StateComp)

                // 目标还活着
                if (targetState && targetState.state !== EntityState.Dead) {

                    //攻击CD是否好了（是否准备出手）
                    if (attack.timer >= attack.interval) {
                        return EntityState.Attack
                    }

                    return EntityState.Idle
                }
            }

            //目标不存在 / 已死亡 → 清空
            attack.target = -1
        }

        const behaviorComp = this.world.getComponent(eid, BehaviorComp)!

        if (behaviorComp.type === BehaviorType.Passive) {
            return EntityState.Idle
        }

        // 默认行走状态
        return EntityState.Move
    }
}