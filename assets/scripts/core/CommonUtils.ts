import { instantiate, Prefab, warn } from 'cc';

import { ItemID } from '../../bundles/game/scripts/config/GameEnum';
import { BundlesEnum } from '../define/BundlesEnum';
import { UIEnum } from '../define/UIEnum';
import { AssetManagerEx } from './AssetManagerEx';
import { GameRoot } from './GameRoot';
import { UILayer, UIManager } from './UIManager';

export class CommonUtils {
    private static _instance: CommonUtils;
    public static get inst() {
        if (!this._instance) this._instance = new CommonUtils();
        return this._instance;
    }

    init() {
        // EventMgr.on(EventEnum.SHOW_ITEM_ZOOM, this.showItemZoomIn, this);
    }

    /**
     * 通用提示弹窗窗口
     * @param msg 提示内容
     * @param confirmCb 确认按钮回调
     */
    public async showToast(msg: string, confirmCb: () => void) {
        const windowLayer = GameRoot.inst.MapRoot;
        if (!windowLayer) {
            warn('未找到 windowLayer 节点，请在 Canvas 下创建该节点！');
            return;
        }

        try {
            const toaskNode = await UIManager.inst.open(UIEnum.Toast, UILayer.Window);

            const toast = toaskNode.getComponent('Toast') as any;
            if (toast) {
                toast.init(msg, confirmCb);
            }
        } catch (err) {
            warn('弹窗加载失败：', err);
        }
    }

    /**设置弹窗*/
    public async showSetting() {
        const windowLayer = GameRoot.inst.MapRoot;
        if (!windowLayer) {
            warn('未找到 windowLayer 节点，请在 Canvas 下创建该节点！');
            return;
        }

        try {
            await UIManager.inst.open(UIEnum.Setting, UILayer.Window);
        } catch (err) {
            warn('弹窗加载失败：', err);
        }
    }

    /**通用提示*/
    public async showTips(msg: string) {
        const tipsLayer = GameRoot.inst.popupLayer;
        if (!tipsLayer) {
            warn('未找到 tipsLayer 节点，请在 Canvas 下创建该节点！');
            return;
        }

        try {
            const tipsNode = await UIManager.inst.open(UIEnum.Tips, UILayer.Popup);

            const tips = tipsNode.getComponent('Tips') as any;
            if (tips) {
                tips.init(msg);
            }
        } catch (err) {
            warn('提示加载失败：', err);
        }
    }

    /**通用道具查看弹窗*/
    public async showItemZoomIn(itemId: ItemID) {
        const MapRoot = GameRoot.inst.MapRoot;
        if (!MapRoot) {
            warn('未找到 MapRoot 节点，请在 Canvas 下创建该节点！');
            return;
        }

        try {
            const prefab = await AssetManagerEx.inst.load<Prefab>(BundlesEnum.Game, 'prefab/ZoomIn');
            const zoomInNode = instantiate(prefab);
            MapRoot.addChild(zoomInNode);

            const zoomIn = zoomInNode.getComponent("ZoomIn") as any;
            if (zoomIn) {
                zoomIn.init(itemId);
            }
        } catch (err) {
            warn('道具查看弹窗加载失败：', err);
        }
    }

    /**通用密码锁弹窗*/
    public async showControlLock(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const LevelNode = GameRoot.inst.MapRoot.children[0];
            const itemBar = LevelNode.getComponentInChildren("ItemBar") as any;
            if (!itemBar) {
                warn('未找到 itemBar 节点');
                return reject('未找到 itemBar 节点');
            }

            try {
                const prefab = await AssetManagerEx.inst.load<Prefab>(
                    BundlesEnum.Game,
                    'prefab/other/ControlLock'
                );
                const controlLockNode = instantiate(prefab);

                LevelNode.addChild(controlLockNode);
                const targetIndex = itemBar.node.getSiblingIndex();
                controlLockNode.setSiblingIndex(targetIndex);

                console.log('itemBar zIndex:', itemBar.node.getSiblingIndex());
                console.log('controlLockNode zIndex:', controlLockNode.getSiblingIndex());

                resolve(controlLockNode);
            } catch (err) {
                warn('密码锁弹窗加载失败：', err);
                reject(err);
            }
        });
    }
}