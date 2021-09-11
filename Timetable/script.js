import { LectureLessonDataList } from "/src/modules/LectureLessonData.js";

(async function() {
    const database = await fetch("database/lectureData_raw.json").then(response => response.json());
    console.log(database);

    const ll = new LectureLessonDataList(database);

    const professors = new Map(),
        departments = new Map(),
        lectures = new Map();
    
    
})();