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

export async function getProfessor(ctx: types.Context, professorId: string): Promise<types.Professor> {
    return await r.table("professors").get(professorId).do(format.professor);
}

export async function getProfessors(ctx: types.Context, pageOffset: number): Promise<types.Professor[]> {
    return await r.table("professors")
        .filter({ deletedAt: null })
        .orderBy(r.desc("date"))
        .skip(pageOffset * 20)
        .limit(20)
        .map(format.professor);
}

export async function getProfessorsFor(ctx: types.Context, schoolClassId: string): Promise<types.Professor[]> {
    return await r.table("professors")
        .getAll(schoolClassId, {
            index: "schoolClassIds",
        })
        .filter({ deletedAt: null })
        .orderBy(r.desc("date"))
        .map(format.professor)
        .coerceTo("array");
}

export async function createProfessor(ctx: types.Context, professor: types.NewProfessor): Promise<types.Professor> {
    return await r.table("professors").insert(
        {
            ...professor,
            schoolClassIds: await r.table("schoolClasses").getAll(r.args(professor.schoolClassIds))("id"),
            avatar: professor.avatar ? await cdn._uploadUncertainImage(professor.avatar) : null,
            createdAt: r.now(),
            editedAt: r.now(),
            deletedAt: null,
        },
        {
            returnChanges: true,
        },
    )("changes")(0)("new_val").do(format.professor);
}

export async function editProfessor(ctx: types.Context, professorId: string, professor: types.NewProfessor): Promise<types.Professor> {
    return await r.table("professors").get(professorId).update(
        {
            ...professor,
            schoolClassIds: await r.table("schoolClasses").getAll(r.args(professor.schoolClassIds))("id"),
            avatar: professor.avatar ? await cdn._uploadUncertainImage(professor.avatar) : null,
            editedAt: r.now(),
        },
        {
            returnChanges: true,
        },
    )("changes")(0)("new_val").do(format.professor);
}
