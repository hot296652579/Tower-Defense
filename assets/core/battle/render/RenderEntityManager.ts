import { Node, Vec3 } from "cc";
import { BundlesEnum } from "db://assets/define/BundlesEnum";
import BaseSingleton from "db://assets/framework/base/BaseSingleton";
import { ConfigManager } from "db://assets/framework/config/ConfigManager";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import { PoolManager } from "db://assets/framework/pool/PoolManager";
import { ResourceManager } from "db://assets/framework/resource/ResourceManager";
import { UnitConfig } from "../data/UnitConfigType";
import { EcsEntity } from "../ecs/base/EcsEntity";
import EcsWorld from "../ecs/base/EcsWorld";
import FsmStateComp from "../ecs/components/FsmStateComp";
import TransformComp from "../ecs/components/TransformComp";
import { FsmAnimMachine } from "../fsm/FsmAnimMachine";

/**
 * ECS <-> 场景渲染节点桥接管理器
 * 单次战斗内使用，战斗销毁调用clear()，不要全局长期缓存实体映射
 */
export class RenderEntityManager extends BaseSingleton {
    private _ecsWorld!: EcsWorld;
    // entityId → 渲染节点
    private _entityNodeMap: Map<number, Node> = new Map();
    // 怪物渲染父节点
    private _entityRoot!: Node;

    public async init(entityRoot: Node, world: EcsWorld): Promise<void> {
        this._ecsWorld = world;
        this._entityRoot = entityRoot;
        this._entityNodeMap.clear();
        // 监听实体创建事件（后续可以在EnemyFactory创建实体后派发）
        EventManager.getInstance().on(GameEvent.ENTITY_CREATE, this.onEntityCreate, this);
        EventManager.getInstance().on(GameEvent.ENTITY_DESTROY, this.onEntityDestroy, this);
    }

    public destroy(): void {
        EventManager.getInstance().offAllByTarget(this);
        this.clear();
    }

    /** 清空所有渲染实体 */
    public clear(): void {
        for (const [eid, node] of this._entityNodeMap) {
            PoolManager.getInstance().despawn(node);
        }
        this._entityNodeMap.clear();
    }

    /**
     * 根据怪物配置ID 创建渲染节点，绑定ECS实体ID
     */
    public async createRenderNode(entityId: number, monsterCfgId: number): Promise<Node | null> {
        if (!EcsEntity.isValid(entityId)) return null;
        if (this._entityNodeMap.has(entityId)) {
            return this._entityNodeMap.get(entityId)!;
        }
        const cfg = ConfigManager.getInstance().getRowById<UnitConfig>("enemy_table", monsterCfgId);
        if (!cfg) {
            console.error("RenderEntityManager 找不到怪物配置 id:", monsterCfgId);
            return null;
        }
        // 注册对象池（key使用prefab路径作为唯一标识）
        const poolKey = cfg.prefabPath;

        let node = PoolManager.getInstance().spawn(poolKey);
        if (!node) {
            const prefab = await ResourceManager.getInstance().loadPrefab(cfg.prefabPath, BundlesEnum.Game);
            if (!prefab) return null;
            PoolManager.getInstance().registerPool(poolKey, prefab, 60);
            node = PoolManager.getInstance().spawn(poolKey)!;
        }
        node.setParent(this._entityRoot);
        // 绑定实体ID（供FsmAnimMachine使用）
        node["entityId"] = entityId;

        //添加FsmAnimMachine组件，绑定实体ID
        let animMachine = node.getComponent(FsmAnimMachine);
        if (!animMachine) {
            animMachine = node.addComponent(FsmAnimMachine);
        }

        animMachine.entityId = entityId;

        const currentFsm = this._ecsWorld.tryGetComponent(entityId, FsmStateComp);
        if (currentFsm) {
            animMachine.onEntityStateChange(entityId, currentFsm.state);
        }

        this._entityNodeMap.set(entityId, node);
        return node;
    }

    /** 每一帧同步所有实体Transform坐标 */
    public syncAllTransform(entityIds: number[], world: EcsWorld): void {
        for (const eid of entityIds) {
            const node = this._entityNodeMap.get(eid);
            if (!node) continue;
            const transComp = world.tryGetComponent(eid, TransformComp);
            if (!transComp) continue;
            // 同步坐标
            node.setWorldPosition(new Vec3(transComp.pos.x, transComp.pos.y, 0));
            // 朝向翻转
            node.scale.set(Math.abs(node.scale.x) * transComp.faceDir, node.scale.y);
        }
    }

    private async onEntityCreate(entityId: number, monsterCfgId: number): Promise<void> {
        await this.createRenderNode(entityId, monsterCfgId);
    }

    private onEntityDestroy(entityId: number): void {
        const node = this._entityNodeMap.get(entityId);
        if (!node) return;
        this._entityNodeMap.delete(entityId);
        PoolManager.getInstance().despawn(node);
    }
}