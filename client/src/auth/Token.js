import Axios from "axios";
import { bake_cookie, read_cookie, delete_cookie } from "sfcookies";

const NAME = "token";

class Token {
    /**
     * Get the token from cookies
     *
     * @type       {string}
     */
    static get() {
        return read_cookie(NAME);
    }

    /**
     * Set the token cookie
     *
     * @type       {string}
     */
    static set(token) {
        return bake_cookie(NAME, token);
    }

    /**
     * delete the cookie
     */
    static delete() {
        return delete_cookie(NAME);
    }

    static validate() {
        return Token.validate(Token.get());
    }

    static validateSpecific(username, token) {
        var result = false;
        Axios.post("/api/validate", { username, token })
            .then((res) => {
                if (res.status === 200) result = true;
            })
            .catch((err) => {
                result = false;
            });
        return result;
    }
}

export default Token;
