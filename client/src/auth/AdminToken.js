import { bake_cookie, read_cookie, delete_cookie } from "sfcookies";
const NAME = "supertoken";

class AdminToken {
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
        return AdminToken.get().length != 0;
    }

    async authenticate() {}
}

export default AdminToken;
