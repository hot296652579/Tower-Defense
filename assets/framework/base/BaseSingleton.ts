/**
 * 全局单例管理器基类
 */
export default abstract class BaseSingleton {
    private static _instance: Map<string, BaseSingleton> = new Map();

    constructor() { }

    public static getInstance<T extends BaseSingleton>(this: new (...args: any[]) => T): T {
        const className = (this as any).name;
        if (!BaseSingleton._instance.has(className)) {
            BaseSingleton._instance.set(className, new (this as any)());
        }
        return BaseSingleton._instance.get(className) as T;
    }

    /** 框架初始化，main.ts 统一调用 */
    public abstract init(): Promise<void>;

    /** 游戏销毁/切场景释放资源 */
    public abstract destroy(): void;

    /** 销毁所有单例（游戏退出调用） */
    public static destroyAll(): void {
        BaseSingleton._instance.forEach(ins => ins.destroy());
        BaseSingleton._instance.clear();
    }
}