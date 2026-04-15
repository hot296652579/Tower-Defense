import { _decorator, Component, ProgressBar } from 'cc';
import { AssetManagerEx } from '../../scripts/core/AssetManagerEx';
import { UILayer, UIManager } from '../../scripts/core/UIManager';

const { ccclass, property } = _decorator;

@ccclass('Loading')
export class Loading extends Component {

    @property(ProgressBar)
    private progressBar: ProgressBar = null!;

    async start() {
        await this.loadBaseBundles();

        await this.enterMain();
    }

    /** ================= 基础资源加载 ================= */
    async loadBaseBundles() {

        // common（必须最先）
        await AssetManagerEx.inst.loadBundle('common');
        this.update(30);

        // ui（界面）
        await AssetManagerEx.inst.loadBundle('ui');
        this.update(60);

        // audio（可延后）
        await AssetManagerEx.inst.loadBundle('audio');
        this.update(80);
    }

    /** ================= 进入主界面 ================= */
    async enterMain() {

        this.update(100);

        // 销毁Loading UI
        this.node.destroy();

        // 打开主页面
        await UIManager.inst.open('page/LoginPage', UILayer.Page);
    }

    update(percent: number) {
        this.progressBar.progress = percent / 100;
    }
}