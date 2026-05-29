// 纯编解码工具类，无状态
export class NetCodec {
    // 编码：对象 => 二进制包（4字节头 + 体）
    public static encode(msg: any): ArrayBuffer {
        const jsonStr = JSON.stringify(msg);
        const bodyUint8 = new TextEncoder().encode(jsonStr);
        const totalLen = 4 + bodyUint8.length;
        const buffer = new ArrayBuffer(totalLen);
        const view = new DataView(buffer);

        view.setUint32(0, bodyUint8.length, false);
        new Uint8Array(buffer).set(bodyUint8, 4);
        return buffer;
    }

    // 解码：二进制 => 消息对象
    public static decode(data: ArrayBuffer): any {
        const view = new DataView(data);
        const bodyLen = view.getUint32(0, false);
        const bodyBuf = data.slice(4, 4 + bodyLen);
        const jsonStr = new TextDecoder().decode(bodyBuf);
        return JSON.parse(jsonStr);
    }

    // 拆包：缓冲区 => 完整消息列表
    public static unpack(buffer: Uint8Array): { msgs: any[], remain: Uint8Array } {
        let remainBuf = buffer;
        const msgs: any[] = [];

        while (remainBuf.length >= 4) {
            const view = new DataView(remainBuf.buffer, remainBuf.byteOffset);
            const bodyLen = view.getUint32(0, false);
            const totalLen = 4 + bodyLen;

            if (remainBuf.length < totalLen) break;

            const packBuf = remainBuf.subarray(0, totalLen);
            const msg = this.decode(packBuf.buffer);
            msgs.push(msg);

            remainBuf = remainBuf.subarray(totalLen);
        }

        return { msgs, remain: remainBuf };
    }
}