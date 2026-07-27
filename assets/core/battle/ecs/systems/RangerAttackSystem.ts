import { Vec2, math, Node } from "cc";
import EcsSystem from "../base/EcsSystem";
import TransformComp from "../components/TransformComp";
import AttackComp from "../components/AttackComp";
import RangerBulletComp from "../components/RangerBulletComp";
import CampComp from "../components/CampComp";
import HPComp from "../components/HPComp";
import DamageTypeComp from "../components/DamageTypeComp";
import { EntityType } from "../../data/UnitConfigType";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import { EntityFsmState } from "../components/FsmStateComp";
import { BattleConfigHelper, UnitBulletConfig } from "../../data/BattleConfigHelper";
import { UILayerRoot, UILayerType } from "db://assets/ui/layer/UILayer";
import { EffectManager } from "../../manager/EffectManager";
// 投射物管理器
import { ProjectileManager, ProjectileRuntimeInfo } from "../../manager/ProjectileManager";

export default class RangerAttackSystem extends EcsSystem {

    private _projectileMgr = ProjectileManager.getInstance();

    public update(dt: number): void {
        this.handleRangerAttack(dt);
        // 交给管理器统一更新所有子弹，获取命中列表
        const hitProjectileList = this._projectileMgr.updateAllProjectile(dt, this.world);
        this.handleAllHitProjectile(hitProjectileList);
    }

    private handleRangerAttack(dt: number) {
        const rangerEntityList = this.world.queryEntities([
            TransformComp,
            AttackComp,
            RangerBulletComp,
            CampComp,
            DamageTypeComp
        ]);

        for (const eid of rangerEntityList) {
            const trans = this.world.getComponent(eid, TransformComp);
            const atkComp = this.world.getComponent(eid, AttackComp);
            const bulletComp = this.world.getComponent(eid, RangerBulletComp);
            const campComp = this.world.getComponent(eid, CampComp);

            atkComp.atkCd -= dt;
            if (atkComp.atkCd > 0) continue;

            const targetEid = this.findEnemyTargetInRange(eid, campComp.camp, trans.pos, atkComp.atkRange);
            if (targetEid <= 0) continue;

            atkComp.atkCd = atkComp.atkInterval;
            atkComp.isAttacking = true;

            // 动态填充子弹组件战斗数据
            bulletComp.sourceEntityId = eid;
            bulletComp.targetId = targetEid;
            bulletComp.damage = atkComp.atk;

            // 读取子弹配置
            const bulletCfg: UnitBulletConfig = BattleConfigHelper.getBattleByBulletConfig(this.world, eid);
            if (!bulletCfg.bulletPath) continue;

            //子弹生成
            this._projectileMgr.spawnProjectile(
                trans.pos,
                targetEid,
                eid,
                atkComp.atkRange,
                bulletCfg.bulletPath,
                UILayerRoot.getRootByLayer(UILayerType.SCENE_UI)!
            );
        }
    }

    private findEnemyTargetInRange(attackerEid: number, selfCamp: EntityType, attackerPos: Vec2, range: number): number {
        const allTargets = this.world.queryEntities([TransformComp, HPComp, CampComp]);
        let nearestId = 0;
        let minDist = range;

        for (const targetEid of allTargets) {
            const hp = this.world.getComponent(targetEid, HPComp);
            const targetCamp = this.world.getComponent(targetEid, CampComp).camp;
            if (hp.curHp <= 0 || targetCamp === selfCamp) continue;

            const targetTrans = this.world.getComponent(targetEid, TransformComp);
            const dist = math.Vec2.distance(attackerPos, targetTrans.pos);
            if (dist < minDist) {
                minDist = dist;
                nearestId = targetEid;
            }
        }
        return nearestId;
    }

    /** 批量处理所有命中子弹：伤害、事件、特效 */
    private handleAllHitProjectile(hitList: ProjectileRuntimeInfo[]) {
        for (const info of hitList) {
            const bulletComp = this.world.tryGetComponent(info.attackerEid, RangerBulletComp);
            const dmgTypeComp = this.world.tryGetComponent(info.attackerEid, DamageTypeComp);
            const targetTrans = this.world.tryGetComponent(info.targetEid, TransformComp);
            if (!bulletComp || !dmgTypeComp || !targetTrans) continue;

            const bulletCfg: UnitBulletConfig = BattleConfigHelper.getBattleByBulletConfig(this.world, info.attackerEid);
            const atkComp = this.world.tryGetComponent(info.attackerEid, AttackComp);
            if (atkComp) atkComp.isAttacking = false;

            // 攻击事件
            EventManager.getInstance().emit(
                GameEvent.ENTITY_ATTACK,
                info.attackerEid,
                info.targetEid,
                bulletComp.damage,
                dmgTypeComp.damageType
            );

            // 攻击状态动画
            EventManager.getInstance().emit(
                GameEvent.ENTITY_STATE_CHANGE,
                info.attackerEid,
                EntityFsmState.ATTACK
            );

            // 播放命中特效
            if (bulletCfg.hitEffectPath) {
                EffectManager.getInstance().playEffect(bulletCfg.hitEffectPath, targetTrans.pos);
            }
        }
    }

    /** 关卡刷新清空子弹，转发给管理器 */
    public clearAllBullet() {
        this._projectileMgr.clearAllProjectile();
    }
}