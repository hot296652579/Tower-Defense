import { instantiate, Prefab } from "cc";
import { AssetManagerEx } from "../../core/AssetManagerEx";
import { GameRoot } from "../../core/GameRoot";
import { StateComp } from "../../ecs/components/StateComp";
import { World } from "../../ecs/core/World";
import { TowerManager } from "../../mgr/TowerManager";
import { TowerView } from "./TowerView";
import { TownerBuildPoint } from "./TownerBuildPoint";

export class TowerFactory {

    static async create(point: TownerBuildPoint) {

        const prefab = await AssetManagerEx.inst.load<Prefab>(
            'character',
            'prefabs/tower/tower',
            Prefab
        );

        const node = instantiate(prefab);
        GameRoot.inst.TowerRoot.addChild(node);

        // ECS
        const entity = World.inst.createEntity();
        World.inst.bindNode(entity, node);
        World.inst.addComponent(entity, new StateComp());

        // 设置位置
        node.setWorldPosition(point.pos);

        // 标记占用
        TowerManager.inst.occupy(point);

        const view = node.getComponent(TowerView)!;
        view.init(entity);
    }
}