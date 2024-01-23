import * as crypto from "crypto";
import * as url from "url";
import * as axios from "axios";

export interface DigestAxiosOpts {
	axios?: axios.AxiosInstance;
	password: string;
	username: string;
}

export default class DigestAxios {
	private readonly axios: axios.AxiosInstance;
	private count: number;
	private readonly password: string;
	private readonly username: string;

	constructor({ axios: axiosInst, password, username }: DigestAxiosOpts) {
		this.axios = axiosInst ? axiosInst : axios.default;
		this.count = 0;
		this.password = password;
		this.username = username;
	}

	public async request(
		opts: axios.AxiosRequestConfig,
	): Promise<axios.AxiosResponse> {
		try {
			return await this.axios.request(opts);
		} catch (resp1: any) {
			if (!this.isUnauthorized(resp1)) {
				throw resp1;
			}

			const authDetails = this.parseAuthDetails(
				resp1.response.headers["www-authenticate"],
			);
			const authorization = this.generateAuthorizationHeader(
				authDetails,
				opts,
			);

			if (opts.headers) {
				opts.headers["authorization"] = authorization;
			} else {
				opts.headers = { authorization };
			}

			return this.axios.request(opts);
		}
	}

	private isUnauthorized(resp: any): boolean {
		return (
			resp.response !== undefined &&
			resp.response.status === 401 &&
			resp.response.headers["www-authenticate"]?.includes("nonce")
		);
	}

	private parseAuthDetails(authHeader: string): Map<string, string> {
		return new Map(
			authHeader
				.split(",")
				.map((v: string) => v.split("="))
				.map(([k, v]: string[]) => {
					if (k !== undefined && v !== undefined) {
						return [k.trim().toLowerCase(), v.replace(/"/g, "")];
					}
					throw new Error("Invalid array length");
				}),
		);
	}

	private generateAuthorizationHeader(
		authDetails: Map<string, string>,
		opts: axios.AxiosRequestConfig,
	): string {
		++this.count;
		const nonceCount = ("00000000" + this.count).slice(-8);
		const cnonce = crypto.randomBytes(24).toString("hex");
		const realm = authDetails.get("realm");
		const ha1 = this.generateHa1(realm);
		const nonce = authDetails.get("nonce");
		const path = url.parse(opts.url!).pathname;
		const ha2 = this.generateHa2(opts.method ?? "GET", path);
		const response = this.generateResponse(
			ha1,
			nonce,
			nonceCount,
			cnonce,
			ha2,
		);

		return `Digest username="${this.username}",realm="${realm}",nonce="${nonce}",uri="${path}",qop="auth",algorithm="MD5",response="${response}",nc="${nonceCount}",cnonce="${cnonce}"`;
	}

	private generateHa1(realm: string | undefined): string {
		return crypto
			.createHash("md5")
			.update(`${this.username}:${realm}:${this.password}`)
			.digest("hex");
	}

	private generateHa2(method: string, path: string | null): string {
		return crypto
			.createHash("md5")
			.update(`${method}:${path}`)
			.digest("hex");
	}

	private generateResponse(
		ha1: string,
		nonce: string | undefined,
		nonceCount: string,
		cnonce: string,
		ha2: string,
	): string {
		return crypto
			.createHash("md5")
			.update(`${ha1}:${nonce}:${nonceCount}:${cnonce}:auth:${ha2}`)
			.digest("hex");
	}
}
