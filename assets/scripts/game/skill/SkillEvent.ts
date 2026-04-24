import { World } from "../../ecs/core/World"
import { AttackSystem } from "../../ecs/systems/AttackSystem"
import { SkillSystem } from "../../ecs/systems/SkillSystem"

export class SkillEvent {
    static onAttackHit(node) {

        const world = World.inst
        const eid = node["entityId"]

        world.getSystem(AttackSystem).hit(eid)

    }

    static onSkillHit(node, skillName: string) {

        const world = World.inst
        const eid = node["entityId"]

        world.getSystem(SkillSystem).hit(eid, skillName)

    }
}

