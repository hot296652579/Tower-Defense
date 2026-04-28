import { Vec2 } from "cc";

/**
 * 移动组件
 */
export class MoveComp {

    speed: number;
    moveOffset: Vec2 = new Vec2(0, 0)

    constructor(speed: number) {
        this.speed = speed;
    }
}