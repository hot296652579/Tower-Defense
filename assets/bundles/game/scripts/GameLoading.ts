import { _decorator, Component, Label, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameLoading')
export class GameLoading extends Component {

    @property(ProgressBar)
    progress: ProgressBar = null!;

    @property(Label)
    lbProgress: Label = null!;

    private finished = 0;
    private total = 0;

    onProgressUpdate(finished: number, total: number) {
        this.finished = finished;
        this.total = total;
        this.progress.progress = this.finished / this.total;
        this.lbProgress.string = `${Math.floor(this.progress.progress * 100)}%`;
    }
}


