import { Vec3 } from "cc";

export class PathNode {
    id: number;
    pos: Vec3;
    next: number | null;
    isStart?: boolean;
    isEnd?: boolean;

    constructor(id: number, pos: Vec3, next: number | null, isStart?: boolean, isEnd?: boolean) {
        this.id = id;
        this.pos = pos;
        this.next = next;
        this.isStart = isStart;
        this.isEnd = isEnd;
    }
}