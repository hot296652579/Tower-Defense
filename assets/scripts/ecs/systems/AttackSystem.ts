import { CombatDebug } from "../../game/CombatDebug"
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

            if (attackComp.target === -1) return

            const targetState = this.world.getComponent(attackComp.target, StateComp)

            if (!targetState || targetState.state === EntityState.Dead) {
                attackComp.target = -1
                attackComp.lockTarget = -1
                return
            }

            attackComp.timer += dt
        })

    }

    /** 动画事件触发 */
    hit(eid: number) {

        const attackComp = this.world.getComponent(eid, AttackComp)!
        const attackerAttr = this.world.getComponent(eid, AttributeComp)!

        if (attackComp.target === -1) return

        const targetId = attackComp.lockTarget

        CombatDebug.attack(eid, "命中触发", {
            target: attackComp.target,
            lockTarget: attackComp.lockTarget
        });

        if (targetId === -1) {
            CombatDebug.attack(eid, "❌ 没有锁定目标");
            return;
        }

        const targetState = this.world.getComponent(targetId, StateComp)!
        if (!targetState || targetState.state === EntityState.Dead) {
            CombatDebug.attack(eid, "❌ 目标已死亡");
            return;
        }

        if (attackComp.timer < attackComp.interval) {
            CombatDebug.attack(eid, "❌ 非法命中（CD未到）");
            return;
        }

        CombatDebug.attack(eid, "✅ 命中成功", targetId);
        const damageSystem = this.world.getSystem(DamageSystem)

        damageSystem.apply({
            attacker: eid,
            target: targetId,
            type: attackComp.attackType,
            value: attackerAttr.attack
        })

        attackComp.timer = 0
        attackComp.lockTarget = -1
    }

}