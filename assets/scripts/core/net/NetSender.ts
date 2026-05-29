import { NetCodec } from './NetCodec';
import { WSNetManager } from './WSNetManager';

export class NetSender {
    private static sendQueue: ArrayBuffer[] = [];
    private static cacheQueue: ArrayBuffer[] = [];
    private static maxCache = 80;

    public static send(msg: { cmd: number, data?: any }) {
        const buffer = NetCodec.encode(msg);

        if (WSNetManager.inst.state === 2) { // CONNECTED
            WSNetManager.inst.send(buffer);
            this.flushSendQueue();
        } else {
            if (this.cacheQueue.length < this.maxCache) {
                this.cacheQueue.push(buffer);
            }
        }
    }

    public static flushSendQueue() {
        while (this.sendQueue.length > 0) {
            const buf = this.sendQueue.shift()!;
            WSNetManager.inst.send(buf);
        }
    }

    public static resendCache() {
        while (this.cacheQueue.length > 0) {
            const buf = this.cacheQueue.shift()!;
            WSNetManager.inst.send(buf);
        }
    }
}