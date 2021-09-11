import IdedData, { IdedMap } from "/src/modules/IdedData.js";

const raw_FDCData = await (await fetch("/database/FDCData.json")).json();

export class FDCData extends IdedData{
    constructor(type, data = {}) {
        data.type = data.type || type;
        super(data);

        if (typeof data.name === "string") {
            data.name = {
                original: data.name,
                ja: {
                    full: data.name,
                    short: null
                },
                en: {
                    full: null
                }
            };
        }
        data.name.toString = (lang) => {
            if (lang == null) {
                return data.name.original;
            } else {
                return data.name[lang].full;
            }
        }
        this.name = data.name;  
        this.disused = data.disused || false;
        
    };
}

export class FacultyData extends FDCData {
    constructor(data = {}) {
        super("FacultyData", data);
        
        this.code = data.code;
        this._departments = data.departments;
    }

    static allList = IdedData.defineClass("FacultyData", FacultyData);
    static list = FacultyData.allList.select("used", data => !data.disused);

    setDepartments() {
        this.departments = IdedMap.from(this._departments);
        // this.departments = new Map();
        // for (let department of this._departments) {
        //     const data = DepartmentData.from(department);
        //     this.departments.set(data.id, data);
        // }
    }
}

export class DepartmentData extends FDCData {
    constructor(data = {}) {
        super("DepartmentData", data);
        
        this.code = data.code;
        this._faculty = data.faculty;
        this._courses = data.courses || [];

        if (!this._faculty) throw Error("faculty is not registered:", JSON.stringify(data));
    }
    static allList = IdedData.defineClass("DepartmentData", DepartmentData);
    static list = DepartmentData.allList.select("used", data => !data.disused);

    setFaculty() {
        this.faculty = FacultyData.from(this._faculty);
    }

    setCourses() {
        this.courses = new Map();
        for (let courseId of this._courses) {
            const data = CourseData.from(courseId);
            this.courses.set(data.id, data);
        }
    }
}

export class CourseData extends FDCData {
    constructor(data = {}) {
        super("CourseData", data);
        
        this.code = data.code;
        this._department = data.department;

        if (!this._department) throw Error("department is not registered:", JSON.stringify(data));

    }
    static allList = IdedData.defineClass("CourseData", CourseData);
    static list = CourseData.allList.select("used", data => !data.disused);

    setDepartment() {
        this.department = DepartmentData.from(this._department);
    }
}

const fdcData = {
    faculties: FacultyData.list,
    departments: DepartmentData.list,
    courses: CourseData.list,
    codes: {
        faculty: FacultyData.list.createIndex("code"),
        department: FacultyData.list.createIndex("code"),
        course: FacultyData.list.createIndex("code")
    },
    from(shortData) {
        switch(shortData.type) {
            case "FacultyData": 
                return FacultyData.list.get(shortData.id);
            case "DepartmentData":
                return DepartmentData.list.get(shortData.id);
            case "CourseData":
                return CourseData.list.get(shortData.id);
        }
        return null;
    },
    fromCode(code) {
        if (fdcData.codes.faculty.has(code)) return fdcData.codes.faculty.get(code);
        if (fdcData.codes.department.has(code)) return fdcData.codes.department.get(code);
        if (fdcData.codes.course.has(code)) return fdcData.codes.course.get(code);
    }
}

for (let d of [...raw_FDCData.faculty, ...raw_FDCData.department, ...raw_FDCData.course]) {
    IdedData.create(d);
}

for (let faculty of fdcData.faculties.values()) faculty.setDepartments();
for (let department of fdcData.departments.values()) {
    department.setFaculty();
    department.setCourses();
}
for (let course of fdcData.courses.values()) course.setDepartment();


export default fdcData;

console.log(fdcData);