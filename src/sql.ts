import postgres from "postgres"

const sql = postgres({
    username: "admin",
    database: "mcvdatabase"
});

export default sql;