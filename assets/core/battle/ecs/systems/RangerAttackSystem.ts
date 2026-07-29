import { Vec2, math } from "cc";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import { UILayerRoot, UILayerType } from "db://assets/ui/layer/UILayer";
import { BattleConfigHelper, UnitBulletConfig } from "../../data/BattleConfigHelper";
import { EntityType } from "../../data/UnitConfigType";
import { EffectManager } from "../../manager/EffectManager";
import { ProjectileManager, ProjectileRuntimeInfo } from "../../manager/ProjectileManager";
import EcsSystem from "../base/EcsSystem";
import AttackComp from "../components/AttackComp";
import AttackModeComp, { AttackMode } from "../components/AttackModeComp";
import CampComp from "../components/CampComp";
import DamageTypeComp from "../components/DamageTypeComp";
import { EntityFsmState } from "../components/FsmStateComp";
import HPComp from "../components/HPComp";
import RangerBulletComp from "../components/RangerBulletComp";
import TransformComp from "../components/TransformComp";

export default class RangerAttackSystem extends EcsSystem {
    private _projectileMgr = ProjectileManager.getInstance();

    public update(dt: number): void {
        this.handleRangerAttack(dt);
        // 子弹帧更新，获取命中列表
        const hitProjectileList = this._projectileMgr.updateAllProjectile(dt, this.world);
        this.handleAllHitProjectile(hitProjectileList);
    }

    private handleRangerAttack(dt: number) {
        const rangerEntityList = this.world.queryEntities([
            TransformComp,
            AttackComp,
            RangerBulletComp,
            CampComp,
            DamageTypeComp,
            AttackModeComp
        ]);

        for (const eid of rangerEntityList) {
            if (this.world.getComponent(eid, AttackModeComp).mode !== AttackMode.RANGER) {
                continue;
            }

            const trans = this.world.getComponent(eid, TransformComp);
            const atkComp = this.world.getComponent(eid, AttackComp);
            const bulletComp = this.world.getComponent(eid, RangerBulletComp);
            const campComp = this.world.getComponent(eid, CampComp);

            // 每帧先清攻击标记
            atkComp.isAttacking = false;

            if (atkComp.atkCd > 0) {
                atkComp.atkCd -= dt;
            }

            const targetEid = this.findEnemyTargetInRange(eid, campComp.camp, trans.pos, atkComp.atkRange);
            if (targetEid <= 0) {
                // 无攻击目标：清锁定，怪物继续沿路径走
                atkComp.targetEntityId = 0;
                continue;
            }
            atkComp.targetEntityId = targetEid;

            if (atkComp.atkCd > 0) continue;

            // 出手
            atkComp.atkCd = atkComp.atkInterval;
            atkComp.isAttacking = true;

            const dmgTypeComp = this.world.getComponent(eid, DamageTypeComp);
            EventManager.getInstance().emit(
                GameEvent.ENTITY_ATTACK,
                eid,
                targetEid,
                atkComp.atk,
                dmgTypeComp.damageType
            );
            EventManager.getInstance().emit(
                GameEvent.ENTITY_STATE_CHANGE,
                eid,
                EntityFsmState.ATTACK
            );

            bulletComp.sourceEntityId = eid;
            bulletComp.targetId = targetEid;
            bulletComp.damage = atkComp.atk;

            const bulletCfg: UnitBulletConfig = BattleConfigHelper.getBattleByBulletConfig(this.world, eid);
            if (!bulletCfg.bulletPath) continue;

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

            const acterTrans = this.world.getComponent(attackerEid, TransformComp);
            const targetTrans = this.world.getComponent(targetEid, TransformComp);
            const dist = math.Vec2.distance(attackerPos, targetTrans.pos);

            const nx = (targetTrans.pos.x - attackerPos.x) / dist;
            acterTrans.faceDir = nx >= 0 ? 1 : -1;

            if (dist < minDist) {
                minDist = dist;
                nearestId = targetEid;
            }
        }
        return nearestId;
    }

    /**
     * 子弹命中仅处理：伤害计算 + 命中特效
     * 移除攻击、状态事件派发，不再重复触发攻击动画
     */
    private handleAllHitProjectile(hitList: ProjectileRuntimeInfo[]) {
        for (const info of hitList) {
            const bulletComp = this.world.tryGetComponent(info.attackerEid, RangerBulletComp);
            const dmgTypeComp = this.world.tryGetComponent(info.attackerEid, DamageTypeComp);
            const targetTrans = this.world.tryGetComponent(info.targetEid, TransformComp);
            if (!bulletComp || !dmgTypeComp || !targetTrans) continue;

            const bulletCfg: UnitBulletConfig = BattleConfigHelper.getBattleByBulletConfig(this.world, info.attackerEid);

            if (bulletCfg.hitEffectPath) {
                EffectManager.getInstance().playEffect(bulletCfg.hitEffectPath, targetTrans.pos);
            }
        }
    }

    /** 关卡刷新清空子弹 */
    public clearAllBullet() {
        this._projectileMgr.clearAllProjectile();
    }
}