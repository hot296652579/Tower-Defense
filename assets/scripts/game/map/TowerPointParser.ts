import { TiledMap, Vec3 } from "cc";
import { TownerBuildPoint } from "../tower/TownerBuildPoint";

export class TowerPointParser {

    static parse(tiledMap: TiledMap): TownerBuildPoint[] {

        const result: TownerBuildPoint[] = [];

        const group = tiledMap.getObjectGroup('tower_points');
        if (!group) {
            console.warn('⚠️ 没有 tower_points 图层');
            return result;
        }

        const objects = group.getObjects();
        for (const obj of objects) {

            const x = obj.x;
            const y = obj.y;

            result.push(
                new TownerBuildPoint(
                    +obj.id,
                    new Vec3(x, y, 0)
                )
            );
        }

        return result;
    }
}