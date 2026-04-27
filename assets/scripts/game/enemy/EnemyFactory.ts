import { instantiate, Prefab } from 'cc';
import { AssetManagerEx } from '../../core/AssetManagerEx';
import { GameRoot } from '../../core/GameRoot';
import { AttackComp } from '../../ecs/components/AttackComp';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { BehaviorComp, BehaviorType } from '../../ecs/components/BehaviorComp';
import { CampComp, CampType } from '../../ecs/components/CampComp';
import { MoveComp } from '../../ecs/components/MoveComp';
import { PathComp } from '../../ecs/components/PathComp';
import { SkillComp } from '../../ecs/components/SkillComp';
import { StateComp } from '../../ecs/components/StateComp';
import { UnitComp } from '../../ecs/components/UnitComp';
import { World } from '../../ecs/core/World';
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

        const view = node.getComponent(EnemyView)!;

        //所有组件统一在这里加
        World.inst.addComponent(entity, new MoveComp(100));

        /**AttributeComp（从View映射） */
        const attr = new AttributeComp()

        attr.hp = view.hp
        attr.maxHp = view.hpMax

        attr.attack = view.attack
        attr.defense = view.defense

        attr.magicAttack = view.magicAttack
        attr.magicDefense = view.magicDefense

        World.inst.addComponent(entity, attr)

        /** AttackComp（从View映射） */
        const attack = new AttackComp()
        attack.range = view.attackRange
        attack.interval = view.attackInterval

        World.inst.addComponent(entity, attack)

        /** SkillComp （从View映射）*/
        const skillComp = new SkillComp()
        view.skills.forEach(s => {
            skillComp.skills.set(s.name, s)
            skillComp.cooldown.set(s.name, 0)
        })
        World.inst.addComponent(entity, skillComp)

        const pathComp = new PathComp(path);
        World.inst.addComponent(entity, pathComp);

        const state = new StateComp();
        World.inst.addComponent(entity, state);

        const behaviorComp = new BehaviorComp()
        behaviorComp.type = BehaviorType.Aggressive
        World.inst.addComponent(entity, behaviorComp)

        World.inst.addComponent(entity, new CampComp(CampType.Enemy));
        World.inst.addComponent(entity, new UnitComp(UnitType.Enemy));

        //设置出生点
        const startNode = path.getNode(path.startId);
        if (startNode) {
            node.setWorldPosition(startNode.pos);
        }

        view.init(entity);
        node["entityId"] = entity;
    }
}
