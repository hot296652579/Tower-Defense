import { _decorator, Node, Vec2 } from "cc";
const { ccclass } = _decorator;

/** 单条路径数据 */
export type PathPointList = Vec2[];

@ccclass
export default class MapPathData {
    // key: pathId ("path_0","path_1") value:路径点位数组（世界坐标）
    private _pathDict: Map<string, PathPointList> = new Map();

    /** 从地图节点解析所有路径 */
    public parseFromMapNode(mapRoot: Node): void {
        const pathContainer = mapRoot.getChildByName("_map");
        if (!pathContainer) {
            console.error("地图缺少 _map 路径容器节点");
            return;
        }
        this._pathDict.clear();
        // 遍历所有path子节点
        pathContainer.children.forEach(pathNode => {
            const pointList: Vec2[] = [];
            pathNode.children.forEach(pointNode => {
                const pos = pointNode.worldPosition;
                pointList.push(new Vec2(pos.x, pos.y));
            });
            if (pointList.length > 0) {
                this._pathDict.set(pathNode.name, pointList);
                console.log(`解析路径:${pathNode.name},点位数量:${pointList.length}`);
            }
        });
    }

    /** 获取一条路径所有点位 */
    public getPathPoints(pathId: string): PathPointList | null {
        return this._pathDict.get(pathId) ?? null;
    }

    /** 获取路径起点坐标（索引0） */
    public getPathStartPos(pathId: string): Vec2 | null {
        const list = this.getPathPoints(pathId);
        if (!list || list.length === 0) return null;
        return list[0].clone();
    }
}