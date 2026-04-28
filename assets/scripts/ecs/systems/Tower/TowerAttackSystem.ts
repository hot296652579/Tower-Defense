
import { UITransform, Vec3 } from "cc";
import { GameRoot } from "../../../core/GameRoot";
import { ArrowTowerView } from "../../../game/tower/ArrowTowerView";
import { AttackComp } from "../../components/AttackComp";
import { AttributeComp } from "../../components/AttributeComp";
import { CampComp, CampType } from "../../components/CampComp";
import { StateComp } from "../../components/StateComp";
import { ArrowTowerComp } from "../../components/Tower/ArrowTowerComp";
import { TowerComp } from "../../components/Tower/TowerComp";
import { System } from "../../core/System";
import { EntityState } from "../../core/World";

/**箭塔攻击系统*/
export class TowerAttackSystem extends System {

    update(dt: number) {

        const towers = this.world.getEntitiesWith(TowerComp, AttributeComp, ArrowTowerComp);

        for (const tid of towers) {

            const tower = this.world.getComponent(tid, TowerComp)!;
            const attr = this.world.getComponent(tid, AttributeComp)!;
            const attack = this.world.getComponent(tid, AttackComp)!;

            tower.time += dt;

            // console.log(`[TowerAttackSystem] ${tid} → ${tower.time} / ${attr.attackInterval}`);

            if (tower.time < attr.attackInterval) continue;
            tower.time = 0;

            const towerNode = this.world.getNode(tid);

            let target = -1;
            let minDist = Infinity;

            const enemies = this.world.getEntitiesWith(CampComp, StateComp, AttackComp);

            for (const eid of enemies) {

                const camp = this.world.getComponent(eid, CampComp)!;
                const state = this.world.getComponent(eid, StateComp)!;


                if (camp.camp !== CampType.Enemy) continue;
                if (state.state === EntityState.Dead) continue;

                const targetNode = this.world.getNode(eid);

                const mapRoot = GameRoot.inst.MapRoot;
                const mapTrans = mapRoot.getComponent(UITransform)!;

                const worldPos = new Vec3();
                const localPos = new Vec3();
                mapTrans.convertToWorldSpaceAR(towerNode.worldPosition, worldPos);
                mapTrans.convertToNodeSpaceAR(worldPos, localPos);
                const dist = localPos.subtract(targetNode.worldPosition).length();
                if (dist < tower.range && dist < minDist) {
                    minDist = dist;
                    target = eid;
                    attack.target = eid;
                }
            }

            if (target === -1) continue;

            towerNode.getComponent(ArrowTowerView).arrowAttack();
        }
    }
}