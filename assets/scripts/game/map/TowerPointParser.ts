import { TiledMap, UITransform, Vec3 } from "cc";
import { GameRoot } from "../../core/GameRoot";
import { TownerBuildPoint } from "../tower/TownerBuildPoint";

export class TowerPointParser {

    static parse(tiledMap: TiledMap): TownerBuildPoint[] {

        const result: TownerBuildPoint[] = [];

        const group = tiledMap.getObjectGroup('tower_points');
        if (!group) return result;

        const mapRoot = GameRoot.inst.MapRoot;

        const objects = group.getObjects();

        for (const obj of objects) {

            const props = obj.properties ?? {};
            const radius = +props['radius'];

            const rawX = obj.x;
            const rawY = obj.y;

            const worldPos = new Vec3(rawX, rawY, 0);
            const localPos = mapRoot
                .getComponent(UITransform)
                .convertToNodeSpaceAR(worldPos);

            result.push(
                new TownerBuildPoint(
                    +obj.id,
                    localPos,
                    radius
                )
            );
        }

        return result;
    }
}