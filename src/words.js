const { Database, OPEN_READWRITE } = require("sqlite3");
const db = new Database('./db/words.db', OPEN_READWRITE, (err) => {});
const reload = require("auto-reload");

const consts = reload("./consts.json");

const hanbangs = ["넁","g","얗","샵","겊","o","났","찮","뛩","었","뿟","쳤","낵","\r","졌","숩","뤂","쯩","쨔","텨","쳅","뗌","쮸","t","픳","왔","s","꾜","컽","껼","쳡","4","얫","뜹","뼌","샥","츱","헷","뒿","튠","및","붚","혬","앚","냔","룀","왐","켸","봠","꿑","k","p","쬬","냘","욷","웝","훕","텰","멥","븜","5","깸","짗","깥","큭","뿐","쌓","잖","텹","싶","\n","얍","뀜","녯","밇","닺","걔","볍","넴","븓","븘","듧","쾃","젉","귐","솣","핌","곻","랬","쁜","짇","듥","꼍","믐","팁","!","귕","롼","삣","픠","않","뮨","싕","겠","됵","쩰","잫","윰","깆","볌","뀨","냑","긑","쭘","뱁","뇸","횻","듫","3","넠","쩐","탸","슉","긿","빋","붏","벹","였","걋","픈","ㄱ","똔","흩","떰","맣","츌","ㄴ","쨩","슌","숡","쑴","릐","흿","쇳","옙","즁","뤠","았","읅","녆","n","궃","읆","춧","겿","옄","w","뮬","쯘","륀","볃","콫","핥","큔","샄","놔","a"," ","e","c","엋","틋","d","r","m","u","i","쫓","윅","씃","y","l","ⓚ","읃","츳","섣","븕","읋","궉","쭤","쟌","냏","뷸","햅","샴","갉","뭀","헵","챤","웆","뒙","땽","Z","믌","믠","봏","얶","섴","칲","숳","먁","얒","섰","퇘","믁","숰","빕","뜅","힙","싴","뇡","렇","끠","쯕","탓","볜","섄","붖","춰","옜","힛","셦","뱟","싄","찱","춋","갠","뺏","ㄹ","켁","딪","쎈","븍","ㅂ","ㄷ","덟","꼇","칮","쨤","텋","봊","뎧","츨","읔","슛","읕","먕","궝","촨","랖","읗","믏","톹","앝","2","긶","쯤","뜩","퓸","픔","죌","엌","똠","갏","즑","엣","빱","읒","쎔","졎","슨","껸","릏","욤","듈","옺","갗","돓","텝","줘","럿","븐","뮴","휵","틤","뎬","읖","굠","읓","녘","싥","븀","렁","탉","늄","켓","륨","쁨","럽","듐","튬"];

{ //초기화
    db.each(`CREATE TABLE IF NOT EXISTS words(
        word VARCHAR(500)
    )`);
}

async function getWordStartsWith(startChars, excepts = []) {
    const exceptor = `${(excepts.length ? "AND" : "")} ${excepts.map(word => `word != '${word}'`).join(" AND ")}`;
    return new Promise(solve => {
        const query = `
        SELECT word FROM words_ko o WHERE (${startChars.map(char => `start = '${char}'`).join(" OR ")}) AND length != 1 AND (${consts.manner ? hanbangs.map(char => `end != '${char}'`).join(" AND ") : "true"}) ${exceptor}
        ORDER BY (${consts.villains.length ? consts.villains.map(villain => `end='${villain}'`).join(" OR ") : "0=0"}) DESC, ${consts.kill ? `(SELECT COUNT(1) FROM words_ko WHERE start=o.end), ` : ""} length${consts.short ? "" : " DESC"} LIMIT 1
        `;
        db.all(query, (err, row) => {
            solve(row[0] ? row[0].word : undefined);
        });
    });
}

function addWord(word) {
    return db.each(`INSERT INTO words_ko (length, start, end, word) SELECT ${word.length},'${word[0]}','${word[word.length-1]}','${word}' WHERE NOT EXISTS(SELECT 1 FROM words_ko WHERE word='${word}')`);
}

function removeWord(word) {
    return db.each(`DELETE FROM words_ko WHERE word='${word}'`);
}

module.exports = {
    getWordStartsWith,
    addWord,
    removeWord
}