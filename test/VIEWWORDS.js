const { Database, OPEN_READWRITE } = require("sqlite3");
const db = new Database('./db/words.db', OPEN_READWRITE, (err) => {});
const { getWordStartsWith } = require("../src/words");

db.all("SELECT * FROM words", (err, rows) => {
    console.log(rows.map(d => d.word));
});