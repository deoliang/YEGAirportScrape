
const puppeteer = require('puppeteer');
const url = 'http://flyeia.com/flights/departures';
const $ = require('cheerio');
const fs = require('fs');
const destinationSelector = 'td:nth-child(3)'
const nextPageSelector = '.pager-next'
const YEGDestinations = {
    "Cities": []
}

const uniqueSet = new Set();
puppeteer.launch().then(async browser => {
    const page = await browser.newPage();
    await page.goto(url);
    let html = ''
    while(true) {
        html = await page.content()
        await addToSet(destinationSelector,uniqueSet,html)
        await page.click(nextPageSelector)
        try{
            await page.waitForSelector(nextPageSelector,{ timeout: 500 })
        }
        //catch waitForSelector error which happens at last page and break out of loop
        catch {
            break;
        }
    }
    //grab the html of the last page
    html = await page.content()
    await addToSet(destinationSelector,uniqueSet,html)
    YEGDestinations.Cities = await [...uniqueSet].sort();
            
    await fs.writeFile('YEGDestinations.json', JSON.stringify(YEGDestinations), function(err){
        if (err) throw err;
        console.log("Successfully Written to File.");
    });
    await browser.close();
});

const addToSet = async (selector,set,html)=>{
    await $(selector,html).each(function(i, elem) {
        if(set.has($(this).text()))return true;
         set.add($(this).text());
    })
}