// MARK: API
import * as api from "./api";

// MARK: Features
import * as cdn from "../../features/cdn";
import * as schoolClasses from "../../features/schoolClasses";
import * as professors from "../../features/professors";
import * as users from "../../features/users";
import * as commentaries from "../../features/commentaries";

api.start(8000);

// MARK: CDN
api.fn.uploadImage = cdn.uploadImage;
api.fn.cropImage = cdn.cropImage;
api.fn.uploadFile = cdn.uploadFile;

// MARK: SchoolClasses
api.fn.getSchoolClass = schoolClasses.getSchoolClass;
api.fn.getSchoolClassesFor = schoolClasses.getSchoolClassesFor;
api.fn.createSchoolClass = schoolClasses.createSchoolClass;
api.fn.editSchoolClass = schoolClasses.editSchoolClass;

// MARK: Professors
api.fn.getProfessor = professors.getProfessor;
api.fn.getProfessors = professors.getProfessors;
api.fn.getProfessorsFor = professors.getProfessorsFor;

api.fn.createProfessor = professors.createProfessor;
api.fn.editProfessor = professors.editProfessor;

// MARK: Users
api.fn.emailAvailable = users.emailAvailable;
api.fn.getCurrentUser = users.getCurrentUser;
api.fn.login = users.login;
api.fn.logout = users.logout;

api.fn.createUser = users.createUser;
api.fn.editUser = users.editUser;
api.fn.setAvatar = users.setAvatar;

// MARK: Commentaries
api.fn.createCommentary = commentaries.createCommentary;
api.fn.getCommentariesForProfessor = commentaries.getCommentariesForProfessor;
api.fn.getCommentariesForSchoolClass = commentaries.getCommentariesForSchoolClass;
