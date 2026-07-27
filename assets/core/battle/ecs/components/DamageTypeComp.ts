import { DamageType } from "../../data/UnitConfigType";
import EcsComponent from "../base/EcsComponent";

export default class DamageTypeComp extends EcsComponent {
    /** 伤害类型：物理/魔法 */
    public damageType: DamageType = DamageType.PHYSIC;
}