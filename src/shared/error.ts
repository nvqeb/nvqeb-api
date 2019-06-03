export class NotFound extends Error {
    _type = "NotFound";
    constructor(public _msg: string) {
        super(_msg ? "NotFound: " + _msg : "NotFound");
    }
}

export class InvalidArgument extends Error {
    _type = "InvalidArgument";
    constructor(public _msg: string) {
        super(_msg ? "InvalidArgument: " + _msg : "InvalidArgument");
    }
}

export class MissingArgument extends Error {
    _type = "MissingArgument";
    constructor(public _msg: string) {
        super(_msg ? "MissingArgument: " + _msg : "MissingArgument");
    }
}

export class WrongLoginOrPassword extends Error {
    _type = "WrongLoginOrPassword";
    constructor(public _msg: string) {
        super(_msg ? "WrongLoginOrPassword: " + _msg : "WrongLoginOrPassword");
    }
}

export class NotLoggedIn extends Error {
    _type = "NotLoggedIn";
    constructor(public _msg: string) {
        super(_msg ? "NotLoggedIn: " + _msg : "NotLoggedIn");
    }
}

export class PasswordTooSmall extends Error {
    _type = "PasswordTooSmall";
    constructor(public _msg: string) {
        super(_msg ? "PasswordTooSmall: " + _msg : "PasswordTooSmall");
    }
}

export class EmailAlreadyInUse extends Error {
    _type = "EmailAlreadyInUse";
    constructor(public _msg: string) {
        super(_msg ? "EmailAlreadyInUse: " + _msg : "EmailAlreadyInUse");
    }
}

export class InvalidEmail extends Error {
    _type = "InvalidEmail";
    constructor(public _msg: string) {
        super(_msg ? "InvalidEmail: " + _msg : "InvalidEmail");
    }
}

export class Fatal extends Error {
    _type = "Fatal";
    constructor(public _msg: string) {
        super(_msg ? "Fatal: " + _msg : "Fatal");
    }
}

export class Connection extends Error {
    _type = "Connection";
    constructor(public _msg: string) {
        super(_msg ? "Connection: " + _msg : "Connection");
    }
}

export enum Errors {
    NotFound = "NotFound",
    InvalidArgument = "InvalidArgument",
    MissingArgument = "MissingArgument",
    WrongLoginOrPassword = "WrongLoginOrPassword",
    NotLoggedIn = "NotLoggedIn",
    PasswordTooSmall = "PasswordTooSmall",
    EmailAlreadyInUse = "EmailAlreadyInUse",
    InvalidEmail = "InvalidEmail",
    Fatal = "Fatal",
    Connection = "Connection",
}

export const err = {
    NotFound: (message: string = "") => { throw new NotFound(message); },
    InvalidArgument: (message: string = "") => { throw new InvalidArgument(message); },
    MissingArgument: (message: string = "") => { throw new MissingArgument(message); },
    WrongLoginOrPassword: (message: string = "") => { throw new WrongLoginOrPassword(message); },
    NotLoggedIn: (message: string = "") => { throw new NotLoggedIn(message); },
    PasswordTooSmall: (message: string = "") => { throw new PasswordTooSmall(message); },
    EmailAlreadyInUse: (message: string = "") => { throw new EmailAlreadyInUse(message); },
    InvalidEmail: (message: string = "") => { throw new InvalidEmail(message); },
    Fatal: (message: string = "") => { throw new Fatal(message); },
    Connection: (message: string = "") => { throw new Connection(message); },
};
