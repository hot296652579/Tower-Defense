import { PathData } from './PathData';
import { PathParser } from './PathParser';
import { TiledMapLike } from './tiled/TiledTypes';

export class MapManager {

    static inst = new MapManager();

    private pathData!: PathData;

    /** 初始化地图 */
    init(tiledMap: TiledMapLike): void {
        this.pathData = PathParser.parse(tiledMap);
    }

    /** 获取路径数据 */
    getPathData(): PathData {
        return this.pathData;
    }

    /** 获取起点 */
    getStartId(): number {
        return this.pathData.startId;
    }

    /** 获取节点 */
    getNode(id: number) {
        return this.pathData.getNode(id);
    }

    /** 清理（切关卡用） */
    clear(): void {
        this.pathData = null;
    }
}