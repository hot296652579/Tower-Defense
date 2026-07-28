import { _decorator, Component, Node, Prefab, instantiate, Pool, director } from 'cc';
const { ccclass, property } = _decorator;
import { EventManager } from 'db://assets/framework/event/EventManager';
import { GameEvent } from 'db://assets/framework/event/EventName';
import HPComp from '../ecs/components/HPComp';
import TransformComp from '../ecs/components/TransformComp';
import { HpBarView } from './HpBarView';
import { ResourceManager } from 'db://assets/framework/resource/ResourceManager';
import { UIConfig } from 'db://assets/define/UIEnum';
import BaseSingleton from 'db://assets/framework/base/BaseSingleton';
import { UILayerRoot, UILayerType } from 'db://assets/ui/layer/UILayer';
import { RenderEntityManager } from '../render/RenderEntityManager';
import { PoolManager } from 'db://assets/framework/pool/PoolManager';

@ccclass('HpBarManager')
export class HpBarManager extends BaseSingleton {
    public static instance: HpBarManager = null!;
    // game bundle 血条预制体
    private hpBarPrefab: Prefab | null = null;
    // 血条对象池
    private barPool: Pool<Node> = new Pool(() => {
        const node = null!;
        return node;
    }, 30);


    // 关键映射：实体ID -> 血条View，彻底脱离ECS组件存储节点
    private entityBarMap = new Map<number, HpBarView>();

    public async init(): Promise<void> {
        HpBarManager.instance = this;
        const evt = EventManager.getInstance();

        // 监听血量更新、实体死亡
        evt.on(GameEvent.ENTITY_HP_UPDATE, this.onHpUpdate, this);
        evt.on(GameEvent.ENTITY_DESTROY, this.onEntityDead, this);
    }

    // 异步加载game bundle内HpBar预制体，游戏初始化调用
    public async loadHpBarPrefab() {
        this.hpBarPrefab = await ResourceManager.getInstance().loadPrefab(UIConfig.HpBar.path, UIConfig.HpBar.bundle);
        if (!this.hpBarPrefab) {
            console.error("HpBar预制体加载失败");
            return;
        }
        PoolManager.getInstance().registerPool(UIConfig.HpBar.path, this.hpBarPrefab!, 30);
    }

    // 血量更新回调
    private onHpUpdate(data: {
        entityId: number;
        hpComp: HPComp;
        posComp: TransformComp;
        deltaHp: number;
    }) {
        if (!this.hpBarPrefab) return;
        const { entityId, hpComp, posComp, deltaHp } = data; //entityId受伤者Id

        // console.log('更新血量组件 hpComp', hpComp.curHp, hpComp.maxHp);
        let barView: HpBarView;
        if (this.entityBarMap.has(entityId)) {
            barView = this.entityBarMap.get(entityId)!;
        } else {
            const barNode = PoolManager.getInstance().spawn(UIConfig.HpBar.path)!;
            barNode.setParent(UILayerRoot.getRootByLayer(UILayerType.SCENE_UI)!);
            barView = barNode.getComponent(HpBarView)!;
            this.entityBarMap.set(entityId, barView);
        }

        const renderNode = RenderEntityManager.getInstance().getRenderNode(entityId);
        if (renderNode) {
            barView.bindTarget(renderNode);
        }
        barView.refreshHp(hpComp.curHp, hpComp.maxHp);
        // 掉血播放闪烁
        // if (deltaHp < 0) barView.playHurtFlash();
    }

    // 实体死亡回收血条
    private onEntityDead(entityId: number) {
        if (!this.entityBarMap.has(entityId)) return;
        const bar = this.entityBarMap.get(entityId)!;
        PoolManager.getInstance().despawn(bar.node);
        this.entityBarMap.delete(entityId);
    }

    public destroy(): void {
        // 解绑事件，防止内存泄漏
        const evt = EventManager.getInstance();
        evt.off(GameEvent.ENTITY_HP_UPDATE, this.onHpUpdate, this);
        evt.off(GameEvent.ENTITY_DESTROY, this.onEntityDead, this);
        HpBarManager.instance = null!;
    }
}