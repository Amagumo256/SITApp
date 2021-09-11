import $ from "/src/modules/$.js";

export default class StudentData {
    constructor(data) {
        this.id = data.id;
        this.studentId = data.studentId;
        this.name = data.name;
        this.department = data.studentId.slice(0, 2).toUpperCase();
    }

    attachDOM() {
        const $elem = $("<view-student_data>");
        this.dom = $elem;
        $elem[0].setData(this);
        return $elem;
    }
}

class View_StudentData extends HTMLElement {
    constructor() {
        super();
        const $doms = {}

        $doms.shadow = $(this.attachShadow({ mode: "open" }))
            .append($doms.container = $("<div>")
                .css("box-shadow", "0 2px 8px #0003")
                .css("border-radius", "8px")
                .css("display", "flex")
                .css("justify-content", "stretch")
                .css("margin", "8px 0")
                .css("padding", "4px 8px")
                .append($doms.studentId = $("<p>")
                    .css("font-size", "12px")
                    .css("margin", "auto 6px")
                    .css("padding", "4px 8px")
                    .css("border-radius", "8px")
                    .css("border", "solid 1px #0001"))
                .append($("<div>")
                    .append($doms.name_english = $("<p>")
                        .css("margin", "0")
                        .css("font-size", "8px"))
                    .append($doms.name = $("<p>")
                        .css("margin", "0")
                        .css("font-size", "16px"))));
        this.$ = $doms;
    }

    setData(data) {
        this.data = data;
        this.updateStyle();
    }

    updateStyle() {
        if (this.data != null) {
            this.$.studentId.text(this.data.studentId);
            this.$.name.text(this.data.name.display.surname + " " + this.data.name.display.given);
            this.$.name_english.text(this.data.name.english.surname + " " + this.data.name.english.given);
        }
    }

    connectedCallback() {

    }
}

window.customElements.define("view-student_data", View_StudentData);