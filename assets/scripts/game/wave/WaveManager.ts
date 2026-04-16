import { Vec3 } from 'cc';
import { EnemyFactory } from '../enemy/EnemyFactory';

type WaveConfig = {
    enemy: string;
    count: number;
    interval: number;
};

export class WaveManager {

    private waves: WaveConfig[] = [];

    private waveIndex = 0;
    private spawnIndex = 0;

    private timer = 0;

    private path: Vec3[] = [];

    init(path: Vec3[]) {

        this.path = path;

        // DOTO 加载配置文件
        this.waves = [
            { enemy: 'enemy', count: 3, interval: 1 },
            { enemy: 'enemy', count: 5, interval: 0.5 }
        ];

        this.waveIndex = 0;
        this.spawnIndex = 0;
        this.timer = 0;
    }

    update(dt: number) {

        if (this.waveIndex >= this.waves.length) return;

        const wave = this.waves[this.waveIndex];

        this.timer += dt;

        if (this.timer >= wave.interval) {

            this.timer = 0;

            this.spawnEnemy(wave.enemy);
            this.spawnIndex++;

            // 当前波完成
            if (this.spawnIndex >= wave.count) {
                this.waveIndex++;
                this.spawnIndex = 0;
            }
        }
    }

    private spawnEnemy(enemyName: string) {
        EnemyFactory.create(enemyName, this.path);
    }

    isFinished(): boolean {
        return this.waveIndex >= this.waves.length;
    }
}