
const { Database, OPEN_READWRITE } = require("sqlite3");
const db = new Database('../db/words.db', OPEN_READWRITE, (err) => {});

db.each("CREATE INDEX wordindex ON words_ko (word)");
//db.each("CREATE INDEX startindex ON words_ko (start)");
//db.each("CREATE INDEX lengthindex ON words_ko (length DESC)");