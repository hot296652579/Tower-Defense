import { _decorator, Asset, Component, Label, Node, ProgressBar, sys } from 'cc';
import { Config } from '../../scripts/Config';
import { AssetManagerEx } from '../../scripts/core/AssetManagerEx';
import { EventMgr } from '../../scripts/core/EventManager';
import { UILayer, UIManager } from '../../scripts/core/UIManager';
import { BundlesEnum } from '../../scripts/define/BundlesEnum';
import { HotUpdateEventEnum } from '../../scripts/define/EventEnum';
import { UIEnum } from '../../scripts/define/UIEnum';
import { HotUpdate } from './HotUpdate';

const { ccclass, property } = _decorator;

const bundles = [
    BundlesEnum.Common,
    BundlesEnum.UI,
    BundlesEnum.Audio,
];

@ccclass('Loading')
export class Loading extends Component {

    @property(Asset)
    manifest: Asset = null!;

    private hotUpdate: HotUpdate = null!;

    @property(ProgressBar)
    private progressBar: ProgressBar = null!;

    @property(Label)
    private loadingLabel: Label = null!;

    @property(Node)
    private updatePanel: Node = null!;

    @property(ProgressBar)
    private updateProgressBar: ProgressBar = null!;

    @property(Label)
    private updateLabel: Label = null!;

    onLoad() {
        EventMgr.on(HotUpdateEventEnum.new_version_found, this.new_version_found, this);
        EventMgr.on(HotUpdateEventEnum.update_failed, this.update_failed, this);
        EventMgr.on(HotUpdateEventEnum.already_up_to_date, this.already_up_to_date, this);
    }

    protected start(): void {
        this.initedAfter();
    }

    private initedAfter(): void {
        if (!sys.isNative) {
            console.log('非原生平台，跳过热更新');
            this.startLoadRes();
            return;
        }

        if (Config.isDev) {
            this.startLoadRes();
            return;
        }

        // 进行热更新
        this.hotUpdate = this.getComponent(HotUpdate);
        console.log('获取挂载的manifest资源', this.manifest);
        this.hotUpdate.manifest = this.manifest;
        this.hotUpdate.init(1);
        this.hotUpdate.checkUpdate();
    }

    private async already_up_to_date() {
        await this.startLoadRes();
    }

    async startLoadRes() {
        this.updatePanel.active = false;
        await this.loadAllBundles(bundles);
        await this.enterMain();
    }

    private async new_version_found() {
        this.updatePanel.active = true;
        this.updateProgressBar.progress = 0;
        this.updateLabel.string = "检测到新版本,开始更新...";

        this.hotUpdate.hotUpdate();
    }

    private async update_failed() {
        // await this.startLoadRes();
    }

    /**
     * 加载所有 Bundle下的所有资源，实时回调进度
     * @param bundles Bundle名称数组
     */
    private async loadAllBundles(bundles: string[]) {
        const totalBundleCount = bundles.length;
        let currentBundleIndex = 0;

        for (const bundleName of bundles) {
            await AssetManagerEx.inst.loadBundleWithProgress(bundleName, (finished, total) => {
                // 计算真实总进度
                const p1 = currentBundleIndex / totalBundleCount;
                const p2 = finished / total;
                const totalProgress = p1 + p2 / totalBundleCount;

                // 更新进度条和加载状态文本
                this.progressBar.progress = totalProgress;
                this.loadingLabel.string = `${Math.floor(totalProgress * 100)}%`;
            });

            currentBundleIndex++;
        }
    }

    /** 进入主界面 */
    private async enterMain() {
        this.progressBar.progress = 1;
        await UIManager.inst.open(UIEnum.HomePage, UILayer.Page);
        this.node.destroy();
    }
}