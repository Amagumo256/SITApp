import Event_schedule from "./Event_schedule.js";

export default class Event_schedule_view extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        const $elems = {
            
        }
        this.$ = $elems;
    }

    attachData(data) {
        if (data instanceof Event_schedule) {
            this.data = data;
            this.updateStyle();
        }
    }

    updateStyle() {

    }

    connectedCallback() {

    }

    attributeChangedCallback(name, prev, next) {

    }
}

window.customElements.define(Event_schedule_view, "event_schedule");