import { _decorator, Component, instantiate, Node, Prefab, resources } from 'cc';

const { ccclass } = _decorator;

@ccclass('Start')
export class Start extends Component {

    private loadingNode: Node = null!;

    async start() {
        await this.initLoadingUI();
    }

    /** ================= 初始化Loading ================= */
    async initLoadingUI() {
        return new Promise<void>((resolve) => {
            resources.load('prefabs/Loading', Prefab, (err, prefab) => {
                if (err) {
                    console.error('Loading prefab load failed', err);
                    return;
                }

                this.loadingNode = instantiate(prefab);
                GameRoot.inst.loadingLayer.addChild(this.loadingNode);

                resolve();
            });
        });
    }
}