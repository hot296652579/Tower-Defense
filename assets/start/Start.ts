import { _decorator, Component, instantiate, Node, Prefab, resources } from 'cc';
import { GameRoot } from '../scripts/core/GameRoot';

const { ccclass } = _decorator;

@ccclass('Start')
export class Start extends Component {

    private loadingNode: Node = null!;

    async start() {
        await this.initLoadingUI();
    }

    /** ================= 1. 初始化Loading ================= */
    async initLoadingUI() {
        return new Promise<void>((resolve) => {
            resources.load('prefab/Loading', Prefab, (err, prefab) => {
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