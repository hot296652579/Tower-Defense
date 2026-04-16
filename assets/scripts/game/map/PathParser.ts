import { Vec3 } from 'cc';
import { PathData } from './PathData';
import { PathNode } from './PathNode';
import { TiledMapLike, TiledProperty } from './tiled/TiledTypes';

export const PathPropKey = {
    NEXT: 'next',
    START: 'start',
    END: 'end'
} as const;

export class PathParser {

    static parse(tiledMap: TiledMapLike): PathData {

        const pathData = new PathData();

        const group = tiledMap.getObjectGroup('path');
        const objects = group.getObjects();

        for (const obj of objects) {

            const id = obj.id;
            const x = obj.x;
            const y = obj.y;

            const props = obj.properties ?? [];

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
        }

        return pathData;
    }

    private static getNumberProp(props: TiledProperty[], key: string): number | null {
        const p = props.find(p => p.name === key);
        return p ? Number(p.value) : null;
    }

    private static getBooleanProp(props: TiledProperty[], key: string): boolean {
        const p = props.find(p => p.name === key);
        return p ? Boolean(p.value) : false;
    }
}