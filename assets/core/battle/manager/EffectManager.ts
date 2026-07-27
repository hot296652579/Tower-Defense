import { Node, instantiate, Vec2, Animation } from "cc";
import BaseSingleton from "../../../framework/base/BaseSingleton";
import { PoolManager } from "../../../framework/pool/PoolManager";
import { ResourceManager } from "../../../framework/resource/ResourceManager";
import { BundlesEnum } from "db://assets/define/BundlesEnum";
import { UILayerRoot, UILayerType } from "db://assets/ui/layer/UILayer";

/*** 特效管理器*/
export class EffectManager extends BaseSingleton {
    private _effectPoolKeys = new Set<string>();

    public async init(): Promise<void> { }

    /**
     * 播放特效
     * @param effectPath 特效预制资源路径
     * @param worldPos 世界坐标
     * @param lifeTime 特效自动回收时长（秒，默认1秒）
     */
    public async playEffect(effectPath: string, worldPos: Vec2, lifeTime: number = 1): Promise<void> {
        if (!effectPath) return;
        let effectNode = PoolManager.getInstance().spawn(effectPath);
        // 池无预制，加载并注册池
        if (!effectNode) {
            console.log("加载特效预制", effectPath);
            const prefab = await ResourceManager.getInstance().loadPrefab(effectPath, BundlesEnum.Game);
            if (!prefab) return;
            PoolManager.getInstance().registerPool(effectPath, prefab, 30);
            effectNode = PoolManager.getInstance().spawn(effectPath)!;
            this._effectPoolKeys.add(effectPath);
        }

        effectNode.active = true;
        effectNode.getComponentInChildren(Animation)!.play();
        effectNode.setParent(UILayerRoot.getRootByLayer(UILayerType.SCENE_UI)!);
        effectNode.setWorldPosition(worldPos.x, worldPos.y, 0);

        console.log("特效节点", effectNode.position.x, effectNode.position.y);
        // 定时自动回收特效
        setTimeout(() => {
            PoolManager.getInstance().despawn(effectNode);
        }, lifeTime * 500);
    }

    /** 清空所有特效池，关卡刷新调用 */
    public clearAllEffect(): void {
        this._effectPoolKeys.forEach(key => {
            PoolManager.getInstance().clearPool(key);
        });
        this._effectPoolKeys.clear();
    }

    destroy(): void {
        this.clearAllEffect();
    }
}