//$ node _Client/_clientServer/getAllPeopleNamesByBirthyear.js
const webclient = require("request");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const fs = require("fs");

const logData = {};
global.logData = logData;

(async function() {
    console.log("[:LOG:] process started");

    const getYears = [1999, 1998],
        requestUrls = {};
        promises_request = [];
    logData.requestInfo = {
        allCount: 0,
        count: 0,
        states: new Map(),
        getUnfinished() {
            return [...logData.requestInfo.states].reduce((p, [k,v]) => {if (!v.finished) p.push(k); return p}, [])
        }
    };

    for (let getYear of getYears) {
        console.log(`[::LOG::] request{ TOP: ${getYear} } started`);
        const raw_page_top = await new Promise(resolve => webclient(`http://namaejiten.com/h${getYear - 1988}`, (err, res, body) => resolve(body)));
        console.log(`[::LOG::] request{ TOP: ${getYear} } ended`);
        
        console.log(`[::LOG::] parse{ TOP: ${getYear} } started`);
        const yearNameCount = new JSDOM(raw_page_top).window.document.querySelectorAll(".rank_list")[0].querySelector("li:last-child .page2").textContent.replaceAll(",", "");
        console.log(`[::LOG::] parse{ TOP: ${getYear} } ended`);

        requestUrls[getYear] = [];
        for (let i = 1; i <= (yearNameCount - 1) / 100 + 1; i++) {
            const url = `h${getYear - 1988}/name${i < 10 ? "0" + i : i}.html`;
            logData.requestInfo.allCount++;
            logData.requestInfo.states.set(url, {finished: false});
            requestUrls[getYear].push(url);
        }
    }

    
    for (let [year, urls] of Object.entries(requestUrls)) {
        const promises_requestByYear = [];
        console.log(`[::LOG::] addRequest{ children: ${year} } started`);

        let count = 1;
        for (let url of urls) {
            promises_requestByYear.push(fetch(`http://namaejiten.com/${url}`).then(res => res.text()).then(body => {
                console.log(`[:::LOG:::] childRequest{ ${url} } finished: ${++logData.requestInfo.count}/${logData.requestInfo.allCount} (${parseInt(logData.requestInfo.count / logData.requestInfo.allCount * 10000) / 100}%)`);
                logData.requestInfo.states.get(url).finished = true;

                const $names = [...new JSDOM(body).window.document.querySelectorAll("table.ta1 td:nth-child(2)")];
                if ($names.length === 0) console.log(`[:LOG:] getName failed: ${url}, body.length: ${body.length}`);
                return $names.map($elem => $elem.textContent.replaceAll("　", " "));
            }).catch(err => {
                if (err) throw new Error(err);
            }));

            if (count % 100 === 0) await Promise.all(promises_requestByYear);//promises_…の中身は全部Promise, stateがpending→resolvesに変わる
            count++;
        }
        console.log(`[::LOG::] All request{ children: ${year} } ended`);

        const data = [...await Promise.all(promises_requestByYear)].reduce((prev, names) => (prev.push(...names), prev), []);

        const fileData = JSON.parse(fs.readFileSync("database/allPeopleNamesByBirthyear.json", "utf-8") || "{}");
        fileData[year] = data;
        fs.writeFileSync("database/allPeopleNamesByBirthyear.json", JSON.stringify(fileData));
        
        console.log(`[::LOG::] process{ ${year} } all done`);
    }

    console.log("[:LOG:] process ended");
})();

// (async function() {
//     console.log("[LOG] File repair1 start");
//     const fileData = JSON.parse(fs.readFileSync("database/allPeopleNamesByBirthyear.json", "utf-8") || "{}");
//     for (let [year, data] of Object.entries(fileData)) {
//         if (Array.isArray(data[0])) {
//             console.log("[:LOG:]data repaired.")
//             fileData[year] = data.reduce((p, v) => (p.push(...v), p), []);
//         }
//     }
//     fs.writeFileSync("database/allPeopleNamesByBirthyear.json", JSON.stringify(fileData));

//     console.log("[LOG] File repair1 finished");
// })();