import { _decorator, Component, Node, Prefab, instantiate, Pool, director } from 'cc';
const { ccclass, property } = _decorator;
import { EventManager } from 'db://assets/framework/event/EventManager';
import { GameEvent } from 'db://assets/framework/event/EventName';
import HPComp from '../ecs/components/HPComp';
import TransformComp from '../ecs/components/TransformComp';
import { HpBarView } from './HpBarView';

@ccclass('HpBarManager')
export class HpBarManager extends Component {
    public static instance: HpBarManager = null!;
    // game bundle 血条预制体
    private hpBarPrefab: Prefab | null = null;
    // 血条对象池
    private barPool: Pool<Node> = new Pool(() => {
        const node = instantiate(this.hpBarPrefab!);
        node.active = false;
        node.setParent(this.node);
        return node;
    }, 30);

    // 关键映射：实体ID -> 血条View，彻底脱离ECS组件存储节点
    private entityBarMap = new Map<number, HpBarView>();

    onLoad() {
        HpBarManager.instance = this;
        const evt = EventManager.getInstance();
        // 监听血量更新、实体死亡
        evt.on(GameEvent.ENTITY_HP_UPDATE, this.onHpUpdate, this);
        evt.on(GameEvent.ENTITY_ENTITY_DEAD, this.onEntityDead, this);
    }

    // 异步加载game bundle内HpBar预制体，游戏初始化调用
    loadHpBarPrefab() {
        // director.loadBundle("game", (err, bundle) => {
        //     if (err) return console.error("加载game bundle失败", err);
        //     bundle.load("res/ui/prefab/HpBar", Prefab, (err, prefab) => {
        //         if (err) return console.error("HpBar预制体加载失败", err);
        //         this.hpBarPrefab = prefab;
        //     });
        // });
    }

    // 血量更新回调
    private onHpUpdate(data: {
        entityId: number;
        hpComp: HPComp;
        posComp: TransformComp;
        deltaHp: number;
    }) {
        if (!this.hpBarPrefab) return;
        const { entityId, hpComp, posComp, deltaHp } = data;
        const targetNode = posComp;

        let barView: HpBarView;
        if (this.entityBarMap.has(entityId)) {
            barView = this.entityBarMap.get(entityId)!;
        } else {
            const barNode = this.barPool.alloc();
            barView = barNode.getComponent(HpBarView)!;
            this.entityBarMap.set(entityId, barView);
        }

        // barView.bindTarget(targetNode);
        barView.refreshHp(hpComp.curHp, hpComp.maxHp);
        // 掉血播放闪烁
        if (deltaHp < 0) barView.playHurtFlash();
    }


    // 实体死亡回收血条
    private onEntityDead(entityId: number) {
        if (!this.entityBarMap.has(entityId)) return;
        const bar = this.entityBarMap.get(entityId)!;
        this.barPool.free(bar.node);
        this.entityBarMap.delete(entityId);
    }

    onDestroy() {
        // 解绑事件，防止内存泄漏
        const evt = EventManager.getInstance();
        evt.off(GameEvent.ENTITY_HP_UPDATE, this.onHpUpdate, this);
        evt.off(GameEvent.ENTITY_ENTITY_DEAD, this.onEntityDead, this);
        HpBarManager.instance = null!;
    }
}