import EcsComponent from "./EcsComponent";
import { EcsEntity } from "./EcsEntity";
import EcsSystem from "./EcsSystem";

type ComponentClass<T extends EcsComponent> = new () => T;

/**
 * ECS世界管理器
 * 每一局战斗独立 new EcsWorld()，禁止全局单例
 */
export default class EcsWorld {

    public readonly GLOBAL_ENTITY_ID = 1;
    // 自增实体id生成器
    private _nextEntityId = 1;

    // 实体-组件映射表 entityId => Map<组件构造函数,组件实例>
    private readonly _entityComponents = new Map<number, Map<ComponentClass<EcsComponent>, EcsComponent>>();

    // 注册的系统列表
    private readonly _systems: EcsSystem[] = [];

    // 待销毁实体队列（延迟删除，防止遍历中途数组突变）
    private readonly _destroyQueue = new Set<number>();

    /**
     * 创建实体，返回实体ID
     */
    public createEntity(): number {
        const entityId = this._nextEntityId++;
        this._entityComponents.set(entityId, new Map());
        return entityId;
    }

    /**
     * 标记实体待销毁，延迟到本帧update结束统一清理
     */
    public destroyEntity(entityId: number): void {
        if (!EcsEntity.isValid(entityId)) return;
        this._destroyQueue.add(entityId);
    }

    /**
     * 给实体增加组件
     */
    public addComponent<T extends EcsComponent>(entityId: number, compCls: ComponentClass<T>): T {
        const entityMap = this._entityComponents.get(entityId);
        if (!entityMap) {
            throw new Error(`实体不存在:${entityId}`);
        }
        let comp = entityMap.get(compCls) as T;
        if (!comp) {
            comp = new compCls();
            entityMap.set(compCls, comp);
        }
        return comp;
    }

    /**
     * 删除实体指定组件
     */
    public removeComponent<T extends EcsComponent>(entityId: number, compCls: ComponentClass<T>): void {
        const entityMap = this._entityComponents.get(entityId);
        if (!entityMap) return;
        entityMap.delete(compCls);
    }

    /**
     * 获取实体组件，不存在返回null
     */
    public tryGetComponent<T extends EcsComponent>(entityId: number, compCls: ComponentClass<T>): T | null {
        const entityMap = this._entityComponents.get(entityId);
        if (!entityMap) return null;
        return entityMap.get(compCls) as T ?? null;
    }

    /**
     * 获取组件，不存在直接报错（确定一定存在时使用）
     */
    public getComponent<T extends EcsComponent>(entityId: number, compCls: ComponentClass<T>): T {
        const comp = this.tryGetComponent(entityId, compCls);
        if (!comp) {
            throw new Error(`实体${entityId}缺失组件:${compCls.name}`);
        }
        return comp;
    }

    /**
     * 查询【同时拥有全部传入组件】的实体列表
     * @param compClasses 需要同时具备的组件构造函数数组
     */
    public queryEntities(compClasses: ComponentClass<EcsComponent>[]): number[] {
        const result: number[] = [];

        outer: for (const [entityId, compMap] of this._entityComponents) {
            for (const cls of compClasses) {
                if (!compMap.has(cls)) {
                    continue outer;
                }
            }
            result.push(entityId);
        }
        return result;
    }

    /**
     * 注册系统
     */
    public registerSystem(system: EcsSystem): void {
        system.bindWorld(this);
        system.init();
        this._systems.push(system);
    }

    /** 按类型获取已注册系统 */
    public getSystem<T extends EcsSystem>(cls: new (...args: any[]) => T): T | null {
        for (const sys of this._systems) {
            if (sys instanceof cls) {
                return sys as T;
            }
        }
        return null;
    }

    /**
     * 每一帧驱动所有System
     */
    public update(dt: number): void {
        // 执行所有系统逻辑
        for (const sys of this._systems) {
            sys.update(dt);
        }
        // 统一清理待销毁实体
        this._processDestroyQueue();
    }

    /**
     * 清空整个世界，战斗结束调用
     */
    public clear(): void {
        // 销毁系统
        for (const sys of this._systems) {
            sys.destroy();
        }
        this._systems.length = 0;
        this._entityComponents.clear();
        this._destroyQueue.clear();
        this._nextEntityId = 1;
    }

    private _processDestroyQueue(): void {
        for (const eid of this._destroyQueue) {
            this._entityComponents.delete(eid);
        }
        this._destroyQueue.clear();
    }
}