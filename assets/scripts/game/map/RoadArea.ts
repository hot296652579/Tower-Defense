
import { Vec2 } from 'cc';

export class RoadArea {

    id: number;

    // 多边形点
    points: Vec2[];

    constructor(id: number, points: Vec2[]) {
        this.id = id;
        this.points = points;
    }

    /**点是否在多边形内
     * @param point 点
     * @returns 是否在多边形内
    */
    contains(point: Vec2): boolean {

        let inside = false;

        const pts = this.points;

        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {

            const xi = pts[i].x, yi = pts[i].y;
            const xj = pts[j].x, yj = pts[j].y;

            const intersect =
                ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

            if (intersect) inside = !inside;
        }

        return inside;
    }
}