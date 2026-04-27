import { UITransform, Vec3 } from "cc";
import { GameRoot } from "../../../core/GameRoot";
import { MapManager } from "../../../game/map/MapManager";
import { PlayerFactory } from "../../../game/player/PlayerFactory";
import { AttributeComp } from "../../components/AttributeComp";
import { BarrackComp } from "../../components/Tower/BarrackTowerComp";
import { TowerComp } from "../../components/Tower/TowerComp";
import { System } from "../../core/System";
import { UnitType } from "../../define/UnitType";

/**兵营塔系统*/
export class BarrackSystem extends System {

    update(dt: number) {

        const list = this.world.getEntitiesWith(TowerComp, AttributeComp, BarrackComp);

        for (const eid of list) {

            let attrComp = this.world.getComponent(eid, AttributeComp)!;
            let barrackComp = this.world.getComponent(eid, BarrackComp)!;

            if (barrackComp.current >= barrackComp.maxSoldier) continue;

            barrackComp.timer += dt;
            if (barrackComp.timer < attrComp.attackInterval) continue;
            barrackComp.timer = 0;

            const need = barrackComp.maxSoldier - barrackComp.current;

            for (let i = 0; i < need; i++) {
                this.spawnSoldier(eid);
                barrackComp.current++;
            }
        }
    }

    private spawnSoldier(eid: number) {

        const node = this.world.getNode(eid);
        if (!node || !node.isValid) return;

        const mapRoot = GameRoot.inst.MapRoot;
        const mapTrans = mapRoot.getComponent(UITransform)!;

        //把塔的 world 坐标 → 转成 MapRoot local
        const towerLocalPos = new Vec3();
        mapTrans.convertToNodeSpaceAR(node.worldPosition, towerLocalPos);

        let nearestPos: Vec3 | null = null;
        let minDist = Infinity;

        const paths = MapManager.inst.getPaths();

        paths.forEach(path => {

            path.nodes.forEach(p => {
                const dx = towerLocalPos.x - p.pos.x;
                const dy = towerLocalPos.y - p.pos.y;
                const dist = dx * dx + dy * dy;

                if (dist < minDist) {
                    minDist = dist;
                    nearestPos = p.pos;
                }

            });

        });

        if (!nearestPos) {
            console.warn("❌ 未找到路径点");
            return;
        }

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 60;

        const spawnPos = new Vec3(
            nearestPos.x + Math.cos(angle) * radius,
            nearestPos.y + Math.sin(angle) * radius,
            nearestPos.z
        );

        PlayerFactory.create(
            'Warrior',
            spawnPos,
            UnitType.Warrior
        );
    }
}