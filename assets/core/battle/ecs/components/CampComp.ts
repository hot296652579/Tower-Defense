import { EntityType } from "../../data/UnitConfigType";
import EcsComponent from "../base/EcsComponent";

export default class CampComp extends EcsComponent {
    /** 阵营 */
    public camp: EntityType = EntityType.HERO;
}