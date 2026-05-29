import { _decorator, Component, log } from 'cc';
import { EventMgr } from '../EventManager';
import { CMD } from './MsgCmd';
import { NetSender } from './NetSender';
import { WSNetManager } from './WSNetManager';
const { ccclass } = _decorator;

@ccclass('NetTest')
export class NetTest extends Component {
    onLoad() {
        WSNetManager.inst.connect();

        EventMgr.on(CMD.LOGIN, this.loginSuccess, this);
    }

    start() {
        this.sendLogin();
    }

    // 登录成功
    loginSuccess(data: any) {
        log('登录成功：', data);
    }

    // 发送登录
    sendLogin() {
        NetSender.send({
            cmd: CMD.LOGIN,
            data: {
                name: '我是玩家9527',
                token: 'test_token_123456'
            }
        });
    }

    // 请求排行榜
    getRankList() {
        NetSender.send({
            cmd: CMD.RANK_LIST,
            data: {}
        });
    }
}