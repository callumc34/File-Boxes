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

    /**
     * Check if token exists
     *
     * @return     {Boolean}  true if cookie exists false otherwise
     */
    static exists() {
        return Token.get() != null;
    }

    /**
     * Check if token is expired
     *
     * @return     {Boolean}  true if expired false otherwise.
     */
    static async expired() {
        var result = await Token.getInfo();
        if (result == null) return null;
        else return result.expired;
    }

    /**
     * Gets the user from the token
     *
     * @return     {string}  The username.
     */
    static async getUser() {
        var result = await Token.getInfo();
        console.log(result);
        if (result == null) return null;
        return result.username;
    }

    /**
     * Gets the information from the server.
     *
     * @return     {Object}  The user information.
     */
    static async getInfo() {
        let result = await Axios.get(`/api/user?token=${Token.get()}`);
        return result.data;
    }
}

export default Token;
