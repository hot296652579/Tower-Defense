/**
 * ECS实体ID静态工具
 * 不创建实体对象，只用数字ID，极致轻量化
 */
export class EcsEntity {
    public static readonly INVALID: number = 0;

    public static isValid(entityId: number): boolean {
        return entityId > EcsEntity.INVALID;
    }
}