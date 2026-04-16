import { instantiate, Prefab, Vec3 } from 'cc';
import { AssetManagerEx } from '../../core/AssetManagerEx';
import { GameRoot } from '../../core/GameRoot';

export class EnemyFactory {

    static async create(name: string, path: Vec3[]) {

        const prefab = await AssetManagerEx.inst.load<Prefab>(
            'character',
            `prefabs/enemy/${name}`,
            Prefab
        );

        const node = instantiate(prefab);
        node.setPosition(Vec3.ZERO);

        GameRoot.inst.EnemyRoot.addChild(node);

        const view: any = node.getComponent('EnemyView');

        const entity = view.entity;

        // DOTO 添加路径
        // World.inst.addComponent(entity, new PathComp(path));
    }
}