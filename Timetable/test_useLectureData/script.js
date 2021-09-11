import { LectureLessonDataList } from "/src/modules/LectureLessonData.js";

(async function() {
    const ttData = await (await fetch("/database/lectureData.json")).json();

    const lcData = new LectureLessonDataList(ttData);
    console.log(lcData);

    const $lectures = document.createElement("section"),
        $dayOfWeekColumn = [
            document.createElement("div"),
            document.createElement("div"),
            document.createElement("div"),
            document.createElement("div"),
            document.createElement("div"),
            document.createElement("div"),
            document.createElement("div")
        ];
    
})();