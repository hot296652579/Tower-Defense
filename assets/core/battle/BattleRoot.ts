import { _decorator, Component, find } from 'cc';
import { UILayerRoot } from '../../ui/layer/UILayer';
const { ccclass, property } = _decorator;

@ccclass('BattleRoot')
export class BattleRoot extends Component {

    start() {
        const UIRoot = find('Canvas/UIRoot');
        UILayerRoot.initRoot(UIRoot);
    }
}


