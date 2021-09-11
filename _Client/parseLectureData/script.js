import IdedMap from "/src/modules/IdedMap.js";
import fdcData from "/src/modules/FDCData.js";
import { LessonData, LectureData, LectureLessonDataList } from "/src/modules/LectureLessonData.js";
let _rawPageData;

(async function () {
    const rawTimetablePagesData = await (await fetch("/database/raw_timetable_data.json")).json();
    _rawPageData = rawTimetablePagesData;
    console.log(rawTimetablePagesData);

    const ttData = new LectureLessonDataList(),
        lecturesByName = new Map(),
        lessonsByName = new Map();

    const dayOfWeekList = ["日", "月", "火", "水", "木", "金", "土"];
    const urlCode2code = {
        "A": "AA",
        "B": "AB",
        "C": "AC",
        "D": "AD",
        "E": "AE",
        "F": "AF",
        "G": "AG",
        "H": "AH",
        "L": "AL",
        "P": "BP",
        "Q": "BQ",
        "R": "BR",
        "NA": "BN_a",
        "NB": "BN_b",
        "V": "BV",
        "YE": "CY_pp",
        "YF": "CY_ri",
        "ZA": "DZ_ap",
        "ZB": "DZ_sa",
        "ZC": "DZ_ua"
    };

    //別学科でも、同じ年度，同じ授業名，/同じtimetableLessonIdなら同じ授業だと判断
    for (let pageData of rawTimetablePagesData) {
        const $dc = document.createElement("tbody");
        $dc.innerHTML = pageData.body;

        const titles = $dc.querySelector("#CP font").textContent.trim().split(" "),
            year = titles[0].match(/([0-9]*)年度/)[1],
            faculty = titles[1], //学部
            department = titles[2],
            grade = f2h(titles[3].split("年次")[0]),
            term_str = titles[4];

        //console.log(department);

        const $lectures = $dc.querySelectorAll("#Subject");

        for (let $lecture of $lectures) {
            if ($lecture.getAttribute("colspan") == 7) break;

            const _lectureData = createLectureData($lecture, pageData, year),
                lessonData = createLessonData(_lectureData, $lecture, pageData, term_str);

            ttData.lessons.add(lessonData);
            _lectureData.lessons.set(lessonData);

            const lectureNameId = _lectureData.year + "-" + _lectureData.name.original,
                Id = lesson;
            if (!lecturesByName.has(lectureNameId)) {
                lecturesByName.set(lectureNameId, _lectureData);
            }
            const lecture = lecturesByName.get(lectureNameId);





            let hasSiblings = false;
            for (let [i, ex_lectureData] of ttData.lectures.entries()) {
                if (ex_lectureData.type !== "MetaData"
                    && ex_lectureData.name === lectureData.name
                    && ex_lectureData.year === lectureData.year) {
                    //授業名と年度が同じなら、同じ授業(グループ)と判断

                    for (let ex_lessonData of ex_lectureData.lessons.values()) {
                        if (ex_lessonData.timetableLessonId === lectureData.timetableLessonId) {
                            //timetableLessonIdが同じなら同じ授業
                            if (!new Set([...ex_lessonData.times.values()].map(JSON.stringify)).has(JSON.stringify(lessonData.times.get(1)))) {
                                ex_lessonData.times.add(lessonData.times.get(1));
                                hasSiblings = true;
                                break;
                            } //else {//キャッシュが残ってるなら書き換えるが、今回ページが読み込まれるごとに1から作成しているので既存のデータを置き換えない。}
                        } else {
                            //違うなら授業を新たに作る
                            ex_lectureData.lessons[lessonData.id] = lessonData;
                            hasSiblings = true;
                            break;
                        }
                    }
                }
            }

            if (!hasSiblings) {
                ttData.lectures.add(lectureData);
            }
        }

        for (let [i, ex1_lectureData] of ttData.lectures.entries()) {
            //学科ごとに同lessonDataがあるかどうか確認、あればfdcに追加し統合
            for (let ex1_lessonData of ex1_lectureData.lessons.values()) {
                let meFlg_lecture = false;
                for (let [j, ex2_lectureData] of ttData.lectures.entries()) {
                    if (ex1_lectureData === ex2_lectureData) {
                        meFlg_lecture = true;
                        continue;
                    }
                    if (!meFlg_lecture) continue;
                    if (ex1_lectureData.name.original === ex2_lectureData.name.original
                        && ex1_lectureData.year === ex2_lectureData.year) {
                        let meFlg_lesson = false;
                        for (let ex2_lessonData of ex2_lectureData.lessons.values()) {
                            if (ex1_lessonData === ex2_lessonData) {
                                meFlg_lesson = true;
                                continue;
                            }
                            if (!meFlg_lesson) continue;
                            if (JSON.stringify(ex1_lessonData.times) === JSON.stringify(ex2_lessonData.times)
                                && JSON.stringify(ex1_lessonData.professor) === JSON.stringify(ex2_lessonData.professor)) {
                                ex1_lessonData.fdc.add(ex2_lessonData.fdc);
                                ex2_lectureData.lessons.delete(ex2_lessonData.id);
                                if (ex2_lectureData.lessons.size === 0) {
                                    ttData.lectures.delete(ex2_lectureData.id);
                                }
                            }
                        }
                    }
                }
            }
        }

        function createLectureData($lecture, pageData, year) {
            return new LectureData({
                type: "LectureData",

                name: {
                    original: $lecture.querySelector("table > tbody > tr:nth-child(2) > td > a").textContent
                },
                year: year,

                lessons: new IdedMap(),

                //教科分類
                division: $lecture.closest("tr[valign='TOP']") === $lecture.closest("tbody").querySelector("tr[valign='TOP']")
                    ? $lecture.closest("tr[valign='TOP']").querySelector(":scope > td:nth-child(2)").textContent
                    : $lecture.closest("tr[valign='TOP']").querySelector(":scope > td:nth-child(1)").textContent,

                url: {
                    timetable: {
                        detail: $lecture.querySelector("a").getAttribute("href"),
                        department: pageData.url
                    }
                }
            });
        }

        function createLessonData(lectureData, $lecture, pageData, term_str) {
            const detail = parseDetail($lecture.querySelector("table > tbody > tr:nth-child(3) > td:nth-child(1) font"), term_str),
                dayOfWeek = $lecture.closest("tbody").querySelector("tr[valign='TOP'] td:first-child").textContent.slice(0, 1);

            const $row = $lecture.closest("tr"),
                cells = Array.from($row.children).reduce((prev, v) => ((v.getAttribute("id") && prev.push(v)), prev), []),
                period = cells.indexOf($lecture) + 1;

            const parsedUrl = pageData.url.match(/Timetable[0-9]([A-z])[0-9]*([A-z]?).html/),
                urlCode = parsedUrl[1] + "" + (parsedUrl[2] || ""),
                fdc = fdcData.codes.get(urlCode2code[urlCode]);

            return new LessonData({
                type: "LessonData",

                lecture: lectureData,

                fdc: new Set([fdc]),
                timetableLessonId: $lecture.querySelector("table > tbody > tr:nth-child(1) > td:nth-child(1)").textContent,

                professor: $lecture.querySelector("table > tbody > tr:nth-child(1) > td:nth-child(2)").childNodes[0].textContent,

                credits: detail.credits,

                times: [{
                    time: {
                        term: detail.term,
                        dayOfWeek: dayOfWeekList.indexOf(dayOfWeek),
                        period: period,
                        duration: +$lecture.getAttribute("colspan") || 1
                    },
                    location: detail.location
                }],

                lectureStyle: {
                    isLive: $lecture.querySelector("table > tbody > tr:nth-child(1) > td:nth-child(1) > font > [title='ライブ配信']") != null,
                    isOndemand: $lecture.querySelector("table > tbody > tr:nth-child(1) > td:nth-child(1) > font > [title='オンデマンド配信']") != null,
                    isFace2Face: $lecture.querySelector("table > tbody > tr:nth-child(1) > td:nth-child(1) > font > [title='ライブ配信']") != null,
                    isOther: $lecture.querySelector("table > tbody > tr:nth-child(1) > td:nth-child(1) > font > [title='その他']") != null
                },
                hasDocuments: $lecture.querySelector("table > tbody > tr:nth-child(1) > td:nth-child(1) > font > [title='講義資料配布']") != null
            });
        }

        function parseDetail($elem, term_str) {
            const rawDetails = Array.from($elem.childNodes).map(v => v.textContent),
                data = {
                    location: {
                        distinct: rawDetails[0],
                        place: null
                    },
                    credits: +rawDetails[2].split("単位")[0],
                    others: []
                };
            rawDetails.splice(0, 3);

            for (let [i, rawDetail] of rawDetails.entries()) {
                if (rawDetail === "") {
                    continue;
                } else if (rawDetails[i - 2] === "" && rawDetails[i - 1] === "" && data.location.place == null) {
                    data.location.place = rawDetail;
                    break;
                } else {
                    if (/([0-9]+)Q/.test(rawDetail)) {
                        data.term = { type: "quater", value: [+rawDetail.match(/([0-9]+)Q/)[1]] };
                        data.others.push(data.term + "Q開講");
                    } else {
                        data.others.push(rawDetail);
                    }
                }
            }
            if (data.term == null) {
                switch (term_str) {
                    case "前期":
                        data.term = { type: "quater", value: [1, 2] };
                        break;
                    case "後期":
                        data.term = { type: "quater", value: [3, 4] };
                        break;
                    default:
                        console.warn("対応する期間がありません。");
                }
            }
            return data;
        }

        function f2h(str) {
            return str.replace(/[！-～]/g, function (s) {
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
        }
    }

    console.log(ttData.lectures);
    console.log(Object.entries(ttData));
    console.log(JSON.stringify(Object.entries(ttData).reduce((prev, [dataType, data]) => {
        prev[dataType] = data.toJSON();
        return prev;
    }, {})));
})();