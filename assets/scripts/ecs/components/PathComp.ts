import { PathData } from '../../game/map/PathData';

export class PathComp {

    path: PathData;

    currentId: number | string = null;

    constructor(path: PathData) {
        this.path = path;
        this.currentId = path.startId;
    }
}