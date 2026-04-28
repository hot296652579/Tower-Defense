
import { CombatDebug } from "../../game/CombatDebug";
import { AttributeComp } from "../components/AttributeComp";
import { System } from "../core/System";

import { AttackType } from "../define/AttackType";
import { DamageData } from "../define/DamageData";

export class DamageSystem extends System {

    apply(data: DamageData) {

        CombatDebug.attack(data.attacker, "造成伤害", {
            target: data.target,
            value: data.value
        });

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
            node.emit("onDead")
        }
    }

    update(dt: number): void { }

}