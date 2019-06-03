/**
 *  NVQEB Main Database
 */

// MARK: Base
interface Base extends BaseNonDelete {
    deletedAt: Date | null;
}

interface BaseNonDelete {
    createdAt: Date;
    editedAt: Date;
}

// MARK: Shared
interface DBImage extends DBSimpleImage {
    thumb: DBSimpleImage;
}

interface DBFile {
    url: string;
    name: string;
}

interface DBSimpleImage {
    width: number;
    height: number;
    url: string;
}

// MARK: Tables
interface DBDevice {
    id: string;
    userId: string | null;
}

// Users
interface DBUser extends Base {
    id: string;

    // Personal Info
    avatar: DBImage | null;
    name: string;

    // Auth
    email: string;
    password: string;

    // School Info
    course: string;
}

interface DBProfessor extends Base {
    id: string;
    hardness: number;
    name: string;
    avatar: DBImage | null;
    tags: string[];
    schoolClassIds: string[];
}

interface DBSchoolClass extends BaseNonDelete {
    id: string;
    name: string;
    description: string;
}

// Reset Token
interface DBResetToken extends Base {
    id: string;
    userId: string;
    expireAt: Date;
    usedAt: Date | null;
}

// Commentaries
interface DBCommentary extends Base {
    id: string;
    userId: string;
    professorId: string | null;
    schoolClassId: string | null;
    text: string;
}

interface R {
    table(name: "api_calls"): RTable<DBApiCall>;
    table(name: "devices"): RTable<DBDevice>;
    table(name: "users"): RTable<DBUser>;
    table(name: "reset_tokens"): RTable<DBResetToken>;
    table(name: "professors"): RTable<DBProfessor>;
    table(name: "schoolClasses"): RTable<DBSchoolClass>;
    table(name: "commentaries"): RTable<DBCommentary>;
}
