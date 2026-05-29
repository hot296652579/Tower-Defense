import { _decorator, instantiate, Prefab } from 'cc';
import { AssetManagerEx } from '../core/AssetManagerEx';
import { GameRoot } from '../core/GameRoot';
import { UILayer, UIManager } from '../core/UIManager';
import { BundlesEnum } from '../define/BundlesEnum';
const { ccclass, property } = _decorator;

@ccclass('LevelMgr')
export class LevelMgr {

    private level = 1;

    private static _instance: LevelMgr;
    public static get instance(): LevelMgr {
        if (!LevelMgr._instance) {
            LevelMgr._instance = new LevelMgr();
        }
        return LevelMgr._instance;
    }

    private constructor() { }

    public init() {
        //初始化操作
    }

    public async loadLevel() {
        const mapRoot = GameRoot.inst.MapRoot;
        mapRoot.removeAllChildren();

        let prefab = await this.loadLevelPrefab();
        if (prefab) {
            let node = instantiate(prefab);
            mapRoot.addChild(node);
            node.setPosition(0, 0, 0);
        }
    }

    // 获取当前关卡
    public getLevel(): number {
        return this.level;
    }

    // 设置当前关卡
    public setLevel(level: number) {
        this.level = level;
    }

    // 加载下一个关卡
    public loadNextLevel() {
        this.level++;
        this.loadLevel();
    }

    //加载关卡
    private async loadLevelPrefab(): Promise<Prefab> {
        return AssetManagerEx.inst.load<Prefab>(BundlesEnum.Game, `prefab/levels/Level${this.level}`, Prefab, (finished, total) => {
            // console.log(`加载关卡${this.level}进度：${finished}/${total}`);
        });

    }

    //返回指定页面
    public async backToPage(page: string) {
        GameRoot.inst.MapRoot.removeAllChildren();
        await UIManager.inst.open(`prefabs/page/${page}`, UILayer.Page);
    }

}