import EcsComponent from "../base/EcsComponent";

export default class HealerComp extends EcsComponent {
    /** 单次治疗量 */
    public healValue: number = 0;
    /** 治疗范围 */
    public healRange: number = 0;
    /** 治疗冷却 */
    public healInterval: number = 3;
    /** 当前冷却倒计时 */
    public healCd: number = 0;
}