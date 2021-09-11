const raw_FDCData = await (await fetch("/database/FDCData.json")).json();

export class FDCData {
    constructor(type, data = {}) {
        this.id = data.id;
        this.type = type;
        if (typeof data.name === "string") {
            data.name = {
                ja: {
                    full: data.name
                }
            };
        }
        this.name = data.name;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type
        }
    }

    static create(fromJSON) {
        let cls;
        switch(fromJSON.type) {
            case "Faculty":
                cls = Faculty;
                break;
            case "Department":
                cls = Department;
                break;
            case "Course":
                cls = Course;
                break;
        }
        return cls.list.get(fromJSON.id)
    }
}

export class Faculty extends FDCData {
    constructor(data = {}) {
        super("Faculty", data);
        
        this.code = data.code;
        
        this._departments = {
            updated: true,
            ids: [],
            data: null
        }

        this.setDepartmentIds(data.departments);
    }
    static list = new Map();

    get departments() {
        if (this._departments.updated) {
            const res = new Map();
            for (let id of this._departments.ids) {
                res.set(id, Department.list.get(id));
            }
            this._departments.data = res;
            this._departments.updated = false;
            return res;
        } else {
            return this._departments.data;
        }
    }

    set departments(data) {
        this._departments.data = data;
        this._departments.ids = [...data.keys()];
        this._departments.updated = false;
    }

    setDepartmentIds(ids = []) {
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        this._departments.ids = ids;
        this._departments.updated = true;
    }

    addDepartmentId(...ids) {
        this._departments.ids.push(...ids);
        this._departments.updated = true;
    }
}

export class Department extends FDCData {
    constructor(data = {}) {
        super("Department", data);
        
        this.code = data.code;

        this._faculty = {
            updated: true,
            id: null,
            data: null
        }

        this.setFacultyId(data.faculty);
    }
    static list = new Map();

    get faculty() {
        if (this._faculty.updated) {
            const res = Faculty.list.get(this._faculty.id)
            this._faculty.data = res;
            this._faculty.updated = false;
            return res;
        } else {
            return this._faculty.data;
        }
    }

    set faculty(data) {
        this._faculty.data = data;
        this._faculty.id = data.id;
        this._faculty.updated = false;
    }

    setFacultyId(id) {
        this._faculty.id = id;
        this._faculty.updated = true;
    }
}

export class Course extends FDCData {
    constructor(data = {}) {
        super("Course", data);
        
        this.code = data.code;
        
        this._department = {
            updated: true,
            id: null,
            data: null
        }

        this.setDepartmentId(data.department);
    }
    static list = new Map();

    get department() {
        if (this._department.updated) {
            const res = Department.list.get(this._department.id);
            this._department.data = res;
            this._department.updated = false;
            return res;
        } else {
            return this._department.data;
        }
    }

    set department(data) {
        this._department.data = data;
        this._department.id = data.id;
        this._department.updated = false;
    }

    setDepartmentId(id) {
        this._department.id = id;
        this._department.updated = true;
    }
}

const fdcData = {
    faculties: Faculty.list,
    departments: Department.list,
    courses: Course.list
}

for (let facultyData of raw_FDCData.faculties) {
    if (facultyData.type === "MetaData") continue;
    Faculty.list.set(facultyData.id, new Faculty(facultyData));
}

for (let departmentData of raw_FDCData.departments) {
    if (departmentData.type === "MetaData") continue;
    Department.list.set(departmentData.id, new Department(departmentData));
}

for (let courseData of raw_FDCData.courses) {
    if (courseData.type === "MetaData") continue;
    Course.list.set(courseData.id, new Course(courseData));
}

export default fdcData;