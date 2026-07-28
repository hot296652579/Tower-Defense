import { _decorator, Camera, Component, director, EventTouch, instantiate, Node } from "cc";
const { ccclass, property } = _decorator;

import { BundlesEnum } from "../../define/BundlesEnum";
import { UIConfig } from "../../define/UIEnum";
import { ConfigManager } from "../../framework/config/ConfigManager";
import { ResourceManager } from "../../framework/resource/ResourceManager";
import { UILayerRoot } from "../../ui/layer/UILayer";
import { UIManager } from "../../ui/manager/UIManager";
import { ChooseHeroWnd } from "../../ui/window/battle/ChooseHeroWnd";
import { LevelConfig } from "./data/LevelConfigType";
import EcsWorld from "./ecs/base/EcsWorld";
import BattleGlobalComp from "./ecs/components/BattleGlobalComp";
import EnemyComp from "./ecs/components/EnemyComp";
import HeroComp from "./ecs/components/HeroComp";
import TransformComp from "./ecs/components/TransformComp";
import { EnemyFactory } from "./ecs/factory/EnemyFactory";
import { HeroFactory } from "./ecs/factory/HeroFactory";
import FsmSwitchSystem from "./ecs/systems/FsmSwitchSystem";
import MoveSystem from "./ecs/systems/MoveSystem";
import MapPathData from "./map/MapPathData";
import { RenderEntityManager } from "./render/RenderEntityManager";
import MeleeAttackSystem from "./ecs/systems/MeleeAttackSystem";
import { DamageCalcManager } from "./manager/DamageCalcManager";
import { HpBarManager } from "./ui/HpBarManager";
import { EventManager } from "../../framework/event/EventManager";
import { GameEvent } from "../../framework/event/EventName";
import RangerAttackSystem from "./ecs/systems/RangerAttackSystem";
import { EffectManager } from "./manager/EffectManager";
import { ProjectileManager } from "./manager/ProjectileManager";
import HealerSystem from "./ecs/systems/HealerSystem";

@ccclass
export default class BattleRoot extends Component {
    @property(Node)
    public uiRoot!: Node;
    @property(Node)
    public mapRoot!: Node;

    @property(Node)
    public mapNode!: Node; //地图容器

    @property(Node)
    public entityRoot!: Node;// 战斗实体渲染父节点：怪物、英雄、炮塔

    @property(Camera)
    public mainCamera!: Camera;

    // 当前关卡ID
    private _levelId: number = 0;
    // 当前关卡配置
    private _levelCfg!: LevelConfig;
    // ECS世界实例
    private _ecsWorld!: EcsWorld;
    // 地图路径数据缓存
    private _mapPathData!: MapPathData;
    // 全局战斗实体固定ID
    private readonly _globalBattleEntityId = 1;

    private _isRestarting: boolean = false;

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_END, this.onSceneClick, this);
        EventManager.getInstance().on(GameEvent.GAME_RESTART_LEVEL, this.onGameRestartLevel, this);
    }

    async start() {
        //  获取关卡ID 暂定为1
        this._levelId = 1;

        UILayerRoot.initRoot(this.uiRoot);

        console.log("开始加载game分包");
        await ConfigManager.getInstance().loadTable("hero_table", BundlesEnum.Table);
        await ConfigManager.getInstance().loadTable("enemy_table", BundlesEnum.Table);
        await ConfigManager.getInstance().loadTable("level_table", BundlesEnum.Table);

        const bundle = await ResourceManager.getInstance().loadBundle(BundlesEnum.Game);
        if (!bundle) {
            console.error("game分包加载失败");
            return;
        }

        await this.battleInit();

        // ----------------【测试代码】----------------
        // 测试：在path_0起点生成怪物战士
        this.testAddMonster();
        // --------------------------------------------
    }

    private async battleInit(): Promise<void> {
        // 获取关卡配置
        this._levelCfg = ConfigManager.getInstance().getRowById<LevelConfig>("level_table", this._levelId)!;
        if (!this._levelCfg) {
            console.error("关卡配置不存在 id = ", this._levelId);
            return;
        }

        EffectManager.getInstance().clearAllEffect();
        ProjectileManager.getInstance().clearAllProjectile();

        this.entityRoot.removeAllChildren();
        this.mapNode.removeAllChildren();
        await this.loadMap();
        await this.initEcsWorld();
        EnemyFactory.setEcsWorld(this._ecsWorld);
        HeroFactory.setEcsWorld(this._ecsWorld);
        console.log("ECS世界初始化完成");
        await RenderEntityManager.getInstance().init(this.entityRoot, this._ecsWorld);
        console.log("渲染实体管理器初始化完成");
        await UIManager.getInstance().openWindow(UIConfig.BattleWnd.name);
        await UIManager.getInstance().openWindow(UIConfig.ChooseHeroWnd.name);
        console.log("战斗窗口打开完成");

        console.log("===== 战斗初始化全部完成 =====");
    }

    /** 加载地图并且解析路径 */
    private async loadMap() {
        const mapPrefab = await ResourceManager.getInstance().loadPrefab(this._levelCfg.mapAssetPath, "game");
        if (!mapPrefab) {
            console.error("地图加载失败 path:", this._levelCfg.mapAssetPath);
            return;
        }
        const mapInstance = instantiate(mapPrefab);
        mapInstance.setParent(this.mapNode);

        // 解析地图所有path路径点
        this._mapPathData = new MapPathData();
        this._mapPathData.parseFromMapNode(mapInstance);
    }

    /** 初始化ECS世界，创建全局战斗实体 */
    private async initEcsWorld() {
        this._ecsWorld = new EcsWorld();
        // 创建全局战斗实体
        const globalEntity = this._ecsWorld.createEntity();
        const globalComp = this._ecsWorld.addComponent(globalEntity, BattleGlobalComp);
        // 填充关卡初始数据
        globalComp.gold = this._levelCfg.initGold;
        globalComp.baseHp = this._levelCfg.baseMaxHp;
        globalComp.baseMaxHp = this._levelCfg.baseMaxHp;
        globalComp.curWaveIndex = 0;
        globalComp.canStartNextWave = true;
        globalComp.gameSpeed = 1;
        globalComp.isPause = false;

        // =====================后续在这里注册所有System=====================
        this._ecsWorld.registerSystem(new MeleeAttackSystem());
        this._ecsWorld.registerSystem(new RangerAttackSystem());
        this._ecsWorld.registerSystem(new HealerSystem());
        this._ecsWorld.registerSystem(new MoveSystem());
        this._ecsWorld.registerSystem(new FsmSwitchSystem());

        // this._ecsWorld.registerSystem(new WaveSpawnSystem());
        // =================================================================

        // 初始化事件驱动管理器
        await DamageCalcManager.getInstance().init(this._ecsWorld);
        await HpBarManager.getInstance().init();
        await HpBarManager.getInstance().loadHpBarPrefab();
        await EffectManager.getInstance().init();
    }

    protected update(dt: number): void {
        if (!this._ecsWorld) return;
        // 获取全局倍速
        const globalComp = this._ecsWorld.tryGetComponent(this._globalBattleEntityId, BattleGlobalComp);
        if (!globalComp || globalComp.isPause) return;
        const realDt = dt * globalComp.gameSpeed;
        // 驱动所有ECS系统
        this._ecsWorld.update(realDt);

        const entityList = this._ecsWorld.queryEntities([TransformComp, EnemyComp]);
        RenderEntityManager.getInstance().syncAllTransform(entityList, this._ecsWorld);
        // 同步所有英雄Transform
        const heroList = this._ecsWorld.queryEntities([TransformComp, HeroComp]);
        RenderEntityManager.getInstance().syncAllTransform(heroList, this._ecsWorld);
    }

    private async onGameRestartLevel(): Promise<void> {
        if (this._isRestarting) return;
        this._isRestarting = true;

        console.log("开始重新加载关卡");
        await this.battleInit();
        this._isRestarting = false;
        this.testAddMonster();
    }

    //测试代码添加怪物
    private testAddMonster(): void {
        for (let i = 0; i < 1; i++) {
            setTimeout(() => {
                const id = [101, 101];
                const path = ['path_0', 'path_1'];
                const randomPath = path[Math.floor(Math.random() * path.length)];
                const startPos = this._mapPathData.getPathStartPos(randomPath);
                const randomId = id[Math.floor(Math.random() * id.length)];
                EnemyFactory.testSpawnMonster(randomId, randomPath, startPos);
            }, i * 350);
        }
    }

    /** 场景点击事件 */
    private onSceneClick(event: EventTouch): void {
        // console.log("场景点击事件:", event.getLocation());

        const heroWnd = UIManager.getInstance().getWindow<ChooseHeroWnd>(UIConfig.ChooseHeroWnd.name);
        if (!heroWnd) {
            console.warn("英雄选择窗口未打开");
            return;
        }
        const selectHeroId = heroWnd.getSelectHeroId();
        if (selectHeroId === 0) {
            console.warn("未选择任何英雄，请先点击左侧英雄按钮");
            return;
        }

        let touchPos = event.getUILocation();
        HeroFactory.createHero(selectHeroId, touchPos);
    }

    /*** 对外获取路径数据 System需要读取路径点位*/
    public getMapPathData(): MapPathData {
        return this._mapPathData;
    }

    /*** 获取实体渲染父节点（提供给RenderEntityManager）*/
    public getEntityRoot(): Node {
        return this.entityRoot;
    }

    /** 退出战斗，清理所有资源 */
    public exitBattle() {
        // 销毁ECS世界
        this._ecsWorld.clear();
        // 关闭战斗窗口
        UIManager.getInstance().closeWindow(UIConfig.BattleWnd.name);
        director.loadScene("scene/Start");
    }

    protected onDestroy(): void {
        if (this._ecsWorld) {
            this._ecsWorld.clear();
        }
    }
}