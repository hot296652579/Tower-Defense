/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2026-04-20 21:51:28
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2026-04-20 22:43:30
 * @FilePath:assets/bundles/ui/script/LevelSelectPage.ts
 * @Description: 关卡选择页面
 */
import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { AssetManagerEx } from 'db://assets/scripts/core/AssetManagerEx';
import { GameRoot } from 'db://assets/scripts/core/GameRoot';
import { UILayer, UIManager } from 'db://assets/scripts/core/UIManager';
import { BundlesEnum } from 'db://assets/scripts/define/BundlesEnum';
import { UIEnum } from 'db://assets/scripts/define/UIEnum';
import { LevelMgr } from 'db://assets/scripts/mgr/LevelManager';

const { ccclass, property } = _decorator;

@ccclass('LevelSelectPage')
export class LevelSelectPage extends Component {

    @property(Node)
    btnClose: Node = null!;

    @property(Node)
    content: Node = null!;

    protected start(): void {
        this.btnClose.on(Node.EventType.TOUCH_END, this.onClickClose.bind(this), this);
        this.content.children.forEach((node, index) => {
            node.on(Node.EventType.TOUCH_END, this.onClickLevel.bind(this, index), this);
        });
    }

    private async onClickClose() {
        await UIManager.inst.closePage();
        await UIManager.inst.open(UIEnum.HomePage, UILayer.Page);

    }

    private async onClickLevel(index: number) {
        const loadingLayer = GameRoot.inst.loadingLayer;
        loadingLayer.removeAllChildren();

        const loadingPrefab = await AssetManagerEx.inst.load<Prefab>(BundlesEnum.Game, 'prefab/GameLoding', Prefab);
        const loadingNode = instantiate(loadingPrefab);
        loadingLayer.addChild(loadingNode);

        await AssetManagerEx.inst.loadBundleWithProgress(BundlesEnum.Game, (finished, total) => {
            const loading = loadingNode.getComponent("GameLoading") as any;
            if (loading) {
                loading.onProgressUpdate(finished, total);
            }
        });

        await LevelMgr.instance.loadLevel();

        loadingNode.removeFromParent();
        loadingNode.destroy();
        UIManager.inst.closePage();
    }

}