export * from "../../shared/format";
import * as types from "./types";
import r from "../../rethinkdb";

export function user(user: RDatum<DBUser>): RDatum<types.User> {
    return user.do((user) => ({
        id: user("id"),
        avatar: user("avatar"),
        email: user("email"),
        name: user("name"),
        course: user("course"),
    }));
}
