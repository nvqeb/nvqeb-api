import * as rethinkdb from "./rethink";

const DB_HOST = process.env.RETHINKDB || "rethinkdb";
const DB_PORT = process.env.RETHINKDB_PORT ? parseInt(process.env.RETHINKDB_PORT) : 28015;
const DB = process.env.RETHINKDB_DB || process.env.PROJECT_NAME || "default";

const r = rethinkdb.connect(DB, DB_HOST, DB_PORT);

export default r;

const migrate = {
    1: r.tableCreate("devices"),
    2: r.table("devices").indexCreate("userId"),
    3: r.tableCreate("api_calls"),
    4: r.table("api_calls").indexCreate("deviceId", (apiCall) => apiCall("device")("id")),
    5: r.tableCreate("users"),
    6: r.table("users").indexCreate("email"),
    7: r.tableCreate("reset_tokens"),
    8: r.tableCreate("professors"),
    9: r.tableCreate("schoolClasses"),
    10: r.table("professors").indexCreate("schoolClassIds", {
        multi: true,
    }),
    11: r.tableCreate("commentaries"),
    12: r.table("commentaries").indexCreate("professorId"),
    13: r.table("commentaries").indexCreate("schoolClassId"),
    14: r.table("users").update({
        course: "",
    }),
};

const runFirst = [
    1, 3, 5, 7, 8, 9, 10, 11,

];

export const migrationPromise = rethinkdb.migrate(migrate, runFirst);
