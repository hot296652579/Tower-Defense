
import { AttributeComp } from "../../components/AttributeComp";
import { CampComp, CampType } from "../../components/CampComp";
import { StateComp } from "../../components/StateComp";
import { ArrowTowerComp } from "../../components/Tower/ArrowTowerComp";
import { TowerComp } from "../../components/Tower/TowerComp";
import { System } from "../../core/System";
import { EntityState } from "../../core/World";
import { AttackType } from "../../define/AttackType";
import { DamageSystem } from "../DamageSystem";

/**箭塔攻击系统*/
export class TowerAttackSystem extends System {

    update(dt: number) {

        const towers = this.world.getEntitiesWith(TowerComp, AttributeComp, ArrowTowerComp);

        for (const tid of towers) {

            const tower = this.world.getComponent(tid, TowerComp)!;
            const attr = this.world.getComponent(tid, AttributeComp)!;
            const arrow = this.world.getComponent(tid, ArrowTowerComp)!;

            tower.time += dt;

            if (tower.time < tower.attackInterval) continue;
            tower.time = 0;

            const towerNode = this.world.getNode(tid);

            let target = -1;
            let minDist = Infinity;

            const enemies = this.world.getEntitiesWith(CampComp, StateComp);

            for (const eid of enemies) {

                const camp = this.world.getComponent(eid, CampComp)!;
                const state = this.world.getComponent(eid, StateComp)!;

                if (camp.camp !== CampType.Enemy) continue;
                if (state.state === EntityState.Dead) continue;

                const node = this.world.getNode(eid);

                // const dist = towerNode.worldPosition.distance(node.worldPosition);

                // if (dist < tower.range && dist < minDist) {
                //     minDist = dist;
                //     target = eid;
                // }
            }

            if (target === -1) continue;

            tower.attackInterval = 0;

            // ⭐ 直接伤害（后面可以换子弹）
            this.world.getSystem(DamageSystem).apply({
                attacker: tid,
                target,
                type: AttackType.PHYSICAL,
                value: attr.attack
            });

            // 👉 TODO：播放射箭动画 / 子弹
        }
    }
}