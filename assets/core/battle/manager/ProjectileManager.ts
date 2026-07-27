import { Node, Vec2, math } from "cc";
import BaseSingleton from "../../../framework/base/BaseSingleton";
import { PoolManager } from "db://assets/framework/pool/PoolManager";
import { ResourceManager } from "db://assets/framework/resource/ResourceManager";
import { BundlesEnum } from "db://assets/define/BundlesEnum";
import EcsWorld from "../ecs/base/EcsWorld";
import RangerBulletComp from "../ecs/components/RangerBulletComp";
import TransformComp from "../ecs/components/TransformComp";

export interface ProjectileRuntimeInfo {
    attackerEid: number;
    targetEid: number;
    startWorldPos: Vec2;
    maxAttackRange: number;
    poolKey: string;
}

/**
 * 投射物管理器
 * @param 管理所有飞行子弹、投射物
*/
export class ProjectileManager extends BaseSingleton {
    private _poolMgr = PoolManager.getInstance();
    private _resMgr = ResourceManager.getInstance();
    private _activeProjectileMap = new Map<Node, ProjectileRuntimeInfo>();
    private _poolKeySet = new Set<string>();

    public async init(): Promise<void> { }

    public destroy(): void {
        this.clearAllProjectile();
    }

    /**
     * 生成子弹节点
     * @param spawnPos 世界坐标
     * @param targetEid 目标实体
     * @param attackerEid 攻击者实体
     * @param maxRange 最大射程
     * @param poolKey 子弹预制路径
     * @param parentRoot SCENE_UI根节点
     */
    public async spawnProjectile(
        spawnPos: Vec2,
        targetEid: number,
        attackerEid: number,
        maxRange: number,
        poolKey: string,
        parentRoot: Node
    ): Promise<void> {
        if (!parentRoot || !poolKey) return;

        let bulletNode = this._poolMgr.spawn(poolKey);
        if (!bulletNode) {
            const prefab = await this._resMgr.loadPrefab(poolKey, BundlesEnum.Game);
            if (!prefab) return;
            this._poolMgr.registerPool(poolKey, prefab, 40);
            bulletNode = this._poolMgr.spawn(poolKey)!;
            this._poolKeySet.add(poolKey);
        }

        bulletNode.active = true;
        bulletNode.setParent(parentRoot);
        bulletNode.setWorldPosition(spawnPos.x, spawnPos.y, 0);

        const runtimeInfo: ProjectileRuntimeInfo = {
            attackerEid,
            targetEid,
            startWorldPos: spawnPos.clone(),
            maxAttackRange: maxRange,
            poolKey
        };
        this._activeProjectileMap.set(bulletNode, runtimeInfo);
    }

    /** 帧更新所有子弹移动，返回需要处理命中的子弹数据 */
    public updateAllProjectile(dt: number, world: EcsWorld): ProjectileRuntimeInfo[] {
        const recycleInfoList: ProjectileRuntimeInfo[] = [];
        const recycleNodeList: Node[] = [];

        this._activeProjectileMap.forEach((info, bulletNode) => {
            const bulletComp = world.tryGetComponent(info.attackerEid, RangerBulletComp);
            const targetTrans = world.tryGetComponent(info.targetEid, TransformComp);
            if (!bulletComp || !targetTrans) {
                recycleNodeList.push(bulletNode);
                recycleInfoList.push(info);
                return;
            }

            const bulletWorldPos = new Vec2(bulletNode.worldPosition.x, bulletNode.worldPosition.y);
            const dir = math.Vec2.subtract(new Vec2(), targetTrans.pos, bulletWorldPos);
            const distToTarget = dir.length();
            const moveStep = bulletComp.bulletSpeed * dt;
            const travelDist = math.Vec2.distance(info.startWorldPos, bulletWorldPos);

            if (distToTarget < moveStep || travelDist > info.maxAttackRange) {
                recycleNodeList.push(bulletNode);
                recycleInfoList.push(info);
                return;
            }

            dir.normalize();
            bulletNode.setWorldPosition(
                bulletNode.worldPosition.x + dir.x * moveStep,
                bulletNode.worldPosition.y + dir.y * moveStep,
                0
            );
        });

        recycleNodeList.forEach((node, index) => {
            const info = recycleInfoList[index];
            this._poolMgr.despawn(node);
            this._activeProjectileMap.delete(node);
        });

        return recycleInfoList;
    }

    /** 清空所有子弹，关卡刷新调用 */
    public clearAllProjectile(): void {
        this._activeProjectileMap.forEach((info, node) => {
            this._poolMgr.despawn(node);
        });
        this._activeProjectileMap.clear();
        this._poolKeySet.clear();
    }
}