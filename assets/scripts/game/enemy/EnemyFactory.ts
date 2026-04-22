import { instantiate, Prefab } from 'cc';
import { AssetManagerEx } from '../../core/AssetManagerEx';
import { GameRoot } from '../../core/GameRoot';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { CampComp, CampType } from '../../ecs/components/CampComp';
import { MoveComp } from '../../ecs/components/MoveComp';
import { PathComp } from '../../ecs/components/PathComp';
import { StateComp } from '../../ecs/components/StateComp';
import { UnitComp } from '../../ecs/components/UnitComp';
import { EntityState, World } from '../../ecs/core/World';
import { UnitType } from '../../ecs/define/UnitType';
import { PathData } from '../map/PathData';
import { EnemyView } from './EnemyView';

export class EnemyFactory {

    static async create(name: string, path: PathData) {

        const prefab = await AssetManagerEx.inst.load<Prefab>(
            'character',
            `prefabs/enemy/${name}`,
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

        World.inst.addComponent(entity, new CampComp(CampType.Enemy));
        World.inst.addComponent(entity, new UnitComp(UnitType.Enemy));

        //设置出生点
        const startNode = path.getNode(path.startId);
        if (startNode) {
            node.setWorldPosition(startNode.pos);
        }

        const view = node.getComponent(EnemyView)!;
        view.init(entity);
    }
}
