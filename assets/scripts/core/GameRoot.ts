import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {

    @property(Node) sceneLayer: Node = null!;
    @property(Node) MapRoot: Node = null!;
    @property(Node) CharacterRoot: Node = null!;
    @property(Node) TowerRoot: Node = null!;
    @property(Node) BulletRoot: Node = null!;
    @property(Node) EffectRoot: Node = null!;

    @property(Node) pageLayer: Node = null!;
    @property(Node) windowLayer: Node = null!;
    @property(Node) popupLayer: Node = null!;
    @property(Node) topLayer: Node = null!;
    @property(Node) effectLayer: Node = null!;
    @property(Node) loadingLayer: Node = null!;

    static inst: GameRoot;

    onLoad() {
        GameRoot.inst = this;

        const mapPriority = this.MapRoot.getComponent(UITransform).priority;
        const enemyPriority = this.CharacterRoot.getComponent(UITransform).priority;
        this.MapRoot.getComponent(UITransform).priority = -1;
        this.CharacterRoot.getComponent(UITransform).priority = mapPriority + 1;

        // console.log('MapRoot pos:', this.MapRoot.worldPosition);
        // console.log('CharacterRoot pos:', this.CharacterRoot.worldPosition);
    }
}