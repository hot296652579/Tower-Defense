import { BuffType } from "../../data/UnitConfigType";
import EcsComponent from "../base/EcsComponent";

export default class BufferComp extends EcsComponent {
    public buffType: BuffType = BuffType.ATK_UP;
    /** buff数值（倍率/固定值） */
    public buffValue: number = 0;
    /** buff持续时间 */
    public buffDuration: number = 4;
    /** buff生效范围 */
    public buffRange: number = 280;
    /** 生效冷却 */
    public buffInterval: number = 5;
    public buffCd: number = 0;
}