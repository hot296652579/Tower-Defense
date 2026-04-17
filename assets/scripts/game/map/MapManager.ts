import { TiledMap } from 'cc';
import { PathData } from './PathData';
import { PathParser } from './PathParser';

export class MapManager {

    static inst = new MapManager();

    private pathData!: PathData;
    private tiledMap!: TiledMap;

    /** 初始化地图 */
    init(tiledMap: TiledMap): void {
        this.tiledMap = tiledMap;
        this.pathData = PathParser.parse(tiledMap);
    }

    /** 获取路径数据 */
    getPathData(): PathData {
        return this.pathData;
    }

    /** 获取起点 */
    getStartId(): string | number {
        return this.pathData.startId;
    }

    /** 获取终点 */
    getEndId(): string | number {
        return this.pathData.endId;
    }

    /** 获取节点 */
    getNode(id: number) {
        return this.pathData.getNode(id);
    }

    /** 获取地图节点*/
    getTiledMapNode() {
        return this.tiledMap.node;
    }

    /** 清理（切关卡用） */
    clear(): void {
        this.pathData = null;
    }
}