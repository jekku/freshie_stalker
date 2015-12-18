'use strict';

const request = require('request');
const cheerio = require('cheerio')
const mysql   = require('anytv-node-mysql');
const config  = require('./config');
const root    = 'http://upcat.up.edu.ph/';

let data = [];
mysql.add('upcat_crawler', config.UPCAT_CRAWLER_DB);

function get_pages () {
    let page_links = [];
    let $;

    request(`${root}/results`, (err, res, body) => {
        if (err) {
            return console.warn("UPCAT results server is down.");
        }

        console.log("Crawling.....");

        $ = cheerio.load(body);

        $("a").each( (index, item) => {
            if (~item.attribs.href.indexOf("page-")) {
                page_links.push(item.attribs.href);
            }
        });

        page_links.forEach( (link) => {
            crawl_page(link);
        });

    });

}

function crawl_page (page) {
    let $;
    let results_table;
    let batch = [];

    request(`${root}results/${page}`, (err, res, body) => {
        if (err) {
            return console.warn(`${root}results/${page} is down!`);
        }

        $ = cheerio.load(body);
        results_table = $("table")[1];
        $ = cheerio.load(results_table);

        $("tr").each( (index, item) => {
            let details, name, campus, course, is_pending;

            if (index === 0) {
                return;
            }

            details = cheerio.load(item)("td");
            name = details[0].children[0].data;
            campus = details[1].children[0].data;
            course = details[2].children[0].data;

            campus = campus.length - 1 ? campus : null;
            course = course ? course : null;
            is_pending = course && campus ? false : true;

            batch.push([
                name,
                campus,
                course,
                is_pending
            ]);

        });

        mysql.use('upcat_crawler')
            .query(
                'INSERT INTO passers values ?',
                [batch],
                confirm_batch_insertion
            )
            .end();
    });

}


function confirm_batch_insertion (err, result) {
    if (err) {
        return console.warn(err);
    }

    console.log("Batch crawled~!");
}

get_pages();

