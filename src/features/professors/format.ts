// MARK: Databases
import r from "../../rethinkdb";

// MARK: Shared
import strings from "../../shared/strings";

// MARK: Types
import * as types from "./types";
import { err } from "./error";

// MARK: Features
import * as formatSchoolClasses from "../schoolClasses/format";

export function professor(professor: RDatum<DBProfessor>): RDatum<types.Professor> {
    return professor.do((professor) => ({
        id: professor("id"),
        avatar: professor("avatar"),
        name: professor("name"),
        tags: professor("tags"),
        hardness: professor("hardness"),
        schoolClasses: r.table("schoolClasses").getAll(r.args(professor("schoolClassIds"))).map(formatSchoolClasses.schoolClass).coerceTo("array"),
    }));
}
