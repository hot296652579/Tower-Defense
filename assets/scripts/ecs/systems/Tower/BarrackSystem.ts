import { AttributeComp } from "../../components/AttributeComp";
import { BarrackComp } from "../../components/Tower/BarrackTowerComp";
import { TowerComp } from "../../components/Tower/TowerComp";
import { System } from "../../core/System";


export class BarrackSystem extends System {

    update(dt: number) {

        const list = this.world.getEntitiesWith(TowerComp, AttributeComp, BarrackComp);

        for (const eid of list) {

            let attrComp = this.world.getComponent(eid, AttributeComp)!;
            let barrackComp = this.world.getComponent(eid, BarrackComp)!;

            if (barrackComp.current >= barrackComp.maxSoldier) continue;

            barrackComp.timer += dt;
            if (barrackComp.timer < attrComp.attackInterval) continue;
            barrackComp.timer = 0;

            const need = barrackComp.maxSoldier - barrackComp.current;

            for (let i = 0; i < need; i++) {
                this.spawnSoldier(eid);
                barrackComp.current++;
            }
        }
    }

    private spawnSoldier(eid: number) {

        // ⭐ 这里先留接口
        console.log("生成士兵 from tower:", eid);

        // TODO:
        // 找最近路径点
        // 创建士兵（用你已有 Player/EnemyFactory 或新 SoldierFactory）
    }
}