import { UnitType } from "../../data/UnitConfigType";
import EcsComponent from "../base/EcsComponent";

export default class HeroComp extends EcsComponent {
    /** 英雄配置表ID */
    public configId: number = 0;
    /** 单位类型 melee/ranger/healer/buffer */
    public unitType: UnitType = UnitType.MELEE;
}