import { Node } from 'cc';
import { System } from './System';

export enum EntityState {
    Idle,
    Move,
    Attack,
    Skill,
    Dead
}

type Constructor<T> = new (...args: any[]) => T;

export class World {

    static inst = new World();

    private id = 0;

    /** entity -> componentMap */
    private comps: Map<number, Map<Constructor<unknown>, unknown>> = new Map();

    /** entity -> node */
    private nodes: Map<number, Node> = new Map();

    private systems: System[] = [];

    /** 创建实体 */
    createEntity(): number {
        const eid = ++this.id;
        this.comps.set(eid, new Map());
        return eid;
    }

    /** 添加组件 */
    addComponent<T>(entity: number, comp: T): void {
        const map = this.comps.get(entity);
        if (!map) return;

        map.set(comp.constructor as Constructor<T>, comp);
    }

    /** 获取组件 */
    getComponent<T>(entity: number, type: Constructor<T>): T | undefined {
        return this.comps.get(entity)?.get(type) as T | undefined;
    }

    /** 获取多个组件实体 */
    getEntitiesWith<T extends unknown[]>(
        ...types: { [K in keyof T]: Constructor<T[K]> }
    ): number[] {

        const result: number[] = [];

        this.comps.forEach((map, entity) => {

            const hasAll = types.every(t => map.has(t));

            if (hasAll) result.push(entity);
        });

        return result;
    }

    /** 绑定Node */
    bindNode(entity: number, node: Node): void {
        this.nodes.set(entity, node);
    }

    getNode(entity: number): Node {
        return this.nodes.get(entity)!;
    }

    /** 添加系统 */
    addSystem(system: System): void {
        system.world = this;
        this.systems.push(system);
    }

    /** 更新 */
    update(dt: number): void {
        for (const sys of this.systems) {
            sys.update(dt);
        }
    }

    /** 删除实体 */
    removeEntity(entity: number): void {

        const node = this.nodes.get(entity);

        if (node && node.isValid) {
            node.destroy();
        }

        this.nodes.delete(entity);
        this.comps.delete(entity);
    }

    /** 清空 */
    clear(): void {

        this.nodes.forEach(node => {
            if (node.isValid) node.destroy();
        });

        this.nodes.clear();
        this.comps.clear();
    }
}