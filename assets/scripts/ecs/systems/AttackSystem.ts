import { AttackComp } from "../components/AttackComp"
import { AttributeComp } from "../components/AttributeComp"
import { System } from "../core/System"
import { AttackType } from "../define/AttackType"

export class AttackSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(AttackComp, AttributeComp)

        entities.forEach(eid => {

            const attackComp = this.world.getComponent(eid, AttackComp)!
            const attr = this.world.getComponent(eid, AttributeComp)!

            if (attackComp.target === -1) return

            attackComp.timer += dt

            if (attackComp.timer < attackComp.interval) return

            attackComp.timer = 0

            const node = this.world.getNode(eid)

            const view = node.getComponent("PlayerView")
                || node.getComponent("EnemyView")

            // view?.playAttack()

        })

    }

    /** 动画事件触发 */
    hit(eid: number) {

        const attackComp = this.world.getComponent(eid, AttackComp)!
        if (attackComp.target === -1) return

        const attackerAttr = this.world.getComponent(eid, AttributeComp)!
        const targetId = attackComp.target

        const targetAttr = this.world.getComponent(targetId, AttributeComp)!
        const targetNode = this.world.getNode(targetId)

        let damage = 0

        if (attackComp.type === AttackType.PHYSICAL) {
            damage = attackerAttr.attack - targetAttr.defense
        } else {
            damage = attackerAttr.magicAttack - targetAttr.magicDefense
        }

        damage = Math.max(1, damage)

        targetAttr.hp -= damage

        targetNode.emit("onHurt")

    }

}