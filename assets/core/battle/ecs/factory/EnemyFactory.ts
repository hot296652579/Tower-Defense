
import { ConfigManager } from "db://assets/framework/config/ConfigManager";
import { EntityType, UnitConfig, UnitType } from "../../data/UnitConfigType";
import { EcsEntity } from "../base/EcsEntity";
import EcsWorld from "../base/EcsWorld";

// 引入全部组件
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import BattleRoot from "../../BattleRoot";
import AttackComp from "../components/AttackComp";
import AttackLimitComp from "../components/AttackLimitComp";
import AttackModeComp, { AttackMode } from "../components/AttackModeComp";
import BufferComp from "../components/BufferComp";
import CampComp from "../components/CampComp";
import DamageTypeComp from "../components/DamageTypeComp";
import EnemyComp from "../components/EnemyComp";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import HealerComp from "../components/HealerComp";
import HPComp from "../components/HPComp";
import MoveComp from "../components/MoveComp";
import RangerBulletComp from "../components/RangerBulletComp";
import TransformComp from "../components/TransformComp";

export class EnemyFactory {
    private static _world: EcsWorld;
    private static _battleRoot: BattleRoot;

    public static setEcsWorld(world: EcsWorld, battleRoot: BattleRoot): void {
        this._battleRoot = battleRoot;
        this._world = world;
    }

    /**
     * 创建怪物实体入口
     * @param monsterCfgId 怪物配置ID
     * @param pathId 可选路径；不传则从配置 pathsId 随机
     * @returns entityId
     */
    public static createEnemy(monsterCfgId: number, pathId?: string): number {
        if (!this._world) {
            console.error("EnemyFactory: 未设置EcsWorld");
            return EcsEntity.INVALID;
        }
        const cfg = ConfigManager.getInstance().getRowById<UnitConfig>("enemy_table", monsterCfgId);
        if (!cfg) {
            console.error("找不到怪物配置 id =", monsterCfgId);
            return EcsEntity.INVALID;
        }

        // 创建实体
        const entityId = this._world.createEntity();

        // ======= 挂载通用基础组件 + 填充数据 =======
        const trans = this._world.addComponent(entityId, TransformComp);
        const hp = this._world.addComponent(entityId, HPComp);
        const fsm = this._world.addComponent(entityId, FsmStateComp);
        const move = this._world.addComponent(entityId, MoveComp);
        const atk = this._world.addComponent(entityId, AttackComp);
        const enemy = this._world.addComponent(entityId, EnemyComp);
        const camp = this._world.addComponent(entityId, CampComp);
        const attackLimit = this._world.addComponent(entityId, AttackLimitComp);
        const damageType = this._world.addComponent(entityId, DamageTypeComp);

        const pathsId = (pathId && pathId.length > 0)
            ? [pathId]
            : (cfg.pathsId && cfg.pathsId.length > 0 ? cfg.pathsId : ["path_0"]);
        const randomPath = pathsId[Math.floor(Math.random() * pathsId.length)];
        const startPos = this._battleRoot.getMapPathData().getPathStartPos(randomPath);
        if (!startPos) {
            console.error("EnemyFactory: 找不到路径起点", randomPath);
            this._world.destroyEntity(entityId);
            return EcsEntity.INVALID;
        }

        // 基础数据赋值
        camp.camp = EntityType.ENEMY;
        trans.pos = startPos.clone();
        trans.faceDir = 1;

        hp.maxHp = cfg.hp;
        hp.curHp = cfg.hp;
        hp.def = cfg.def;
        hp.isHurt = false;
        hp.hurtCd = 0;

        fsm.state = EntityFsmState.WALK;

        move.moveSpeed = cfg.moveSpeed;
        move.pathId = randomPath;
        move.pathIndex = 0;
        move.slowRate = 1;
        move.isMoving = false;
        move.isHero = false;

        atk.atk = cfg.atk;
        atk.atkRange = cfg.atkRange;
        atk.atkInterval = cfg.atkInterval;
        atk.atkCd = 0;
        atk.damageType = cfg.damageType;
        atk.isAttacking = false;
        atk.targetEntityId = 0;

        enemy.configId = cfg.id;
        enemy.unitType = cfg.unitType;
        enemy.goldDrop = cfg.goldDrop;

        // ======= 根据单位类型挂载差异化组件 =======
        switch (cfg.unitType) {
            case UnitType.HEALER: {
                const healer = this._world.addComponent(entityId, HealerComp);
                const mode = this._world.addComponent(entityId, AttackModeComp);
                mode.mode = AttackMode.RANGER;
                // 怪物牧师也可远程普攻，与英雄治疗一致
                this._world.addComponent(entityId, RangerBulletComp);
                damageType.damageType = cfg.damageType;
                healer.healValue = cfg.healValue;
                healer.healRange = cfg.healRange;
                healer.healInterval = cfg.healInterval;
                healer.healCd = cfg.healInterval;
                break;
            }
            case UnitType.BUFFER: {
                const buffComp = this._world.addComponent(entityId, BufferComp);
                buffComp.buffType = cfg.buffType;
                buffComp.buffValue = cfg.buffValue;
                buffComp.buffDuration = cfg.buffDuration;
                buffComp.buffRange = cfg.buffRange;
                buffComp.buffInterval = 5;
                buffComp.buffCd = 0;
                break;
            }
            case UnitType.RANGER: {
                damageType.damageType = cfg.damageType;
                const mode = this._world.addComponent(entityId, AttackModeComp);
                mode.mode = AttackMode.RANGER;
                this._world.addComponent(entityId, RangerBulletComp);
                break;
            }
            case UnitType.MELEE: {
                damageType.damageType = cfg.damageType;
                const mode = this._world.addComponent(entityId, AttackModeComp);
                mode.mode = AttackMode.MELEE;
                break;
            }
        }

        // console.log(`创建怪物实体[${entityId}] cfgId:${monsterCfgId} path:${pathId}`);
        EventManager.getInstance().emit(GameEvent.ENTITY_CREATE, entityId, monsterCfgId, EntityType.ENEMY);
        return entityId;
    }

    /**
     * 【测试接口】快速生成怪物，外部可直接调用测试
     * @param monsterId 怪物id
     * @param pathId 路径id
     */
    public static testSpawnMonster(monsterId: number = 100): number {
        return this.createEnemy(monsterId);
    }
}