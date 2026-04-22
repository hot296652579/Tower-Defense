import { instantiate, Prefab, Vec3 } from 'cc';
import { AssetManagerEx } from '../../core/AssetManagerEx';
import { GameRoot } from '../../core/GameRoot';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { CampComp, CampType } from '../../ecs/components/CampComp';
import { MoveComp } from '../../ecs/components/MoveComp';
import { StateComp } from '../../ecs/components/StateComp';
import { UnitComp } from '../../ecs/components/UnitComp';
import { EntityState, World } from '../../ecs/core/World';
import { UnitType } from '../../ecs/define/UnitType';
import { PlayerView } from './PlayerView';

export class PlayerFactory {

    static async create(name: string, startPos: Vec3, unitType: UnitType) {

        const prefab = await AssetManagerEx.inst.load<Prefab>(
            'character',
            `prefabs/player/${name}`,
            Prefab
        );

        const node = instantiate(prefab);
        GameRoot.inst.CharacterRoot.addChild(node);

        const entity = World.inst.createEntity();
        World.inst.bindNode(entity, node);

        //所有组件统一在这里加
        World.inst.addComponent(entity, new AttributeComp(100, 10));
        World.inst.addComponent(entity, new MoveComp(100));

        const state = new StateComp();
        state.changeState(EntityState.Idle);
        World.inst.addComponent(entity, state);

        World.inst.addComponent(entity, new CampComp(CampType.Player));
        World.inst.addComponent(entity, new UnitComp(unitType));

        node.setWorldPosition(startPos);
        const view = node.getComponent(PlayerView)!;
        view.init(entity);
    }
}
