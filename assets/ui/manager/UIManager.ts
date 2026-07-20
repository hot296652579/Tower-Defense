// assets/ui/manager/UIManager.ts
import { instantiate } from "cc";
import BaseSingleton from "../../framework/base/BaseSingleton";
import { ResourceManager } from "../../framework/resource/ResourceManager";
import BaseWindow, { WindowOpenParam } from "../base/BaseWindow";
import { UILayerRoot, UILayerType } from "../layer/UILayer";

/** 窗口配置注册结构 */
interface WindowCfg {
    prefabPath: string;
    bundle?: string;
    cache: boolean;
}

export class UIManager extends BaseSingleton {
    /** 窗口注册表：key -> 资源路径+缓存配置 */
    private _windowRegister: Map<string, WindowCfg> = new Map();
    /** 已实例化窗口缓存 key -> window脚本 */
    private _windowCache: Map<string, BaseWindow> = new Map();
    /** 当前栈顶弹窗 */
    private _popupStack: string[] = [];

    public async init(): Promise<void> {
        this._windowRegister.clear();
        this._windowCache.clear();
        this._popupStack = [];
    }

    public destroy(): void {
        this._windowCache.forEach(win => win.node.destroy());
        this._windowCache.clear();
        this._windowRegister.clear();
        this._popupStack = [];
    }

    //#region 注册窗口（初始化统一注册所有UI）
    /** 注册窗口，必须先注册才能openWindow */
    public registerWindow(key: string, prefabPath: string, cache = false, bundle?: string): void {
        this._windowRegister.set(key, {
            prefabPath,
            bundle,
            cache
        });
    }
    //#endregion

    //#region 打开窗口核心接口
    public async openWindow(key: string, param: WindowOpenParam = null): Promise<BaseWindow | null> {
        const cfg = this._windowRegister.get(key);
        if (!cfg) {
            console.error(`UIManager: 未注册窗口key = ${key}`);
            return null;
        }

        // 缓存存在直接复用
        if (this._windowCache.has(key)) {
            const win = this._windowCache.get(key)!;
            win.onOpen(param);
            this.pushPopupStack(key, win.windowLayer);
            return win;
        }

        // 加载prefab
        const prefab = await ResourceManager.getInstance().loadPrefab(cfg.prefabPath, cfg.bundle);
        if (!prefab) {
            console.error(`UIManager: 加载窗口prefab失败 ${cfg.prefabPath}`);
            return null;
        }

        // 实例化窗口节点
        const node = instantiate(prefab);
        const win = node.getComponent(BaseWindow);
        if (!win) {
            console.error(`UIManager: Prefab未挂载BaseWindow脚本 ${key}`);
            node.destroy();
            return null;
        }

        // 设置窗口基础信息
        win.windowKey = key;
        win.isCache = cfg.cache;
        const parent = UILayerRoot.getRootByLayer(win.windowLayer);
        if (!parent) {
            console.error("UIManager: UI分层根节点未初始化");
            node.destroy();
            return null;
        }
        node.setParent(parent);
        node.setPosition(0, 0, 0);
        node.active = false;

        // 加入缓存
        if (cfg.cache) {
            this._windowCache.set(key, win);
        }

        // 打开窗口
        win.onOpen(param);
        this.pushPopupStack(key, win.windowLayer);
        return win;
    }
    //#endregion

    //#region 关闭窗口
    /** 根据key关闭窗口 */
    public closeWindow(key: string): void {
        const win = this._windowCache.get(key);
        if (!win) return;
        win.closeWindow();
        this.popPopupStack(key);
    }

    /** 关闭栈顶弹窗（只关闭POPUP/TOP_POPUP层级） */
    public closeTopPopup(): void {
        if (this._popupStack.length === 0) return;
        const topKey = this._popupStack[this._popupStack.length - 1];
        this.closeWindow(topKey);
    }

    /** 清空所有弹窗栈 */
    public clearAllPopup(): void {
        [...this._popupStack].forEach(key => this.closeWindow(key));
        this._popupStack = [];
    }
    //#endregion

    //#region 弹窗栈管理
    private pushPopupStack(key: string, layer: UILayerType): void {
        // 仅弹窗层级入栈，主界面不入栈
        if (layer >= UILayerType.POPUP_WIN) {
            this._popupStack.push(key);
        }
    }

    private popPopupStack(key: string): void {
        const idx = this._popupStack.findIndex(k => k === key);
        if (idx !== -1) {
            this._popupStack.splice(idx, 1);
        }
    }
    //#endregion
}