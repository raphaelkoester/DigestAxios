const { default: AxiosDigestAuth } = require("../dist");

const PASSWORD = "passwd";
const USERNAME = "user";

describe("AxiosDigestAuth", function() {
  describe("request()", function() {
    it("should work", async function() {
      const digestAuth = new AxiosDigestAuth({
        password: PASSWORD,
        username: USERNAME,
      });
      await digestAuth.request({
        headers: { Accept: "application/json" },
        method: "GET",
        url: "https://httpbin.org/digest-auth/auth/user/passwd",
      });
    });
  });
});
