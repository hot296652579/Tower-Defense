/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2026-04-20 21:51:28
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2026-04-20 22:40:54
 * @FilePath: /Tower-Defense/assets/scripts/game/tower/TowerFactory.ts
 * @Description: 创建塔的工厂，负责实例化塔的预制资源，并绑定 ECS 组件
 */
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
            'tower',
            'prefabs/TowerBlue',
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