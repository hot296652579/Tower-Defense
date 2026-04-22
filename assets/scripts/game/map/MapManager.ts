import { Mat4, TiledMap, Vec3 } from 'cc';
import { TowerManager } from '../../mgr/TowerManager';
import { PathData } from './PathData';
import { PathParser } from './PathParser';
import { RoadPolygon } from './RoadPolygon';
import { TowerPointParser } from './TowerPointParser';

export class MapManager {

    static inst = new MapManager();

    private pathData!: PathData;
    private tiledMap!: TiledMap;
    private paths: Map<number, PathData> = new Map();
    private roadPolygons: RoadPolygon[] = [];
    private worldMat: Mat4 = new Mat4();

    /** 初始化地图 */
    init(tiledMap: TiledMap): void {
        this.tiledMap = tiledMap;
        this.tiledMap.node.getWorldMatrix(this.worldMat);
        this.paths = PathParser.parse(tiledMap);

        const points = TowerPointParser.parse(tiledMap);
        TowerManager.inst.init(points);
    }

    /** 获取路径数据 */
    getPathData(): PathData {
        return this.getRandomPath();
    }

    /** 设置道路多边形 */
    setRoadPolygons(polygons: RoadPolygon[]) {
        this.roadPolygons = polygons;
    }

    /** 获取道路多边形 */
    getRoadPolygons() {
        return this.roadPolygons;
    }

    /** 获取节点 */
    getNode(id: number) {
        return this.pathData.getNode(id);
    }

    /** 获取地图节点*/
    getTiledMapNode() {
        return this.tiledMap.node;
    }

    /** 获取随机路径*/
    getRandomPath(): PathData {
        const arr = Array.from(this.paths.values());

        if (!arr.length) {
            throw new Error('❌ 没有路径');
        }
        console.log('获取的随机路径:', arr[Math.floor(Math.random() * arr.length)]);
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**本地 转 世界坐标 */
    toWorldPos(localPos: Vec3) {
        const out = new Vec3();
        Vec3.transformMat4(out, localPos, this.worldMat);
        return out;
    }

    toWorldXY(x: number, y: number) {
        return this.toWorldPos(new Vec3(x, y, 0));
    }

    /** 清理（切关卡用） */
    clear(): void {
        this.pathData = null;
    }
}