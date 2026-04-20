/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2026-04-20 21:51:28
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2026-04-20 22:38:41
 * @FilePath: /Tower-Defense/assets/scripts/game/map/TowerPointParser.ts
 * @Description: 解析 tiledMap 中的 tower_points 图层，生成塔位数据
 */
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

            const props = obj.properties ?? {};
            const radius = +props['radius'] ?? 80;

            const x = obj.x;
            const y = obj.y;

            result.push(
                new TownerBuildPoint(
                    +obj.id,
                    new Vec3(x, y, 0),
                    radius
                )
            );
        }

        return result;
    }
}