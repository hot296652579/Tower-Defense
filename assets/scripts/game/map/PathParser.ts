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
    static parse(tiledMap: TiledMap): Map<number, PathData> {
        const result = new Map<number, PathData>();

        const group: TiledObjectGroup | null = tiledMap.getObjectGroup('enemy_path');

        if (!group) {
            console.error('❌ 未找到 path 图层');
            return result;
        }

        const objects = group.getObjects();
        //全部节点先放一起
        const nodeMap = new Map<number, PathNode>();
        for (const obj of objects) {
            const id = Number(obj.id);
            const props = obj.properties ?? {};

            const nextId = this.getNumberProp(props, PathPropKey.NEXT);
            const isStart = this.getBooleanProp(props, PathPropKey.START);
            const isEnd = this.getBooleanProp(props, PathPropKey.END);
            nodeMap.set(id, new PathNode(
                id,
                new Vec3(obj.x, obj.y, 0),
                nextId === 0 ? null : nextId,
                isStart,
                isEnd
            ));
        }

        //找到所有起点
        const starts = [...nodeMap.values()].filter(node => node.isStart);

        let pathIndex = 0;

        for (const start of starts) {
            const path = new PathData();
            path.startId = Number(start.id);

            let current = start;
            while (current) {
                path.nodes.set(+current.id, new PathNode(
                    current.id,
                    current.pos,
                    current.next
                ))

                if (current.isEnd) {
                    path.endId = Number(current.id);
                    break;
                }

                if (current.next == null) break;

                current = nodeMap.get(current.next);
            }

            result.set(pathIndex++, path);
        }

        return result;

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