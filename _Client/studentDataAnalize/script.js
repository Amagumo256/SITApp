import r2h from "/src/js/modules/roman2hiragana.js";

(async function () {
    const rawData = await (await (await fetch("/database/students_raw.json")).json());

    const parsed = parseRawJson(rawData);

    // const database = (await (await fetch("/database/students.json")).json());
    // console.log(database);
    // console.log(simpleStudentCSV(database));
})();

async function parseRawJson(rawData) {
    const database = [];
    for (let studentDataList of rawData) {
        for (let studentData of studentDataList.value) {
            const name = studentData.displayName.split("　");
            if (studentData.alias == null) {
                console.log(studentData);
            }
            database.push({
                studentId: studentData.alias,
                name: {
                    original: name.length <= 2 ? {
                        surname: name[0],
                        given: name[1]
                    } : new Error("表示その他もろもろ、ミドルネームの処理が完了してない") && {
                        surname: name[0],
                        middle: name.slice(1, name.length - 1),
                        given: name[name.length - 1]
                    },
                    ruby: {
                        surname: r2h(studentData.surname.toLowerCase()),
                        given: r2h(studentData.givenName.toLowerCase())
                    },
                    english: {
                        surname: studentData.surname.toUpperCase(),
                        given: studentData.givenName[0].toUpperCase() + studentData.givenName.toLowerCase().slice(1)
                    }
                }
            });
        }
    }
    database.sort((a, b) => (a.studentId > b.studentId) * 2 - 1);
    database.map((v, i) => (v.id = i + 1822, v));
    console.log(database);
    console.log(JSON.stringify(database));

    console.log(simpleStudentCSV(database));
    return database;
}

function simpleStudentCSV(data) {
    return data.reduce((prev, v) => {
        return prev + "\n" + `${v.id},${v.studentId},${v.name.original.surname},${v.name.original.given},${v.name.ruby.surname},${v.name.ruby.given},${v.name.english.surname},${v.name.english.given}`;
    }, "id,studentId,name_original_surname,name_original_given,name_ruby_surname,name_ruby_given,name_english_surname,name_english_given");
}