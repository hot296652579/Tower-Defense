
import { ConfigManager } from "db://assets/framework/config/ConfigManager";
import { EntityType, UnitConfig, UnitType } from "../../data/UnitConfigType";
import { EcsEntity } from "../base/EcsEntity";
import EcsWorld from "../base/EcsWorld";

// 引入全部组件
import { Vec2 } from "cc";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import AttackComp from "../components/AttackComp";
import BufferComp from "../components/BufferComp";
import EnemyComp from "../components/EnemyComp";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import HealerComp from "../components/HealerComp";
import HPComp from "../components/HPComp";
import MoveComp from "../components/MoveComp";
import TransformComp from "../components/TransformComp";

export class EnemyFactory {
    private static _world: EcsWorld;

    public static setEcsWorld(world: EcsWorld): void {
        this._world = world;
    }

    /**
     * 创建怪物实体入口
     * @param monsterCfgId 怪物配置ID
     * @param pathId 生成在哪一条路径 path_0 / path_1
     * @returns entityId
     */
    public static createEnemy(monsterCfgId: number, pathId: string, spawnPos: Vec2): number {
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

        // 基础数据赋值
        trans.pos = spawnPos.clone();
        trans.faceDir = 1;

        hp.maxHp = cfg.hp;
        hp.curHp = cfg.hp;
        hp.def = cfg.def;
        hp.isHurt = false;
        hp.hurtCd = 0;

        fsm.state = EntityFsmState.WALK;

        move.moveSpeed = cfg.moveSpeed;
        move.pathId = pathId;
        move.pathIndex = 0;
        move.slowRate = 1;
        move.isMoving = false;
        move.isHero = false; // 怪物

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
                healer.healValue = cfg.healValue;
                healer.healRange = cfg.healRange;
                healer.healInterval = cfg.healInterval;
                healer.healCd = 0;
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
            case UnitType.RANGER:
                // 远程子弹数据后续在AttackSystem使用，不需要额外组件，配置存在EnemyConfig
                break;
            case UnitType.MELEE:
                break;
        }

        console.log(`创建怪物实体[${entityId}] cfgId:${monsterCfgId} path:${pathId}`);
        EventManager.getInstance().emit(GameEvent.ENTITY_CREATE, entityId, monsterCfgId, EntityType.ENEMY);
        return entityId;
    }

    /**
     * 【测试接口】快速生成怪物，外部可直接调用测试
     * @param monsterId 怪物id
     * @param pathId 路径id
     */
    public static testSpawnMonster(monsterId: number = 100, pathId: string = "path_0", spawnPos: Vec2 = new Vec2()): number {
        return this.createEnemy(monsterId, pathId, spawnPos);
    }
}