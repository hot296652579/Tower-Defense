import { TownerBuildPoint } from "./TownerBuildPoint";


/**
 * 塔防管理器
*/
export class TowerManager {

    static inst = new TowerManager();

    private points: TownerBuildPoint[] = [];

    init(points: TownerBuildPoint[]) {
        this.points = points;
    }

    getPoints() {
        return this.points;
    }

    getFreePoint(): TownerBuildPoint | null {
        return this.points.find(p => !p.occupied) ?? null;
    }

    occupy(point: TownerBuildPoint) {
        point.occupied = true;
    }
}