import { EntityState } from "../core/World";

export class StateComp {

    state: EntityState = EntityState.Idle;
    prevState: EntityState = EntityState.Idle;

    changeState(newState: EntityState) {

        if (this.state === newState) return;

        this.prevState = this.state;
        this.state = newState;

    }

}