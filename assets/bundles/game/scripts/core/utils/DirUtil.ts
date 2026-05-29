import { Vec3 } from 'cc';
import { AnimDir } from '../../battle/define/AnimDefine';

export class DirUtil {
    // 计算 8 方向，返回枚举
    public static get8Dir(from: Vec3, to: Vec3): AnimDir {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);

        if (ax > ay) {
            return dx > 0 ? AnimDir.RIGHT : AnimDir.LEFT;
        } else {
            if (dy > 0) {
                if (dx > 0.3) return AnimDir.UP_RIGHT;
                if (dx < -0.3) return AnimDir.UP_LEFT;
                return AnimDir.UP;
            } else {
                if (dx > 0.3) return AnimDir.DOWN_RIGHT;
                if (dx < -0.3) return AnimDir.DOWN_LEFT;
                return AnimDir.DOWN;
            }
        }
    }
}