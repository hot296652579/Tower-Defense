import { SkillExecutor } from "../../game/skill/SkillExecutor"
import { SkillComp } from "../components/SkillComp"
import { System } from "../core/System"

export class SkillSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(SkillComp)

        entities.forEach(eid => {

            const comp = this.world.getComponent(eid, SkillComp)!

            comp.cooldown.forEach((cd, key) => {

                if (cd > 0) {
                    comp.cooldown.set(key, cd - dt)
                }

            })

        })

    }

    useSkill(eid: number, skillName: string) {

        const comp = this.world.getComponent(eid, SkillComp)!
        const skill = comp.skills.get(skillName)

        if (!skill) return

        const cd = comp.cooldown.get(skillName)!
        if (cd > 0) return

        comp.cooldown.set(skillName, skill.interval)

        const node = this.world.getNode(eid)

        const view = node.getComponent("PlayerView")
            || node.getComponent("EnemyView")

        // view?.playSkill(skillName)

    }

    /** 动画事件 */
    hit(eid: number, skillName: string) {

        const comp = this.world.getComponent(eid, SkillComp)!
        const skill = comp.skills.get(skillName)

        if (!skill) return

        SkillExecutor.hit(this.world, eid, skill)

    }

}