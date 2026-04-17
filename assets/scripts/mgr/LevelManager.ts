import { instantiate, Node, Prefab, TiledMap } from "cc";
import { AssetManagerEx } from "../core/AssetManagerEx";
import { GameRoot } from "../core/GameRoot";
import { GameManager } from "../game/GameManager";
import { MapManager } from "../game/map/MapManager";

export class LevelManager {

    private currentLevel: Node | null = null;
    private currentLevelName: string = '';

    /**
     * 关卡管理器实例
     */
    static inst: LevelManager = new LevelManager();

    /**
     * 加载关卡
     * @param levelName 关卡名称
     */
    async loadLevel(levelName: string) {

        await this.unloadLevel();

        await AssetManagerEx.inst.loadBundle('levels');

        const prefab = await AssetManagerEx.inst.load<Prefab>(
            'levels',
            `prefab/${levelName}`
        );

        this.currentLevel = instantiate(prefab);
        this.currentLevelName = levelName;

        GameRoot.inst.MapRoot.addChild(this.currentLevel);

        const tiledMap = this.currentLevel.getComponentsInChildren(TiledMap);
        if (!tiledMap) {
            console.log('加载关卡', levelName, '失败');
            return;
        }

        MapManager.inst.init(tiledMap[0]);
        GameManager.inst.onLevelReady();
    }

    async unloadLevel() {
        if (this.currentLevel) {
            this.currentLevel.destroy();
            this.currentLevel = null;
        }

        AssetManagerEx.inst.releaseBundle('levels');
    }
}