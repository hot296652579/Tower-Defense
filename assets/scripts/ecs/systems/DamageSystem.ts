
import { AttributeComp } from "../components/AttributeComp"
import { StateComp } from "../components/StateComp"
import { System } from "../core/System"
import { EntityState } from "../core/World"

import { AttackType } from "../define/AttackType"
import { DamageData } from "../define/DamageData"

export class DamageSystem extends System {

    apply(data: DamageData) {

        const attackerAttr = this.world.getComponent(data.attacker, AttributeComp)!
        const targetAttr = this.world.getComponent(data.target, AttributeComp)!

        let damage = data.value

        //统一防御计算
        if (data.type === AttackType.PHYSICAL) {

            damage -= targetAttr.defense

        } else {

            damage -= targetAttr.magicDefense

        }

        damage = Math.max(1, damage)

        targetAttr.hp -= damage

        const node = this.world.getNode(data.target)

        node.emit("onHurt", damage)

        if (targetAttr.hp <= 0) {

            targetAttr.hp = 0

            const state = this.world.getComponent(data.target, StateComp)
            state?.changeState(EntityState.Dead)

            node.emit("onDead")
        }

    }

    update(dt: number): void {

    }

}