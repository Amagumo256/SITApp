import fdcData from "/src/modules/FDCData.js";

(function main() {
    const $fdc = document.createElement("section");

    for (let faculty of fdcData.faculties.values()) {
        const $faculty = document.createElement("div"),
            $f_title = document.createElement("h3"),
            $departments = document.createElement("div");

        $f_title.textContent = faculty.name.code + ' ' + faculty.name.toString();
        $faculty.appendChild($f_title);
        $fdc.appendChild($faculty);

        $departments.style.paddingLeft = "20px";
        $faculty.appendChild($departments);
        for (let department of faculty.departments.values()) {
            const $department = document.createElement("div"),
                $d_title = document.createElement("h4"),
                $courses = document.createElement("div");

            $d_title.textContent = department.name.code + " " + department.name.toString();
            $department.appendChild($d_title);
            $departments.appendChild($department);
            
            $courses.style.paddingLeft = "20px";
            $department.appendChild($courses);
            for (let course of department.courses.values()) {
                const $course = document.createElement("div"),
                    $c_title = document.createElement("h5");
                
                $c_title.textContent = course.name.code + " " + course.name.toString();
                $course.appendChild($c_title);
                $courses.appendChild($course);
            }
        }
    }

    document.body.appendChild($fdc);
})();