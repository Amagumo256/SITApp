(function() {
    const urlList = ["http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1A0011.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1A0012.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1B0111.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1B0112.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1C0111.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1C0112.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1D0111.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1D0112.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1E0011.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1E0012.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1F0111.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1F0112.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1G0011.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1G0012.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1H0011.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1H0012.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1L0111.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable1L0112.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3N0011A.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3N0012A.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3N0011B.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3N0012B.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3P0011.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3P0012.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3Q0011.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3Q0012.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3R0011.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3R0012.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3V0011.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable3V0012.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable4Y0011E.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable4Y0012E.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable4Y0011F.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable4Y0012F.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable2Z0011A.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable2Z0012A.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable2Z0011B.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable2Z0012B.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable2Z0011C.html","http://timetable.sic.shibaura-it.ac.jp/table/2021/Timetable2Z0012C.html"],
        promiseList = [];
    
    urlList.map((v, i) => {
        console.log(v);
        promiseList.push(fetch(v, {
            method: "GET",
            mode: "no-cors"
        }));
    });

    Promise.all(promiseList)
    .then(results => Promise.all(results.map(v => v.text())))
    .then(results => {
        const data = [];
        for (let result of results) {
            const $document = document.createElement("html");
            $document.innerHTML = result;
            data.push($document);
        }
        console.log(data);
        document.innerHTML = data[0].outerHTML;
    });

})();