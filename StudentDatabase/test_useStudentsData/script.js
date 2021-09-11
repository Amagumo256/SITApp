import StudentData from "/src/modules/StudentData.js";
import $ from "/src/modules/$.js";
(async function() {
    const studentsData = parseStudentsData(await (await fetch("/database/students.json")).json());

    const $studentList = $("<div>"),
        displayDepartments = new Set([
            "AA",
            "AB",
            "AC",
            "AD",
            "AE",
            "AF",
            "AG",
            "AH",
            "AL",
            "BP",
            "BQ",
            "BR",
            "BN",
            "BV",
            "CY",
            "DZ"
        ]);


    $("body").append($studentList);
    const displayStudentsData = new Set();
    for (let studentData of studentsData.values()) {
        if (displayDepartments.has(studentData.department)) {
            const $elem = studentData.attachDOM();
            $studentList.append($elem);
            displayStudentsData.add(studentData);
        }
    }
    console.log(displayStudentsData);
})();

function parseStudentsData(studentsData) {
    const res = new Map();
    for (let studentData of studentsData) {
        res.set(studentData.id, new StudentData(studentData));
    }
    return res;
}