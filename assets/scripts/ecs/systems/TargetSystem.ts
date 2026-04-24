import { Vec3 } from 'cc'
import { AttackComp } from '../components/AttackComp'
import { AttributeComp } from '../components/AttributeComp'
import { System } from '../core/System'

export class TargetSystem extends System {

    update(dt: number) {

        const attackers = this.world.getEntitiesWith(AttackComp, AttributeComp)
        const targets = this.world.getEntitiesWith(AttributeComp)

        attackers.forEach(aid => {

            const attackComp = this.world.getComponent(aid, AttackComp)!
            const aNode = this.world.getNode(aid)

            let nearest = -1
            let minDist = Infinity

            targets.forEach(tid => {

                if (aid === tid) return

                const tNode = this.world.getNode(tid)

                const dist = Vec3.distance(
                    aNode.worldPosition,
                    tNode.worldPosition
                )

                if (dist < attackComp.range && dist < minDist) {

                    minDist = dist
                    nearest = tid

                }

            })

            attackComp.target = nearest

        })

    }

}