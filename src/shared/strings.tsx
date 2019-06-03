import LocalizedStrings from "localized-strings";

const strings = new LocalizedStrings({
    pt: {
        error: {
            notLoggedIn: "Não está logado",
            notFound: {
                user: "Usuário não encontrado",
            },
            wrongLoginOrPassword: "Login ou senha incorretos",
            missingArgument: {
                image: "Imagem não enviada",
            },
            invalidArgument: "Argumento inválido",
            invalidEmail: "Email inválido",
            passwordTooSmall: "Senha muito curta",
            emailAlreadyInUse: "Email já está em uso",
        },
    },
});

export default strings;
