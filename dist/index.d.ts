import * as axios from "axios";
export interface DigestAxiosOpts {
    axios?: axios.AxiosInstance;
    password: string;
    username: string;
}
export default class DigestAxios {
    private readonly axios;
    private count;
    private readonly password;
    private readonly username;
    constructor({ axios: axiosInst, password, username }: DigestAxiosOpts);
    request(opts: axios.AxiosRequestConfig): Promise<axios.AxiosResponse>;
    private isUnauthorized;
    private parseAuthDetails;
    private generateAuthorizationHeader;
    private generateHa1;
    private generateHa2;
    private generateResponse;
}
