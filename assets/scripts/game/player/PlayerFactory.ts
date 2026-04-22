import { instantiate, Prefab } from 'cc';
import { AssetManagerEx } from '../../core/AssetManagerEx';
import { GameRoot } from '../../core/GameRoot';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { CampComp, CampType } from '../../ecs/components/CampComp';
import { MoveComp } from '../../ecs/components/MoveComp';
import { PathComp } from '../../ecs/components/PathComp';
import { StateComp } from '../../ecs/components/StateComp';
import { EntityState, World } from '../../ecs/core/World';
import { PathData } from '../map/PathData';
import { PlayerView } from './PlayerView';

export class PlayerFactory {

    static async create(name: string, path: PathData) {

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

        const pathComp = new PathComp(path);
        World.inst.addComponent(entity, pathComp);

        const state = new StateComp();
        state.changeState(EntityState.Move);
        World.inst.addComponent(entity, state);

        World.inst.addComponent(entity, new CampComp(CampType.Player));

        const view = node.getComponent(PlayerView)!;
        view.init(entity);
    }
}
