import { Vec3 } from 'cc'
import { AttackComp } from '../components/AttackComp'
import { CampComp } from '../components/CampComp'
import { System } from '../core/System'

/**
 * 目标系统   DOTO:后续做四叉树优化⭐⭐⭐⭐⭐
 */
export class TargetSystem extends System {

    update(dt: number) {

        const attackers = this.world.getEntitiesWith(AttackComp, CampComp)
        const all = this.world.getEntitiesWith(CampComp)

        attackers.forEach(aid => {

            const attack = this.world.getComponent(aid, AttackComp)!
            const aCamp = this.world.getComponent(aid, CampComp)!
            const aNode = this.world.getNode(aid)

            let nearest = -1
            let minDist = Infinity

            all.forEach(tid => {

                if (aid === tid) return

                const tCamp = this.world.getComponent(tid, CampComp)!

                // 同阵营不攻击
                if (tCamp.camp === aCamp.camp) return

                const tNode = this.world.getNode(tid)

                const dist = Vec3.distance(
                    aNode.worldPosition,
                    tNode.worldPosition
                )

                if (dist < attack.range && dist < minDist) {

                    minDist = dist
                    nearest = tid

                }

            })

            attack.target = nearest

        })

    }

}