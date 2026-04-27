/**
 * 行为倾向
*/
export enum BehaviorType {
    /*** 被动（玩家）*/
    Passive,
    /*** 主动（怪物）*/
    Aggressive,
    /*** 守卫*/
    Guard,
    /*** 巡逻（怪物）*/
    Patrol,
    /*** 召唤（怪物）*/
    Summon,
    /*** boss（怪物）*/
    Boss
}

export class BehaviorComp {
    type: BehaviorType = BehaviorType.Passive
}