import { Vec3 } from "cc";

export class TownerBuildPoint {
    id: number;
    pos: Vec3;
    /** 是否已建塔 */
    occupied = false;

    constructor(id: number, pos: Vec3) {
        this.id = id;
        this.pos = pos;
    }
}