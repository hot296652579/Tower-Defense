import { Vec3 } from 'cc'
import { AttackComp } from '../components/AttackComp'
import { CampComp } from '../components/CampComp'
import { StateComp } from '../components/StateComp'
import { System } from '../core/System'
import { EntityState } from '../core/World'

/**
 * 目标系统   DOTO:后续做四叉树优化⭐⭐⭐⭐⭐
 * @description 目标系统负责更新攻击目标，包括选择最近目标、检查目标是否还活着等，寻找目标
 */
export class TargetSystem extends System {

    update(dt: number) {

        const attackers = this.world.getEntitiesWith(AttackComp, CampComp)
        const all = this.world.getEntitiesWith(CampComp)

        attackers.forEach(aid => {

            const attack = this.world.getComponent(aid, AttackComp)!
            const aCamp = this.world.getComponent(aid, CampComp)!
            const aNode = this.world.getNode(aid)

            // 更新冷却时间
            if (attack.searchCooldown > 0) {
                attack.searchCooldown -= dt
                return
            }

            //正在攻击 → 不允许换目标
            if (attack.lockTarget !== -1) {
                return
            }

            //已有目标且还活着 → 不换
            if (attack.target !== -1) {
                const targetState = this.world.getComponent(attack.target, StateComp)

                if (targetState && targetState.state !== EntityState.Dead) {
                    return
                }
            }

            let nearest = -1
            let minDist = Infinity

            all.forEach(tid => {

                if (aid === tid) return

                const tCamp = this.world.getComponent(tid, CampComp)!

                // 同阵营不攻击
                if (tCamp.camp === aCamp.camp) return

                const tState = this.world.getComponent(tid, StateComp)
                // 已死亡的目标不选择
                if (tState && tState.state === EntityState.Dead) return

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