const { Client } = require('pg');
const { Database, OPEN_READWRITE } = require("sqlite3");
const db = new Database('../db/words.db', OPEN_READWRITE, (err) => {});

const client = new Client({
    user: "postgres",
    password: "YOUR PASSWORD",
    database: "postgres"
});

(async () => {
    { //초기화
        db.each(`CREATE TABLE words_ko(
            length INT,
            start VARCHAR(2),
            end VARCHAR(2),
            word VARCHAR(500)
        )`);
    }

    await client.connect();
    {
        const res = await client.query('SELECT _id FROM kkutu_ko');
        res.rows.forEach((row, i) => {
            db.exec("BEGIN IMMEDIATE TRANSACTION");
            db.each(`INSERT INTO words_ko VALUES (${row._id.length}, '${row._id[0]}', '${row._id[row._id.length-1]}', '${row._id}')`);
            db.exec("END TRANSACTION");
            if(!(i % 10000)) console.log(((i / res.rows.length) * 100).toFixed(2) + "%");
        });
    }
    client.end();
    // db.each(`INSERT INTO words_ko
    // VALUES
    //     ${res.rows.map(row => 
    //         `(${row._id.length},'${row._id[0]}','${row._id}')`
    //     ).join(",")}
    // `);
})();