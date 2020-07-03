
const { Database, OPEN_READWRITE } = require("sqlite3");
const db = new Database('../db/words.db', OPEN_READWRITE, (err) => {});


db.each(`delete   from words_ko
where    rowid not in
         (
         select  min(rowid)
         from    words_ko
         group by
                 word
         )`)