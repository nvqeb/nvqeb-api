import * as https from "https";
import * as http from "http";
import { randomBytes } from "crypto";
import { URL } from "url";
export interface LatLng {
    lat: number;
    lng: number;
}

export interface Image {
    thumb: SimpleImage;
    width: number;
    height: number;
    url: string;
}

export interface SimpleImage {
    width: number;
    height: number;
    url: string;
}

export interface File {
    name: string;
    url: string;
}

export interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface UncertainImage {
    bytes: Buffer | null;
    image: Image | null;
    crop: Crop | null;
}

export interface UncertainFile {
    fileData: UploadFile | null;
    file: File | null;
}

export interface UploadFile {
    bytes: Buffer;
    name: string;
}

export interface User {
    id: string;
    avatar: Image | null;
    name: string;
    email: string;
    course: string;
}

export interface NewUser {
    password: string;
    avatar: UncertainImage | null;
    name: string;
    email: string;
    course: string;
}

export interface EditUser {
    avatar: UncertainImage | null;
    name: string;
    email: string;
    course: string;
}

export interface UserDetails {
    name: string;
    email: string;
    course: string;
}

export interface SchoolClass {
    id: string;
    description: string;
    name: string;
}

export interface SchoolClassDetails {
    id: string;
    description: string;
    name: string;
}

export interface NewSchoolClass {
    id: string;
    description: string;
    name: string;
}

export interface Professor {
    id: string;
    schoolClasses: SchoolClass[];
    avatar: Image | null;
    name: string;
    tags: string[];
    hardness: number;
}

export interface ProfessorDetails {
    avatar: Image | null;
    name: string;
    tags: string[];
    hardness: number;
}

export interface NewProfessor {
    avatar: UncertainImage | null;
    schoolClassIds: string[];
    name: string;
    tags: string[];
    hardness: number;
}

export interface Commentary {
    id: string;
    user: User;
    schoolClass: SchoolClass | null;
    professor: Professor | null;
    createdAt: Date;
    text: string;
}

export interface CommentaryDetails {
    text: string;
}

export interface NewCommentary {
    professorId: string | null;
    schoolClassId: string | null;
    text: string;
}

export enum ImageFormat {
    png = "png",
    jpeg = "jpeg",
}

export enum ErrorType {
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

export class ApiClient {
  deviceId: string | null = null;
  fingerprint = randomBytes(8).toString("hex");

  constructor(private url: string) {}

  async uploadImage(image: Buffer, format: ImageFormat | null, crop: Crop | null): Promise<Image> {
    const args = {
      image: image.toString("base64"),
      format: format === null || format === undefined ? null : format,
      crop: crop === null || crop === undefined ? null : {
    x: crop.x || 0,
    y: crop.y || 0,
    width: crop.width || 0,
    height: crop.height || 0,
},
    };
    const ret = await this.makeRequest({name: "uploadImage", args});
    return {
    thumb: {
        width: ret.thumb.width || 0,
        height: ret.thumb.height || 0,
        url: ret.thumb.url,
    },
    width: ret.width || 0,
    height: ret.height || 0,
    url: ret.url,
};
  }

  async cropImage(src: string, crop: Crop): Promise<Image> {
    const args = {
      src: src,
      crop: {
    x: crop.x || 0,
    y: crop.y || 0,
    width: crop.width || 0,
    height: crop.height || 0,
},
    };
    const ret = await this.makeRequest({name: "cropImage", args});
    return {
    thumb: {
        width: ret.thumb.width || 0,
        height: ret.thumb.height || 0,
        url: ret.thumb.url,
    },
    width: ret.width || 0,
    height: ret.height || 0,
    url: ret.url,
};
  }

  async uploadFile(file: UploadFile): Promise<File> {
    const args = {
      file: {
    bytes: file.bytes.toString("base64"),
    name: file.name,
},
    };
    const ret = await this.makeRequest({name: "uploadFile", args});
    return {
    name: ret.name,
    url: ret.url,
};
  }

  async emailAvailable(email: string): Promise<void> {
    const args = {
      email: email,
    };
    await this.makeRequest({name: "emailAvailable", args});
  }

  async getCurrentUser(): Promise<User> {
    const ret = await this.makeRequest({name: "getCurrentUser", args: {}});
    return {
    id: ret.id,
    avatar: ret.avatar === null || ret.avatar === undefined ? null : {
        thumb: {
            width: ret.avatar.thumb.width || 0,
            height: ret.avatar.thumb.height || 0,
            url: ret.avatar.thumb.url,
        },
        width: ret.avatar.width || 0,
        height: ret.avatar.height || 0,
        url: ret.avatar.url,
    },
    name: ret.name,
    email: ret.email,
    course: ret.course,
};
  }

  async login(email: string, password: string): Promise<User> {
    const args = {
      email: email,
      password: password,
    };
    const ret = await this.makeRequest({name: "login", args});
    return {
    id: ret.id,
    avatar: ret.avatar === null || ret.avatar === undefined ? null : {
        thumb: {
            width: ret.avatar.thumb.width || 0,
            height: ret.avatar.thumb.height || 0,
            url: ret.avatar.thumb.url,
        },
        width: ret.avatar.width || 0,
        height: ret.avatar.height || 0,
        url: ret.avatar.url,
    },
    name: ret.name,
    email: ret.email,
    course: ret.course,
};
  }

  async logout(): Promise<void> {
    await this.makeRequest({name: "logout", args: {}});
  }

  async createUser(user: NewUser): Promise<User> {
    const args = {
      user: {
    password: user.password,
    avatar: user.avatar === null || user.avatar === undefined ? null : {
        bytes: user.avatar.bytes === null || user.avatar.bytes === undefined ? null : user.avatar.bytes.toString("base64"),
        image: user.avatar.image === null || user.avatar.image === undefined ? null : {
            thumb: {
                width: user.avatar.image.thumb.width || 0,
                height: user.avatar.image.thumb.height || 0,
                url: user.avatar.image.thumb.url,
            },
            width: user.avatar.image.width || 0,
            height: user.avatar.image.height || 0,
            url: user.avatar.image.url,
        },
        crop: user.avatar.crop === null || user.avatar.crop === undefined ? null : {
            x: user.avatar.crop.x || 0,
            y: user.avatar.crop.y || 0,
            width: user.avatar.crop.width || 0,
            height: user.avatar.crop.height || 0,
        },
    },
    name: user.name,
    email: user.email,
    course: user.course,
},
    };
    const ret = await this.makeRequest({name: "createUser", args});
    return {
    id: ret.id,
    avatar: ret.avatar === null || ret.avatar === undefined ? null : {
        thumb: {
            width: ret.avatar.thumb.width || 0,
            height: ret.avatar.thumb.height || 0,
            url: ret.avatar.thumb.url,
        },
        width: ret.avatar.width || 0,
        height: ret.avatar.height || 0,
        url: ret.avatar.url,
    },
    name: ret.name,
    email: ret.email,
    course: ret.course,
};
  }

  async editUser(user: EditUser): Promise<User> {
    const args = {
      user: {
    avatar: user.avatar === null || user.avatar === undefined ? null : {
        bytes: user.avatar.bytes === null || user.avatar.bytes === undefined ? null : user.avatar.bytes.toString("base64"),
        image: user.avatar.image === null || user.avatar.image === undefined ? null : {
            thumb: {
                width: user.avatar.image.thumb.width || 0,
                height: user.avatar.image.thumb.height || 0,
                url: user.avatar.image.thumb.url,
            },
            width: user.avatar.image.width || 0,
            height: user.avatar.image.height || 0,
            url: user.avatar.image.url,
        },
        crop: user.avatar.crop === null || user.avatar.crop === undefined ? null : {
            x: user.avatar.crop.x || 0,
            y: user.avatar.crop.y || 0,
            width: user.avatar.crop.width || 0,
            height: user.avatar.crop.height || 0,
        },
    },
    name: user.name,
    email: user.email,
    course: user.course,
},
    };
    const ret = await this.makeRequest({name: "editUser", args});
    return {
    id: ret.id,
    avatar: ret.avatar === null || ret.avatar === undefined ? null : {
        thumb: {
            width: ret.avatar.thumb.width || 0,
            height: ret.avatar.thumb.height || 0,
            url: ret.avatar.thumb.url,
        },
        width: ret.avatar.width || 0,
        height: ret.avatar.height || 0,
        url: ret.avatar.url,
    },
    name: ret.name,
    email: ret.email,
    course: ret.course,
};
  }

  async setAvatar(avatar: UncertainImage): Promise<User> {
    const args = {
      avatar: {
    bytes: avatar.bytes === null || avatar.bytes === undefined ? null : avatar.bytes.toString("base64"),
    image: avatar.image === null || avatar.image === undefined ? null : {
        thumb: {
            width: avatar.image.thumb.width || 0,
            height: avatar.image.thumb.height || 0,
            url: avatar.image.thumb.url,
        },
        width: avatar.image.width || 0,
        height: avatar.image.height || 0,
        url: avatar.image.url,
    },
    crop: avatar.crop === null || avatar.crop === undefined ? null : {
        x: avatar.crop.x || 0,
        y: avatar.crop.y || 0,
        width: avatar.crop.width || 0,
        height: avatar.crop.height || 0,
    },
},
    };
    const ret = await this.makeRequest({name: "setAvatar", args});
    return {
    id: ret.id,
    avatar: ret.avatar === null || ret.avatar === undefined ? null : {
        thumb: {
            width: ret.avatar.thumb.width || 0,
            height: ret.avatar.thumb.height || 0,
            url: ret.avatar.thumb.url,
        },
        width: ret.avatar.width || 0,
        height: ret.avatar.height || 0,
        url: ret.avatar.url,
    },
    name: ret.name,
    email: ret.email,
    course: ret.course,
};
  }

  async getSchoolClass(schoolClassId: string): Promise<SchoolClass> {
    const args = {
      schoolClassId: schoolClassId,
    };
    const ret = await this.makeRequest({name: "getSchoolClass", args});
    return {
    id: ret.id,
    description: ret.description,
    name: ret.name,
};
  }

  async getSchoolClassesFor(schoolClassIds: string[]): Promise<SchoolClass[]> {
    const args = {
      schoolClassIds: schoolClassIds.map(e => e),
    };
    const ret = await this.makeRequest({name: "getSchoolClassesFor", args});
    return ret.map((e: any) => ({
    id: e.id,
    description: e.description,
    name: e.name,
}));
  }

  async createSchoolClass(schoolClass: NewSchoolClass): Promise<SchoolClass> {
    const args = {
      schoolClass: {
    id: schoolClass.id,
    description: schoolClass.description,
    name: schoolClass.name,
},
    };
    const ret = await this.makeRequest({name: "createSchoolClass", args});
    return {
    id: ret.id,
    description: ret.description,
    name: ret.name,
};
  }

  async editSchoolClass(schoolClassId: string, schoolClass: NewSchoolClass): Promise<SchoolClass> {
    const args = {
      schoolClassId: schoolClassId,
      schoolClass: {
    id: schoolClass.id,
    description: schoolClass.description,
    name: schoolClass.name,
},
    };
    const ret = await this.makeRequest({name: "editSchoolClass", args});
    return {
    id: ret.id,
    description: ret.description,
    name: ret.name,
};
  }

  async getProfessor(professorId: string): Promise<Professor> {
    const args = {
      professorId: professorId,
    };
    const ret = await this.makeRequest({name: "getProfessor", args});
    return {
    id: ret.id,
    schoolClasses: ret.schoolClasses.map((e: any) => ({
        id: e.id,
        description: e.description,
        name: e.name,
    })),
    avatar: ret.avatar === null || ret.avatar === undefined ? null : {
        thumb: {
            width: ret.avatar.thumb.width || 0,
            height: ret.avatar.thumb.height || 0,
            url: ret.avatar.thumb.url,
        },
        width: ret.avatar.width || 0,
        height: ret.avatar.height || 0,
        url: ret.avatar.url,
    },
    name: ret.name,
    tags: ret.tags.map((e: any) => e),
    hardness: ret.hardness || 0,
};
  }

  async getProfessors(pageOffset: number): Promise<Professor[]> {
    const args = {
      pageOffset: pageOffset || 0,
    };
    const ret = await this.makeRequest({name: "getProfessors", args});
    return ret.map((e: any) => ({
    id: e.id,
    schoolClasses: e.schoolClasses.map((e: any) => ({
        id: e.id,
        description: e.description,
        name: e.name,
    })),
    avatar: e.avatar === null || e.avatar === undefined ? null : {
        thumb: {
            width: e.avatar.thumb.width || 0,
            height: e.avatar.thumb.height || 0,
            url: e.avatar.thumb.url,
        },
        width: e.avatar.width || 0,
        height: e.avatar.height || 0,
        url: e.avatar.url,
    },
    name: e.name,
    tags: e.tags.map((e: any) => e),
    hardness: e.hardness || 0,
}));
  }

  async createProfessor(professor: NewProfessor): Promise<Professor> {
    const args = {
      professor: {
    avatar: professor.avatar === null || professor.avatar === undefined ? null : {
        bytes: professor.avatar.bytes === null || professor.avatar.bytes === undefined ? null : professor.avatar.bytes.toString("base64"),
        image: professor.avatar.image === null || professor.avatar.image === undefined ? null : {
            thumb: {
                width: professor.avatar.image.thumb.width || 0,
                height: professor.avatar.image.thumb.height || 0,
                url: professor.avatar.image.thumb.url,
            },
            width: professor.avatar.image.width || 0,
            height: professor.avatar.image.height || 0,
            url: professor.avatar.image.url,
        },
        crop: professor.avatar.crop === null || professor.avatar.crop === undefined ? null : {
            x: professor.avatar.crop.x || 0,
            y: professor.avatar.crop.y || 0,
            width: professor.avatar.crop.width || 0,
            height: professor.avatar.crop.height || 0,
        },
    },
    schoolClassIds: professor.schoolClassIds.map(e => e),
    name: professor.name,
    tags: professor.tags.map(e => e),
    hardness: professor.hardness || 0,
},
    };
    const ret = await this.makeRequest({name: "createProfessor", args});
    return {
    id: ret.id,
    schoolClasses: ret.schoolClasses.map((e: any) => ({
        id: e.id,
        description: e.description,
        name: e.name,
    })),
    avatar: ret.avatar === null || ret.avatar === undefined ? null : {
        thumb: {
            width: ret.avatar.thumb.width || 0,
            height: ret.avatar.thumb.height || 0,
            url: ret.avatar.thumb.url,
        },
        width: ret.avatar.width || 0,
        height: ret.avatar.height || 0,
        url: ret.avatar.url,
    },
    name: ret.name,
    tags: ret.tags.map((e: any) => e),
    hardness: ret.hardness || 0,
};
  }

  async editProfessor(professorId: string, professor: NewProfessor): Promise<Professor> {
    const args = {
      professorId: professorId,
      professor: {
    avatar: professor.avatar === null || professor.avatar === undefined ? null : {
        bytes: professor.avatar.bytes === null || professor.avatar.bytes === undefined ? null : professor.avatar.bytes.toString("base64"),
        image: professor.avatar.image === null || professor.avatar.image === undefined ? null : {
            thumb: {
                width: professor.avatar.image.thumb.width || 0,
                height: professor.avatar.image.thumb.height || 0,
                url: professor.avatar.image.thumb.url,
            },
            width: professor.avatar.image.width || 0,
            height: professor.avatar.image.height || 0,
            url: professor.avatar.image.url,
        },
        crop: professor.avatar.crop === null || professor.avatar.crop === undefined ? null : {
            x: professor.avatar.crop.x || 0,
            y: professor.avatar.crop.y || 0,
            width: professor.avatar.crop.width || 0,
            height: professor.avatar.crop.height || 0,
        },
    },
    schoolClassIds: professor.schoolClassIds.map(e => e),
    name: professor.name,
    tags: professor.tags.map(e => e),
    hardness: professor.hardness || 0,
},
    };
    const ret = await this.makeRequest({name: "editProfessor", args});
    return {
    id: ret.id,
    schoolClasses: ret.schoolClasses.map((e: any) => ({
        id: e.id,
        description: e.description,
        name: e.name,
    })),
    avatar: ret.avatar === null || ret.avatar === undefined ? null : {
        thumb: {
            width: ret.avatar.thumb.width || 0,
            height: ret.avatar.thumb.height || 0,
            url: ret.avatar.thumb.url,
        },
        width: ret.avatar.width || 0,
        height: ret.avatar.height || 0,
        url: ret.avatar.url,
    },
    name: ret.name,
    tags: ret.tags.map((e: any) => e),
    hardness: ret.hardness || 0,
};
  }

  async getProfessorsFor(schoolClassId: string): Promise<Professor[]> {
    const args = {
      schoolClassId: schoolClassId,
    };
    const ret = await this.makeRequest({name: "getProfessorsFor", args});
    return ret.map((e: any) => ({
    id: e.id,
    schoolClasses: e.schoolClasses.map((e: any) => ({
        id: e.id,
        description: e.description,
        name: e.name,
    })),
    avatar: e.avatar === null || e.avatar === undefined ? null : {
        thumb: {
            width: e.avatar.thumb.width || 0,
            height: e.avatar.thumb.height || 0,
            url: e.avatar.thumb.url,
        },
        width: e.avatar.width || 0,
        height: e.avatar.height || 0,
        url: e.avatar.url,
    },
    name: e.name,
    tags: e.tags.map((e: any) => e),
    hardness: e.hardness || 0,
}));
  }

  async createCommentary(commentary: NewCommentary): Promise<Commentary> {
    const args = {
      commentary: {
    professorId: commentary.professorId === null || commentary.professorId === undefined ? null : commentary.professorId,
    schoolClassId: commentary.schoolClassId === null || commentary.schoolClassId === undefined ? null : commentary.schoolClassId,
    text: commentary.text,
},
    };
    const ret = await this.makeRequest({name: "createCommentary", args});
    return {
    id: ret.id,
    user: {
        id: ret.user.id,
        avatar: ret.user.avatar === null || ret.user.avatar === undefined ? null : {
            thumb: {
                width: ret.user.avatar.thumb.width || 0,
                height: ret.user.avatar.thumb.height || 0,
                url: ret.user.avatar.thumb.url,
            },
            width: ret.user.avatar.width || 0,
            height: ret.user.avatar.height || 0,
            url: ret.user.avatar.url,
        },
        name: ret.user.name,
        email: ret.user.email,
        course: ret.user.course,
    },
    schoolClass: ret.schoolClass === null || ret.schoolClass === undefined ? null : {
        id: ret.schoolClass.id,
        description: ret.schoolClass.description,
        name: ret.schoolClass.name,
    },
    professor: ret.professor === null || ret.professor === undefined ? null : {
        id: ret.professor.id,
        schoolClasses: ret.professor.schoolClasses.map((e: any) => ({
            id: e.id,
            description: e.description,
            name: e.name,
        })),
        avatar: ret.professor.avatar === null || ret.professor.avatar === undefined ? null : {
            thumb: {
                width: ret.professor.avatar.thumb.width || 0,
                height: ret.professor.avatar.thumb.height || 0,
                url: ret.professor.avatar.thumb.url,
            },
            width: ret.professor.avatar.width || 0,
            height: ret.professor.avatar.height || 0,
            url: ret.professor.avatar.url,
        },
        name: ret.professor.name,
        tags: ret.professor.tags.map((e: any) => e),
        hardness: ret.professor.hardness || 0,
    },
    createdAt: new Date(ret.createdAt + "Z"),
    text: ret.text,
};
  }

  async getCommentariesForProfessor(professorId: string): Promise<Commentary[]> {
    const args = {
      professorId: professorId,
    };
    const ret = await this.makeRequest({name: "getCommentariesForProfessor", args});
    return ret.map((e: any) => ({
    id: e.id,
    user: {
        id: e.user.id,
        avatar: e.user.avatar === null || e.user.avatar === undefined ? null : {
            thumb: {
                width: e.user.avatar.thumb.width || 0,
                height: e.user.avatar.thumb.height || 0,
                url: e.user.avatar.thumb.url,
            },
            width: e.user.avatar.width || 0,
            height: e.user.avatar.height || 0,
            url: e.user.avatar.url,
        },
        name: e.user.name,
        email: e.user.email,
        course: e.user.course,
    },
    schoolClass: e.schoolClass === null || e.schoolClass === undefined ? null : {
        id: e.schoolClass.id,
        description: e.schoolClass.description,
        name: e.schoolClass.name,
    },
    professor: e.professor === null || e.professor === undefined ? null : {
        id: e.professor.id,
        schoolClasses: e.professor.schoolClasses.map((e: any) => ({
            id: e.id,
            description: e.description,
            name: e.name,
        })),
        avatar: e.professor.avatar === null || e.professor.avatar === undefined ? null : {
            thumb: {
                width: e.professor.avatar.thumb.width || 0,
                height: e.professor.avatar.thumb.height || 0,
                url: e.professor.avatar.thumb.url,
            },
            width: e.professor.avatar.width || 0,
            height: e.professor.avatar.height || 0,
            url: e.professor.avatar.url,
        },
        name: e.professor.name,
        tags: e.professor.tags.map((e: any) => e),
        hardness: e.professor.hardness || 0,
    },
    createdAt: new Date(e.createdAt + "Z"),
    text: e.text,
}));
  }

  async getCommentariesForSchoolClass(schoolClassId: string): Promise<Commentary[]> {
    const args = {
      schoolClassId: schoolClassId,
    };
    const ret = await this.makeRequest({name: "getCommentariesForSchoolClass", args});
    return ret.map((e: any) => ({
    id: e.id,
    user: {
        id: e.user.id,
        avatar: e.user.avatar === null || e.user.avatar === undefined ? null : {
            thumb: {
                width: e.user.avatar.thumb.width || 0,
                height: e.user.avatar.thumb.height || 0,
                url: e.user.avatar.thumb.url,
            },
            width: e.user.avatar.width || 0,
            height: e.user.avatar.height || 0,
            url: e.user.avatar.url,
        },
        name: e.user.name,
        email: e.user.email,
        course: e.user.course,
    },
    schoolClass: e.schoolClass === null || e.schoolClass === undefined ? null : {
        id: e.schoolClass.id,
        description: e.schoolClass.description,
        name: e.schoolClass.name,
    },
    professor: e.professor === null || e.professor === undefined ? null : {
        id: e.professor.id,
        schoolClasses: e.professor.schoolClasses.map((e: any) => ({
            id: e.id,
            description: e.description,
            name: e.name,
        })),
        avatar: e.professor.avatar === null || e.professor.avatar === undefined ? null : {
            thumb: {
                width: e.professor.avatar.thumb.width || 0,
                height: e.professor.avatar.thumb.height || 0,
                url: e.professor.avatar.thumb.url,
            },
            width: e.professor.avatar.width || 0,
            height: e.professor.avatar.height || 0,
            url: e.professor.avatar.url,
        },
        name: e.professor.name,
        tags: e.professor.tags.map((e: any) => e),
        hardness: e.professor.hardness || 0,
    },
    createdAt: new Date(e.createdAt + "Z"),
    text: e.text,
}));
  }

  async ping(): Promise<string> {
    const ret = await this.makeRequest({name: "ping", args: {}});
    return ret;
  }

  async setPushToken(token: string): Promise<void> {
    const args = {
      token: token,
    };
    await this.makeRequest({name: "setPushToken", args});
  }

  private device() {
    const device: any = {
      type: "node",
      fingerprint: this.fingerprint,
      language: null,
      screen: null,
      platform: null,
      version: null
    };
    if (this.deviceId)
      device.id = this.deviceId;
    return device;
  }

  private async makeRequest({name, args}: {name: string, args: any}) {
    const deviceData = this.device();
    const body = {
      id: randomBytes(8).toString("hex"),
      device: deviceData,
      name: name,
      args: args
    };

    const url = new URL(this.url + "/" + name);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      port: url.port
    };

    return new Promise<any>((resolve, reject) => {
      const request = (url.protocol === "http:" ? http.request : https.request)
      const req = request(options, resp => {
        let data = "";
        resp.on("data", (chunk) => {
          data += chunk;
        });
        resp.on("end", () => {
          try {
            const response = JSON.parse(data);

            try {
              this.deviceId = response.deviceId;
              if (response.ok) {
                resolve(response.result);
              } else {
                reject(response.error);
              }
            } catch (e) {
              console.error(e);
              reject({type: "Fatal", message: e.toString()});
            }
          } catch (e) {
            console.error(e);
            reject({type: "BadFormattedResponse", message: `Response couldn't be parsed as JSON (${data}):\n${e.toString()}`});
          }
        });

      });

      req.on("error", (e) => {
        console.error(`problem with request: ${e.message}`);
        reject({type: "Fatal", message: e.toString()});
      });

      // write data to request body
      req.write(JSON.stringify(body));
      req.end();
    });
  }
}
