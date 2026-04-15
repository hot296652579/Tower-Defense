import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {

    @property(Node) sceneLayer: Node = null!;
    @property(Node) pageLayer: Node = null!;
    @property(Node) windowLayer: Node = null!;
    @property(Node) popupLayer: Node = null!;
    @property(Node) topLayer: Node = null!;
    @property(Node) effectLayer: Node = null!;
    @property(Node) loadingLayer: Node = null!;

    static inst: GameRoot;

    onLoad() {
        GameRoot.inst = this;
    }
}