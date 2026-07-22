import EcsComponent from "../base/EcsComponent";

export default class HPComp extends EcsComponent {
    /** 最大血量 */
    public maxHp: number = 100;
    /** 当前血量 */
    public curHp: number = 100;
    /** 防御力，用来参与减伤计算 */
    public def: number = 0;
    /** 是否受伤（用来驱动FSM切换受伤状态） */
    public isHurt: boolean = false;
    /** 受伤硬直剩余时间（秒） */
    public hurtCd: number = 0;
}