/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2026-04-20 21:51:28
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2026-04-20 22:40:18
 * @FilePath: /Tower-Defense/assets/scripts/ecs/systems/BuildSystem.ts
 * @Description: 创建建造系统，监听触摸事件，尝试在塔位上建造塔
 */
import { _decorator, Camera, Component, EventTouch, find, input, Input, UITransform, Vec3 } from 'cc';
import { GameRoot } from '../../core/GameRoot';
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

        const localPos = GameRoot.inst.MapRoot
            .getComponent(UITransform)
            .convertToNodeSpaceAR(
                new Vec3(uiPos.x, uiPos.y, 0)
            );

        this.tryBuild(localPos);
    }

    private tryBuild(pos: Vec3) {
        console.log('尝试建造，世界坐标:', pos);
        const points = TowerManager.inst.getPoints();

        for (const p of points) {

            if (p.occupied) continue;

            // const dist = pos.clone().subtract(p.pos).length();
            const dx = pos.x - p.pos.x;
            const dy = pos.y - p.pos.y;

            const dist = Math.sqrt(dx * dx + dy * dy);
            console.log('点击位置:', pos, '塔位:', p.pos, '半径:', p.radius, '距离:', dist);
            if (dist <= p.radius) {
                console.log('点击塔位:', p.id);
                TowerFactory.create(p);
                return;
            }
        }
    }
}