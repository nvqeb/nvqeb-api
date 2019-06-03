// MARK: Databases
import r from "../../rethinkdb";

// MARK: Shared
import strings from "../../shared/strings";

// MARK: Types
import * as types from "./types";
import { err } from "./error";

export function schoolClass(schoolClass: RDatum<DBSchoolClass>): RDatum<types.SchoolClass> {
    return schoolClass.do((schoolClass) => ({
        id: schoolClass("id"),
        description: schoolClass("description"),
        name: schoolClass("name"),
    }));
}
