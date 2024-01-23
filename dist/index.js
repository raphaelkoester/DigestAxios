"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const url = require("url");
const axios = require("axios");
class DigestAxios {
    constructor({ axios: axiosInst, password, username }) {
        this.axios = axiosInst ? axiosInst : axios.default;
        this.count = 0;
        this.password = password;
        this.username = username;
    }
    async request(opts) {
        try {
            return await this.axios.request(opts);
        }
        catch (resp1) {
            if (!this.isUnauthorized(resp1)) {
                throw resp1;
            }
            const authDetails = this.parseAuthDetails(resp1.response.headers["www-authenticate"]);
            const authorization = this.generateAuthorizationHeader(authDetails, opts);
            if (opts.headers) {
                opts.headers["authorization"] = authorization;
            }
            else {
                opts.headers = { authorization };
            }
            return this.axios.request(opts);
        }
    }
    isUnauthorized(resp) {
        var _a;
        return (resp.response !== undefined &&
            resp.response.status === 401 &&
            ((_a = resp.response.headers["www-authenticate"]) === null || _a === void 0 ? void 0 : _a.includes("nonce")));
    }
    parseAuthDetails(authHeader) {
        return new Map(authHeader
            .split(",")
            .map((v) => v.split("="))
            .map(([k, v]) => {
            if (k !== undefined && v !== undefined) {
                return [k.trim().toLowerCase(), v.replace(/"/g, "")];
            }
            throw new Error("Invalid array length");
        }));
    }
    generateAuthorizationHeader(authDetails, opts) {
        var _a;
        ++this.count;
        const nonceCount = ("00000000" + this.count).slice(-8);
        const cnonce = crypto.randomBytes(24).toString("hex");
        const realm = authDetails.get("realm");
        const ha1 = this.generateHa1(realm);
        const nonce = authDetails.get("nonce");
        const path = url.parse(opts.url).pathname;
        const ha2 = this.generateHa2((_a = opts.method) !== null && _a !== void 0 ? _a : "GET", path);
        const response = this.generateResponse(ha1, nonce, nonceCount, cnonce, ha2);
        return `Digest username="${this.username}",realm="${realm}",nonce="${nonce}",uri="${path}",qop="auth",algorithm="MD5",response="${response}",nc="${nonceCount}",cnonce="${cnonce}"`;
    }
    generateHa1(realm) {
        return crypto
            .createHash("md5")
            .update(`${this.username}:${realm}:${this.password}`)
            .digest("hex");
    }
    generateHa2(method, path) {
        return crypto
            .createHash("md5")
            .update(`${method}:${path}`)
            .digest("hex");
    }
    generateResponse(ha1, nonce, nonceCount, cnonce, ha2) {
        return crypto
            .createHash("md5")
            .update(`${ha1}:${nonce}:${nonceCount}:${cnonce}:auth:${ha2}`)
            .digest("hex");
    }
}
exports.default = DigestAxios;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBaUM7QUFDakMsMkJBQTJCO0FBQzNCLCtCQUErQjtBQVEvQixNQUFxQixXQUFXO0lBTS9CLFlBQVksRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQW1CO1FBQ3BFLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDbkQsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixDQUFDO0lBRU0sS0FBSyxDQUFDLE9BQU8sQ0FDbkIsSUFBOEI7UUFFOUIsSUFBSSxDQUFDO1lBQ0osT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sS0FBSyxDQUFDO1lBQ2IsQ0FBQztZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FDeEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FDMUMsQ0FBQztZQUNGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FDckQsV0FBVyxFQUNYLElBQUksQ0FDSixDQUFDO1lBRUYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsYUFBYSxDQUFD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