import { Vec2 } from "cc";
import EcsComponent from "../base/EcsComponent";

export default class TransformComp extends EcsComponent {
    /** 世界坐标 */
    public pos: Vec2 = new Vec2(0, 0);
    /** 朝向，正数朝右，负数朝左，控制精灵翻转 */
    public faceDir: number = 1;
}