import EcsWorld from "./EcsWorld";
/**
 * 系统基类，所有业务System继承
 */
export default abstract class EcsSystem {
    protected world!: EcsWorld;

    public bindWorld(world: EcsWorld): void {
        this.world = world;
    }

    /**
     * 每帧执行逻辑
     * @param dt 帧间隔
     */
    public abstract update(dt: number): void;

    /**
     * 系统初始化（世界启动时执行一次）
     */
    public init(): void {

    }

    /**
     * 系统销毁（战斗结束、世界销毁时调用）
     */
    public destroy(): void {

    }
}