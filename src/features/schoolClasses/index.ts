// MARK: Databases
import r from "../../rethinkdb";

// MARK: Shared
import strings from "../../shared/strings";

// MARK: Types
import * as types from "./types";
import { err } from "./error";

import * as format from "./format";

// MARK: Features
import * as cdn from "../cdn";

export async function getSchoolClass(ctx: types.Context, schoolClassesId: string): Promise<types.SchoolClass> {
    return await r.table("schoolClasses").get(schoolClassesId).do(format.schoolClass);
}

export async function getSchoolClassesFor(ctx: types.Context, schoolClassesIds: string[]): Promise<types.SchoolClass[]> {
    return await r.table("schoolClasses").getAll(r.args(schoolClassesIds)).map(format.schoolClass).coerceTo("array");
}

export async function createSchoolClass(ctx: types.Context, schoolClass: types.NewSchoolClass): Promise<types.SchoolClass> {
    return await r.table("schoolClasses").insert(
        {
            ...schoolClass,
            id: schoolClass.id.split(" ").join("").trim().toUpperCase(),
            createdAt: r.now(),
            editedAt: r.now(),
        },
        {
            returnChanges: true,
        },
    )("changes")(0)("new_val").do(format.schoolClass);
}

export async function editSchoolClass(ctx: types.Context, schoolClassId: string, schoolClass: types.NewSchoolClass): Promise<types.SchoolClass> {
    return await r.table("schoolClasses").get(schoolClassId).update(
        {
            ...schoolClass,
            editedAt: r.now(),
        },
        {
            returnChanges: true,
        },
    )("changes")(0)("new_val").do(format.schoolClass);
}
