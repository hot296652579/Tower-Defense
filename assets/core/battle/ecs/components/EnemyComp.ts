import { UnitType } from "../../data/UnitConfigType";
import EcsComponent from "../base/EcsComponent";

export default class EnemyComp extends EcsComponent {
    /** 怪物配置表ID */
    public configId: number = 0;
    /** 单位类型 melee/ranger/healer/buffer */
    public unitType: UnitType = UnitType.MELEE;
    /** 死亡掉落金币 */
    public goldDrop: number = 0;
}