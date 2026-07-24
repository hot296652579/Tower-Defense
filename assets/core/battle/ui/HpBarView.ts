import { _decorator, Component, ProgressBar, Label, Node, Vec3, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HpBarView')
export class HpBarView extends Component {
    @property(ProgressBar)
    progressBar: ProgressBar = null!;
    @property(Label)
    hpLabel: Label = null!;

    private readonly offsetY = 32;
    private targetNode: Node | null = null;

    bindTarget(node: Node) {
        this.targetNode = node;
        this.node.active = true;
    }

    unbind() {
        this.targetNode = null;
        Tween.stopAllByTarget(this.node);
        this.node.active = false;
    }

    refreshHp(cur: number, max: number) {
        this.progressBar.progress = cur / max;
        this.hpLabel.string = `${Math.floor(cur)}/${Math.floor(max)}`;
    }

    playHurtFlash() {
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .to(0.08, { scale: new Vec3(1.15, 1.15, 1) })
            .to(0.08, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    update() {
        if (!this.targetNode || !this.targetNode.isValid) return;
        const worldPos = this.targetNode.worldPosition.clone();
        worldPos.y += this.offsetY;
        this.node.setWorldPosition(worldPos);
    }

    onDestroy(): void {
        this.unbind();
    }
}