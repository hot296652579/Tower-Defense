import { instantiate, Prefab, Vec3 } from 'cc';
import { AssetManagerEx } from '../../core/AssetManagerEx';
import { GameRoot } from '../../core/GameRoot';
import { AttackComp } from '../../ecs/components/AttackComp';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { CampComp, CampType } from '../../ecs/components/CampComp';
import { MoveComp } from '../../ecs/components/MoveComp';
import { SkillComp } from '../../ecs/components/SkillComp';
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

        const view = node.getComponent(PlayerView)!;

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

        const state = new StateComp();
        state.changeState(EntityState.Idle);
        World.inst.addComponent(entity, state);

        World.inst.addComponent(entity, new CampComp(CampType.Player));
        World.inst.addComponent(entity, new UnitComp(unitType));

        console.log('startPos:', startPos);
        node.setWorldPosition(startPos);

        view.init(entity);
        node["entityId"] = entity;
    }
}
