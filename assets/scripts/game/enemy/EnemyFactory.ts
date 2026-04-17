import { instantiate, Prefab } from 'cc';
import { AssetManagerEx } from '../../core/AssetManagerEx';
import { GameRoot } from '../../core/GameRoot';
import { PathComp } from '../../ecs/components/PathComp';
import { World } from '../../ecs/core/World';
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

        GameRoot.inst.EnemyRoot.addChild(node);

        const view: any = node.getComponent(EnemyView);
        const entity = view.entity;

        // 添加路径组件
        const pathComp = new PathComp(path);
        World.inst.addComponent(entity, pathComp);

        // 出生在起点
        const startNode = path.getNode(path.startId);
        node.setWorldPosition(startNode!.pos);
    }
}
