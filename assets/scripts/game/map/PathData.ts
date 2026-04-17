import { PathNode } from "./PathNode";

export class PathData {

    nodes: Map<string | number, PathNode> = new Map();

    startId: string | number = 0;
    endId: string | number = 0;

    getNode(id: string | number): PathNode | undefined {
        return this.nodes.get(id);
    }
}


