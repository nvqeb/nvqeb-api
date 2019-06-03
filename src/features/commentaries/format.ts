export * from "../../shared/format";
import * as types from "./types";
import r from "../../rethinkdb";

import * as formatUsers from "../users/format";
import * as formatProfessors from "../professors/format";
import * as formatSchoolClasses from "../schoolClasses/format";

export function commentary(user: RDatum<DBCommentary>): RDatum<types.Commentary> {
    return user.do((user) => ({
        id: user("id"),
        user: r.table("users").get(user("userId")).do(formatUsers.user),
        schoolClass: r.table("schoolClasses").get(user("schoolClassId")).do(formatSchoolClasses.schoolClass).default(null),
        professor: r.table("professors").get(user("professorId")).do(formatProfessors.professor).default(null),
        createdAt: user("createdAt"),
        text: user("text"),
    }));
}
