import { TiledMap, TiledObjectGroup, UITransform, Vec2, Vec3 } from 'cc';
import { GameRoot } from '../../core/GameRoot';
import { RoadPolygon } from './RoadPolygon';

export class RoadPolygonParser {

    static parse(tiledMap: TiledMap): RoadPolygon[] {

        const result: RoadPolygon[] = [];

        const group: TiledObjectGroup | null = tiledMap.getObjectGroup('road_polygon');

        if (!group) {
            console.warn('⚠️ 没有 road_polygon 图层');
            return result;
        }

        const mapRoot = GameRoot.inst.MapRoot;
        const uiTrans = mapRoot.getComponent(UITransform);

        const objects = group.getObjects();

        for (const obj of objects) {

            // ❗polygon 在 Cocos 里是 points
            if (!obj.points || obj.points.length < 3) continue;

            const pts: Vec2[] = [];

            for (const p of obj.points) {

                const world = new Vec3(
                    obj.x + p.x,
                    obj.y + p.y,
                    0
                );
                const local = uiTrans.convertToNodeSpaceAR(world);
                pts.push(new Vec2(local.x, local.y));
            }

            result.push(new RoadPolygon(Number(obj.id), pts));
        }

        return result;
    }
}