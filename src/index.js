
const { performance } = require('perf_hooks');
const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { kkutuURL } = require("./consts");
const { getWordStartsWith, addWord, removeWord } = require("./words");
const { duum } = require("./hangul");

async function sleep(ms) {
    await new Promise(solve => setTimeout(solve, ms));
}

async function isGaming(driver) {
    return await driver.executeScript(`return document.getElementById("GameBox")?.style.display`) === "block";
}
async function getChatButton(driver) {
    return await driver.executeScript(`return document.getElementById("ChatBtn")`);
}
async function getChatInputID(driver) {
    return await driver.executeScript(`return document.getElementById("ChatBtn")?.previousSibling.id`);
}
async function getStartCharIndex(driver) {
    return await driver.executeScript(`return Array.from(document.getElementsByClassName("rounds")[0].childNodes).indexOf(document.getElementsByClassName("rounds-current")[0])`);
}
async function isMyTurn(driver) {
    return await driver.executeScript(`return document.getElementsByClassName("game-input")[0].style.display`) === "block";
}
async function isWrong(driver) {
    return await driver.executeScript(`return !!document.querySelector(".game-fail-text")`);
}
async function sendWord(driver, chatInputId, chatButton, text) {
    await driver.executeScript(`document.getElementById("${chatInputId}").value = \`${text}\``);
    await chatButton.click();
}
async function getNowChars(driver) {
    const fuckin = await driver.executeScript(`return document.getElementsByClassName("jjo-display")[0].innerHTML`);
    console.log(fuckin);
    return Array.from(/([^\(\)]+)(?:\((.+)\))?/.exec(fuckin)).slice(1).filter(v=>v);
}
async function getDisplayWord(driver) {
    return await driver.executeScript(`
        return (
            document.querySelectorAll(".jjo-display label").length === 2
            ?
                Array.from(document.querySelectorAll(".jjo-display label")).map(e=>e.innerText).reduce((a,b)=>a+b, "")
            :
                document.querySelector(".history-item")?.childNodes[0].textContent) ?? ""
    `);
}

(async () => {
    const driver = await new Builder().forBrowser("chrome").build();
    await driver.get(kkutuURL);

    //const t = await driver.findElement(3);

    while(true) {
        const chatInputId = await getChatInputID(driver);
        const chatButton = await getChatButton(driver);

        let startWordIndex;
        let maybeWord;
        const usedWords = [];

        while(await isGaming(driver)) {
            if(!startWordIndex) startWordIndex = await getStartCharIndex(driver);

            if(await isMyTurn(driver)) {
                const beforeT = performance.now();
                const nowChars = await getNowChars(driver);

                const foundWord = (maybeWord && nowChars.includes(maybeWord[0])) ? maybeWord : await getWordStartsWith(nowChars, usedWords);
                if(foundWord) {
                    await sendWord(driver, chatInputId, chatButton, foundWord);
                    usedWords.push(foundWord);
                }
                console.log(performance.now() - beforeT);

                while(await isMyTurn(driver)) {
                    let foundWord_ = foundWord;
                    while(await isWrong(driver)) {
                        removeWord(foundWord_);
                        foundWord_ = await getWordStartsWith(nowChars, usedWords);
                        if(foundWord_) {
                            await sendWord(driver, chatInputId, chatButton, foundWord_);
                            usedWords.push(foundWord_);
                        }
                    }
                } //내 턴이 지나갈 때까지 기다림, 빨간줄이 아니면.
            }

            const newWord = await getDisplayWord(driver);
            if(newWord && !usedWords.includes(newWord)) {
                usedWords.push(newWord);
                addWord(newWord);
                //console.log("추정중", newWord[newWord.length - 1], duum(newWord[newWord.length - 1]), usedWords);
                maybeWord = await getWordStartsWith(duum(newWord[newWord.length - 1]), usedWords);
                //console.log("추정완료");
            }

            const newStartWordIndex = await getStartCharIndex(driver);
            if(startWordIndex !== newStartWordIndex) {
                startWordIndex = newStartWordIndex;
                usedWords.splice(0);
            }

            //console.log("TICK");
            //driver.executeScript(`document.getElementById("${chatInputID}").value = "${123}"`);
        }
        await sleep(1000);
    }
})();