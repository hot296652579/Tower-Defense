import { AttackComp } from "../components/AttackComp"
import { AttributeComp } from "../components/AttributeComp"
import { StateComp } from "../components/StateComp"
import { System } from "../core/System"
import { EntityState } from "../core/World"
import { DamageSystem } from "./DamageSystem"

/**
 * 攻击系统
 * @description 有目标时，根据攻击间隔攻击目标，只改变状态
 */
export class AttackSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(AttackComp, AttributeComp)

        entities.forEach(eid => {

            const attackComp = this.world.getComponent(eid, AttackComp)!
            const stateComp = this.world.getComponent(eid, StateComp)!

            if (attackComp.target === -1) return

            attackComp.timer += dt

            // if (attackComp.timer < attackComp.interval) return

            // attackComp.timer = 0

            // stateComp.changeState(EntityState.Attack)
        })

    }

    /** 动画事件触发 */
    hit(eid: number) {

        const attackComp = this.world.getComponent(eid, AttackComp)!
        if (attackComp.target === -1) return

        const attackerAttr = this.world.getComponent(eid, AttributeComp)!

        const targetId = attackComp.target

        const damageSystem = this.world.getSystem(DamageSystem)

        damageSystem.apply({
            attacker: eid,
            target: targetId,
            type: attackComp.attackType,
            value: attackerAttr.attack
        })

    }

}