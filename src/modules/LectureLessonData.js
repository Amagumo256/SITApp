import IdedData, { IdedMap, IdedSet } from "/src/modules/IdedData.js";
import $ from "/src/modules/$.js";
import { IdedDataList } from "./IdedData";

export class LectureData extends IdedData {
    constructor(d) {
        super();
        this.type = d.type;
        this.name = d.name;
        this.year = d.year;
        this.lessons = d.lessons;
        this.division = d.division;
        this.url = d.url;
    }
}

class View_LectureData extends HTMLElement {
    constructor() {
        super();
        
        const $doms = {};
        $doms.shadow = $(this.attachShadow({mode: "open"}))
            .append($("<style>"))
            .append($doms.name = $("<p>")
                .append());
    }

    setData(data) {
        this.data = data;
        this.updateStyle();
    }

    updateStyle() {

    }
}

window.customElements.define("view-lecture_data", View_LectureData);

export class LessonData extends IdedData {
    constructor(d) {
        super();
        this.type = d.type;
        this.lecture = d.lecture;
        this.fdc = new IdedSet(d.fdc);
        this.timetableLessonId = d.timetableLessonId;
        this.professor = d.professor;
        this.credits = d.credits;
        this.times = d.times;
        this.lectureStyle = d.lectureStyle;
        this.hasDocuments = d.hasDocuments;
    }
    toJSON() {
        const ret = Object.entries(this).reduce((prev, [prop, val]) => {
            if (prop === "fdc") {
                prev[prop] = [...val].reduce((p, v) => {
                    p.push(v.inShort());
                    return p;
                }, []);
            } else if (typeof val === "object" && "inShort" in val) {
                prev[prop] = val.inShort();
            } else {
                prev[prop] = val;
            }
            return prev;
        }, {});

        return ret;
    }
}

export class LectureLessonDataList {
    constructor(data = {lectures: [], lessons: []}) {
        this.lectures = IdedMap.from(data.lectures);
        this.lessons = IdedMap.from(data.lessons);

        [...this.lectures.values()].map(v => new LectureData(v));
        [...this.lessons.values()].map(v => new LessonData(v));

        for (let lectureData of this.lectures.values()) {
            lectureData.lessons = IdedMap.from(lectureData.lessons);
            for (let lessonData of lectureData.lessons.values()) {
                //自身が入っていた場所を指定してデータと入れ替える
                lectureData.lessons.set(lessonData.id, this.lessons.get(lessonData.id));
            }
        }
        for (let lessonData of this.lessons.values()) {
            lessonData.lecture = this.lectures.get(lessonData.lecture.id);

            const fdc = lessonData.fdc;
            lessonData.fdc = new Set(fdc.map(v => fdcData.ids.get(v.id)));
        }
    }
}

