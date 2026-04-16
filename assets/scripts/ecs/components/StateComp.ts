import { EntityState } from "../core/World";

export class StateComp {
    public state: EntityState = EntityState.Idle;

    changeState(newState: EntityState) {
        this.state = newState;
    }
}