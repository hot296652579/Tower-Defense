import { Vec3 } from "cc"
import { AttributeComp } from "../../ecs/components/AttributeComp"
import { AttackType } from "../../ecs/define/AttackType"

export class SkillExecutor {

    static hit(world, eid: number, skill) {

        const attackerAttr = world.getComponent(eid, AttributeComp)!
        const aNode = world.getNode(eid)

        const targets = world.getEntitiesWith(AttributeComp)

        targets.forEach(tid => {

            if (tid === eid) return

            const tNode = world.getNode(tid)

            const dist = Vec3.distance(
                aNode.worldPosition,
                tNode.worldPosition
            )

            if (dist <= skill.range) {

                const targetAttr = world.getComponent(tid, AttributeComp)!

                let damage = 0

                if (skill.type === AttackType.PHYSICAL) {

                    damage = attackerAttr.attack * skill.ratio + skill.baseDamage
                    damage -= targetAttr.defense

                } else {

                    damage = attackerAttr.magicAttack * skill.ratio + skill.baseDamage
                    damage -= targetAttr.magicDefense

                }

                damage = Math.max(1, damage)

                targetAttr.hp -= damage

                tNode.emit("onHurt")

            }

        })

    }

}