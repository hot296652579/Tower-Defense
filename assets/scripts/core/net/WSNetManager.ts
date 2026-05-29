import { _decorator, error, log } from 'cc';
import { EventMgr } from '../EventManager';
import { NetCodec } from './NetCodec';
const { ccclass } = _decorator;

export enum NetState {
    IDLE,
    CONNECTING,
    CONNECTED,
    RECONNECTING
}

@ccclass('WSNetManager')
export class WSNetManager {
    private static _inst: WSNetManager;
    public static get inst() {
        if (!this._inst) this._inst = new WSNetManager();
        return this._inst;
    }

    public state: NetState = NetState.IDLE;
    private ws: WebSocket | null = null;
    private recvBuffer = new Uint8Array(0);

    // 心跳
    private heartTimer: any = null;
    private ackTimer: any = null;

    // 重连
    private reconnectTimer: any = null;
    private reconnectCount = 0;

    public onConnected?: () => void;
    public onClosed?: () => void;
    public onWeak?: () => void;

    private readonly CONFIG = {
        url: 'ws://127.0.0.1:8080',
        heartInterval: 25000,
        heartTimeout: 5000,
        maxReconnect: 10,
        baseDelay: 2000,
        maxDelay: 30000
    };

    private constructor() { }

    // 连接
    connect() {
        if (this.state === NetState.CONNECTED || this.state === NetState.CONNECTING) return;
        this.state = NetState.CONNECTING;

        this.ws = new WebSocket(this.CONFIG.url);
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
    }

    private onOpen() {
        log('连接成功');
        this.state = NetState.CONNECTED;
        this.reconnectCount = 0;
        this.startHeart();
        this.onConnected?.();
    }

    private onMessage(e: MessageEvent) {
        const ab = e.data as ArrayBuffer;
        if (!(ab instanceof ArrayBuffer)) return;

        // 合并新数据到缓冲区
        const newData = new Uint8Array(ab);
        const temp = new Uint8Array(this.recvBuffer.length + newData.length);
        temp.set(this.recvBuffer);
        temp.set(newData, this.recvBuffer.length);
        this.recvBuffer = temp;

        // 拆包
        const { msgs, remain } = NetCodec.unpack(this.recvBuffer);
        this.recvBuffer = remain;

        // 派发事件
        msgs.forEach(msg => {
            if (msg.cmd === 0) {
                this.resetHeartAck();
                return;
            }
            EventMgr.emit(msg.cmd, msg.data);
        });
    }

    // 发送原始二进制
    send(buffer: ArrayBuffer) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(buffer);
        }
    }

    // 心跳
    private startHeart() {
        this.clearHeart();
        this.heartTimer = setInterval(() => {
            this.send(NetCodec.encode({ cmd: 0 }));
            this.ackTimer = setTimeout(() => {
                error('心跳超时');
                this.onWeak?.();
                this.close();
            }, this.CONFIG.heartTimeout);
        }, this.CONFIG.heartInterval);
    }

    private resetHeartAck() {
        clearTimeout(this.ackTimer);
    }

    private clearHeart() {
        clearInterval(this.heartTimer);
        clearTimeout(this.ackTimer);
    }

    private onClose() {
        error('连接断开');
        this.state = NetState.IDLE;
        this.clearHeart();
        this.onClosed?.();
        this.startReconnect();
    }

    private onError() {
        error('连接错误');
    }

    // 重连
    private startReconnect() {
        if (this.reconnectCount >= this.CONFIG.maxReconnect) return;
        if (this.reconnectTimer) return;

        this.state = NetState.RECONNECTING;
        this.reconnectCount++;

        const delay = Math.min(this.CONFIG.baseDelay * Math.pow(2, this.reconnectCount), this.CONFIG.maxDelay);
        log(`重连 ${this.reconnectCount} 次 ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    close() {
        this.clearHeart();
        this.ws?.close();
        this.ws = null;
        this.state = NetState.IDLE;
    }
}