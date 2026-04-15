import { instantiate, Node, Prefab } from 'cc';
import { AssetManagerEx } from './AssetManagerEx';
import { GameRoot } from './GameRoot';

export enum UILayer {
    Page,
    Window,
    Popup,
    Loading,
    Effect,
    Top
}

class UIItem {
    name: string;
    node: Node;
    layer: UILayer;
}

export class UIManager {

    private static _inst: UIManager;
    public static get inst() {
        if (!this._inst) this._inst = new UIManager();
        return this._inst;
    }

    // 当前打开的UI
    private uiMap: Map<string, UIItem> = new Map();

    // Window栈
    private windowStack: string[] = [];

    // 当前页面
    private currentPage: string = '';

    /** ================= 打开UI ================= */
    async open(uiName: string, layer: UILayer) {

        // ✅ 防重复打开
        if (this.uiMap.has(uiName)) {
            return this.uiMap.get(uiName)!.node;
        }

        // ✅ Page互斥
        if (layer === UILayer.Page) {
            await this.closePage();
            this.currentPage = uiName;
        }

        const prefab = await AssetManagerEx.inst.load<Prefab>('ui', uiName, Prefab);
        const node = instantiate(prefab);

        const parent = this.getLayerNode(layer);
        parent.addChild(node);

        const item: UIItem = {
            name: uiName,
            node,
            layer
        };

        this.uiMap.set(uiName, item);

        // ✅ Window入栈
        if (layer === UILayer.Window) {
            this.windowStack.push(uiName);
        }

        return node;
    }

    /** ================= 关闭UI ================= */
    async close(uiName: string) {
        const item = this.uiMap.get(uiName);
        if (!item) return;

        // （可扩展：动画）
        item.node.destroy();

        this.uiMap.delete(uiName);

        // ✅ 释放资源
        AssetManagerEx.inst.release('ui', uiName);

        // ✅ Window栈处理
        if (item.layer === UILayer.Window) {
            this.windowStack = this.windowStack.filter(n => n !== uiName);
        }

        // ✅ Page清理
        if (item.layer === UILayer.Page) {
            this.currentPage = '';
        }
    }

    /** ================= 关闭当前页面 ================= */
    async closePage() {
        if (!this.currentPage) return;

        await this.close(this.currentPage);
        this.currentPage = '';
    }

    /** ================= 返回（关闭最上层Window） ================= */
    async back() {
        if (this.windowStack.length === 0) return;

        const top = this.windowStack.pop()!;
        await this.close(top);
    }

    /** ================= 关闭某一层所有UI ================= */
    async closeByLayer(layer: UILayer) {
        const list: string[] = [];

        this.uiMap.forEach((item, key) => {
            if (item.layer === layer) {
                list.push(key);
            }
        });

        for (const name of list) {
            await this.close(name);
        }
    }

    /** ================= 获取层节点 ================= */
    private getLayerNode(layer: UILayer): Node {
        const root = GameRoot.inst;

        switch (layer) {
            case UILayer.Page: return root.pageLayer;
            case UILayer.Window: return root.windowLayer;
            case UILayer.Popup: return root.popupLayer;
            case UILayer.Loading: return root.loadingLayer;
            case UILayer.Effect: return root.effectLayer;
            case UILayer.Top: return root.topLayer;
        }
    }
}