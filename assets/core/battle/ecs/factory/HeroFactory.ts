import { Vec2 } from "cc";

import { EntityType, UnitConfig, UnitType } from "../../data/UnitConfigType";
import { EcsEntity } from "../base/EcsEntity";
import EcsWorld from "../base/EcsWorld";

// 引入全部基础组件
import { ConfigManager } from "db://assets/framework/config/ConfigManager";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import AttackComp from "../components/AttackComp";
import BufferComp from "../components/BufferComp";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import HealerComp from "../components/HealerComp";
import HeroComp from "../components/HeroComp";
import HPComp from "../components/HPComp";
import MoveComp from "../components/MoveComp";
import TransformComp from "../components/TransformComp";
import AttackLimitComp from "../components/AttackLimitComp";
import CampComp from "../components/CampComp";

export class HeroFactory {
    private static _world: EcsWorld;

    public static setEcsWorld(world: EcsWorld): void {
        this._world = world;
    }

    /**
     * 创建英雄实体
     * @param heroCfgId hero_table内配置ID
     * @param spawnPos 点击场景生成的世界坐标
     * @returns entityId
     */
    public static createHero(heroCfgId: number, spawnPos: Vec2): number {
        if (!this._world) {
            console.error("HeroFactory: 未绑定EcsWorld");
            return EcsEntity.INVALID;
        }
        const cfg = ConfigManager.getInstance().getRowById<UnitConfig>("hero_table", heroCfgId);
        if (!cfg) {
            console.error("HeroFactory 找不到英雄配置 id =", heroCfgId);
            return EcsEntity.INVALID;
        }

        const entityId = this._world.createEntity();
        // 基础组件挂载
        const trans = this._world.addComponent(entityId, TransformComp);
        const hp = this._world.addComponent(entityId, HPComp);
        const fsm = this._world.addComponent(entityId, FsmStateComp);
        const move = this._world.addComponent(entityId, MoveComp);
        const atk = this._world.addComponent(entityId, AttackComp);
        const hero = this._world.addComponent(entityId, HeroComp);
        const camp = this._world.addComponent(entityId, CampComp);
        const attackLimit = this._world.addComponent(entityId, AttackLimitComp);

        // 基础赋值
        camp.camp = EntityType.HERO;
        trans.pos = spawnPos.clone();
        trans.faceDir = 1;
        hp.maxHp = cfg.hp;
        hp.curHp = cfg.hp;
        hp.def = cfg.def;
        hp.isHurt = false;
        hp.hurtCd = 0;
        // console.log(`英雄[${entityId}] 初始化血量 curHp=${hp.curHp}, maxHp=${hp.maxHp}`);

        fsm.state = EntityFsmState.IDLE;

        move.moveSpeed = cfg.moveSpeed;
        move.pathId = ""; // 英雄不沿怪物路径移动，留空
        move.pathIndex = 0;
        move.slowRate = 1;
        move.isMoving = false;
        move.isHero = true; // 英雄

        atk.atk = cfg.atk;
        atk.atkRange = cfg.atkRange;
        atk.atkInterval = cfg.atkInterval;
        atk.atkCd = 0;
        atk.damageType = cfg.damageType;
        atk.isAttacking = false;
        atk.targetEntityId = 0;

        hero.configId = cfg.id;
        hero.unitType = cfg.unitType;

        // 根据单位类型挂载差异化组件
        switch (cfg.unitType) {
            case UnitType.HEALER:
                const healer = this._world.addComponent(entityId, HealerComp);
                healer.healValue = cfg.healValue;
                healer.healRange = cfg.healRange;
                healer.healInterval = cfg.healInterval;
                healer.healCd = 0;
                break;
            case UnitType.BUFFER:
                const buff = this._world.addComponent(entityId, BufferComp);
                buff.buffType = cfg.buffType;
                buff.buffValue = cfg.buffValue;
                buff.buffDuration = cfg.buffDuration;
                buff.buffRange = cfg.buffRange;
                buff.buffInterval = 5;
                buff.buffCd = 0;
                break;
            case UnitType.MELEE:
            case UnitType.RANGER:
                break;
        }

        console.log(`创建英雄实体[${entityId}] cfgId:${heroCfgId} 生成坐标:${spawnPos.toString()}`);
        // 派发创建事件，RenderEntityManager自动生成渲染节点
        EventManager.getInstance().emit(GameEvent.ENTITY_CREATE, entityId, heroCfgId, EntityType.HERO);
        return entityId;
    }
}