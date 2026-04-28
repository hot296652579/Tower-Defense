/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2026-04-20 21:51:28
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2026-04-20 22:57:37
 * @FilePath: /Tower-Defense/assets/scripts/game/tower/TowerFactory.ts
 * @Description: 创建塔的工厂，负责实例化塔的预制资源，并绑定 ECS 组件
 */
import { instantiate, Prefab, UITransform } from "cc";
import { AssetManagerEx } from "../../core/AssetManagerEx";
import { GameRoot } from "../../core/GameRoot";
import { AttackComp } from "../../ecs/components/AttackComp";
import { AttributeComp } from "../../ecs/components/AttributeComp";
import { BehaviorComp } from "../../ecs/components/BehaviorComp";
import { StateComp } from "../../ecs/components/StateComp";
import { ArrowTowerComp } from "../../ecs/components/Tower/ArrowTowerComp";
import { BarrackComp } from "../../ecs/components/Tower/BarrackTowerComp";
import { TowerComp } from "../../ecs/components/Tower/TowerComp";
import { World } from "../../ecs/core/World";
import { TowerType } from "../../ecs/define/TowerType";
import { TowerManager } from "./TowerManager";
import { TowerView } from "./TowerView";
import { TownerBuildPoint } from "./TownerBuildPoint";

export class TowerFactory {

    static async create(point: TownerBuildPoint) {

        let type = TowerType.Arrow as TowerType;

        let prefabName = type === TowerType.Barrack ? 'prefabs/TowerBarrack' : 'prefabs/TowerArrow';

        const prefab = await AssetManagerEx.inst.load<Prefab>(
            'tower',
            prefabName,
            Prefab
        );

        const node = instantiate(prefab);
        GameRoot.inst.TowerRoot.addChild(node);

        const view = node.getComponent(TowerView)!;

        // ECS
        const entity = World.inst.createEntity();
        World.inst.bindNode(entity, node);
        World.inst.addComponent(entity, new StateComp());
        World.inst.addComponent(entity, new BehaviorComp());

        // 塔组件映射
        let towerComp = new TowerComp();
        towerComp.type = type;
        World.inst.addComponent(entity, towerComp);

        //属性映射
        let attr = new AttributeComp();
        attr.attack = view.attack;
        attr.magicAttack = view.magicAttack;
        attr.attackRange = view.attackRange;
        attr.attackInterval = view.attackInterval;
        World.inst.addComponent(entity, attr);

        const attack = new AttackComp()
        attack.range = view.attackRange
        attack.interval = view.attackInterval
        World.inst.addComponent(entity, attack)

        this.createComponentByType(entity, type);

        // 设置位置
        node.setWorldPosition(point.pos.x, point.pos.y + node.getComponent(UITransform).height / 4, point.pos.z);

        // 标记占用
        TowerManager.inst.occupy(point);
        view.init(entity);
        node["entityId"] = entity;
    }

    //根据类型添加不同组件
    static createComponentByType(entity: number, type: TowerType) {
        if (type === TowerType.Barrack) {
            World.inst.addComponent(entity, new BarrackComp());
        } else {
            World.inst.addComponent(entity, new ArrowTowerComp());
        }
    }
}