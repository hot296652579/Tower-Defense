/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2026-04-20 21:51:28
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2026-04-20 22:17:28
 * @FilePath: /Tower-Defense/assets/scripts/game/tower/TownerBuildPoint.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Vec3 } from "cc";

export class TownerBuildPoint {
    id: number;
    pos: Vec3;
    /** 是否已建塔 */
    occupied = false;
    radius = 0;

    constructor(id: number, pos: Vec3, radius = 0) {
        this.id = id;
        this.pos = pos;
        this.radius = radius;
    }
}