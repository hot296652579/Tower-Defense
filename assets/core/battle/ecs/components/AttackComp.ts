import { DamageType } from "../../data/UnitConfigType";
import EcsComponent from "../base/EcsComponent";

export default class AttackComp extends EcsComponent {
    /** 攻击力 */
    public atk: number = 0;
    /** 攻击范围 */
    public atkRange: number = 0;
    /** 攻击间隔（秒） */
    public atkInterval: number = 1;
    /** 当前冷却倒计时 */
    public atkCd: number = 0;
    /** 伤害类型：物理/魔法 */
    public damageType: DamageType = DamageType.PHYSIC;
    /** 是否正在攻击（用来切换FSM攻击状态） */
    public isAttacking: boolean = false;
    /** 当前锁定目标实体ID */
    public targetEntityId: number = 0;
}