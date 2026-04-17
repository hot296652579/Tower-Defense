import { Vec3 } from "cc";

export class PathNode {
    id: string | number;
    pos: Vec3;
    next: number | null;

    constructor(id: string | number, pos: Vec3, next: number | null) {
        this.id = id;
        this.pos = pos;
        this.next = next;
    }
}