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

/**
 * 行为倾向组件
 * 用于描述塔的行为倾向，如被动、主动、守卫、巡逻、召唤、boss等。
*/
export class BehaviorComp {
    type: BehaviorType = BehaviorType.Passive
}