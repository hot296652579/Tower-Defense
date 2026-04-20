import { _decorator, Camera, Component, EventTouch, find, input, Input, Vec3 } from 'cc';
import { TowerFactory } from '../../game/tower/TowerFactory';
import { TowerManager } from '../../mgr/TowerManager';

const { ccclass } = _decorator;

@ccclass('BuildSystem')
export class BuildSystem extends Component {

    private camera: Camera;

    protected onLoad(): void {
        this.camera = find('Canvas/Camera').getComponent(Camera);
    }

    onEnable() {
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDisable() {
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchEnd(event: EventTouch) {

        const uiPos = event.getUILocation();

        const worldPos = new Vec3();

        const screenPos = new Vec3(
            uiPos.x,
            uiPos.y,
            this.camera.node.worldPosition.z
        );

        this.camera.screenToWorld(screenPos, worldPos);

        this.tryBuild(worldPos);
    }

    private tryBuild(pos: Vec3) {

        const points = TowerManager.inst.getPoints();

        for (const p of points) {

            if (p.occupied) continue;

            const dist = pos.clone().subtract(p.pos).length();

            if (dist < 50) {

                TowerFactory.create(p);
                return;
            }
        }
    }
}