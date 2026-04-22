import { TiledMap, TiledObjectGroup, Vec2 } from 'cc';
import { RoadArea } from './RoadArea';

export class RoadAreaParser {

    static parse(tiledMap: TiledMap): RoadArea[] {

        const result: RoadArea[] = [];

        const group: TiledObjectGroup | null = tiledMap.getObjectGroup('road_area');

        if (!group) {
            console.warn('⚠️ 没有 road_area 图层');
            return result;
        }

        const objects = group.getObjects();

        for (const obj of objects) {

            if (!obj.points || obj.points.length < 3) continue;

            const pts: Vec2[] = [];

            for (const p of obj.points) {

                const x = obj.x + p.x;
                const y = obj.y + p.y;

                pts.push(new Vec2(x, y));
            }

            result.push(new RoadArea(Number(obj.id), pts));
        }

        return result;
    }
}