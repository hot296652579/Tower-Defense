export enum CampType {
    Player,
    Enemy
}

/** 阵营组件 
 * @param camp 阵营类型
 * @description CampType.Player 玩家阵营
 * @description CampType.Enemy 敌人阵营
*/
export class CampComp {
    camp: CampType;

    constructor(camp: CampType) {
        this.camp = camp;
    }
}