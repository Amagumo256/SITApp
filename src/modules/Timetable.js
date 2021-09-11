import fdcData from "/src/modules/FDCData.js";

export default class Timetable {
    constructor() {
        this.lessons = new Set();
    }

    add(data) {
        this.lessons.add(data);
        if (this.dom) this.dom.add(data);
    }

    attachDOM() {
        const $elem = document.createElement("view-timetable");
        $elem.setData(this);
        this.dom = $elem;
        return $elem;
    }
}

class View_Timetable extends HTMLElement {
    constructor() {

    }

    setData(data) {
        this.data = data;
        this.updateStyle();
    }

    add(lectureData) {
        
    }

    updateStyle() {

    }
}

window.customElements.define("view-timetable", View_Timetable);