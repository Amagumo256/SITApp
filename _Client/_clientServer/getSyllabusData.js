//node _Client/_clientServer/getSyllabusData.js

const express = require("express");     //ここではいらない、クライアントからリクエストを受け付ける用
const webclient = require("request");   //サーバースクリプトからhttpリクエストをする
const { JSDOM } = require("jsdom");     //サーバースクリプトでdocumentを実装
const iconv = require("iconv-lite");    //文字化け変換用

(async function() {
    const syllabusUrl = "http://syllabus.sic.shibaura-it.ac.jp/";
    const page_syllabusTop = await new Promise((resolve, reject) => webclient({
            url: syllabusUrl
        }, (err, res, body) => resolve(body))),
        document_syllabusTop = new JSDOM(page_syllabusTop).window.document;
    
    const pages_faculty = await Promise.all([...document_syllabusTop.querySelectorAll(".container .jumbotron .btn-group .dropdown-menu li a[href]")].map(v => syllabusUrl + v.getAttribute("href")).map(url => {
            return new Promise(resolve => webclient({
                url: url
            }, (err, res, body) => resolve(body)));
        })),
        documents_faculty = pages_faculty.map(page => new JSDOM(page).window.document);
    
    const fdcList = new Map(Object.entries({
        A00: {type: "Department", id: 1}
    }));

    for (let document_faculty of documents_faculty) {
        for (let option_department of document_faculty.querySelectorAll("#division option")) {
            if (fdcList.has(option_department)) {

            }
        }
    }
    
    const pages_division = {};

    console.log(documents_faculty);

    // for (let page_faculty of pages_faculty) {
        
    // }

})();

//リストにするから使わない
function isActiveOption(option, year = new Date().getFullYear()) {
    for (let className of option.classList) {
        const gtLeData = className.match(/(gt|le)([0-9]{4})/);
        if (gtLeData !== null) {
            if (gtLeData[0] === "gt") {
                if (year >= +gtLeData[1]) return true;
                else return false;
            } else if (getLeData[0] == "le") {
                if (year >= +gtLeData[1]) return false;
                else return false;
            }
        }
    }
    return true;
}