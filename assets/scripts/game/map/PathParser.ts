import { TiledMap, TiledObjectGroup, Vec3 } from 'cc';
import { PathData } from './PathData';
import { PathNode } from './PathNode';

export const PathPropKey = {
    NEXT: 'next',
    START: 'start',
    END: 'end'
} as const;

type TiledProps = Record<string, string | number | boolean>;

export class PathParser {

    /**
     * 解析路径
     * @param tiledMap Tiled地图
     * @returns 路径数据
     * @ {PathData} pathData 路径数据
    */
    static parse(tiledMap: TiledMap): PathData {

        const pathData = new PathData();

        const group: TiledObjectGroup | null = tiledMap.getObjectGroup('path');

        if (!group) {
            console.error('❌ 未找到 path 图层');
            return pathData;
        }

        const objects = group.getObjects();

        for (const obj of objects) {

            const id = obj.id;
            const x = obj.x;
            const y = obj.y;

            const props = (obj.properties ?? {}) as TiledProps;

            const next = this.getNumberProp(props, PathPropKey.NEXT);
            const isStart = this.getBooleanProp(props, PathPropKey.START);
            const isEnd = this.getBooleanProp(props, PathPropKey.END);

            const node = new PathNode(
                id,
                new Vec3(x, y, 0),
                next
            );

            pathData.nodes.set(id, node);

            if (isStart) {
                pathData.startId = id;
            }

            if (isEnd) {
                pathData.endId = id;
            }
        }

        return pathData;
    }

    /** 读取 number */
    private static getNumberProp(props: TiledProps, key: string): number | null {
        const value = props[key];

        if (value === undefined) return null;

        const num = Number(value);
        return isNaN(num) ? null : num;
    }

    /** 读取 boolean */
    private static getBooleanProp(props: TiledProps, key: string): boolean {
        const value = props[key];

        if (value === undefined) return false;

        if (typeof value === 'boolean') return value;

        return value === 'true';
    }
}