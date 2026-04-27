import { TowerType } from "../../define/TowerType"

export class TowerComp {

    type: TowerType = TowerType.Arrow

    level: number = 1

    range: number = 200

    attackInterval: number = 1 // 攻击间隔

    time: number = 0 //当前攻击时间

}