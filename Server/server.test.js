const supertest = require("supertest");
const server = require("./index");
const jestExtended = require("jest-extended");
expect.extend(jestExtended);

require("dotenv").config();

describe("---USER AUTH---", () => {
  describe("USER LOGIN", () => {
    it("LOGIN - Correct Auth Details", async () => {
      const res = await supertest(server)
        .post("/login")
        .send({
          user: { Email: process.env.EMAIL, Password: process.env.PASSWORD },
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.Token).toBeDefined();
      expect(res.body.type).toEqual("success");
    });

    it("LOGIN - Missing Information", async () => {
      const res = await supertest(server).post("/login").send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toEqual("Missing Information");
      expect(res.body.type).toEqual("error");
    });

    it("LOGIN - Incorrect Email", async () => {
      const res = await supertest(server)
        .post("/login")
        .send({
          user: {
            Email: process.env.EMAIL + "Extra",
            Password: process.env.PASSWORD,
          },
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBeOneOf([
        "Incorrect Email or Password. Try again!",
        "Email must be a valid email",
      ]);
      expect(res.body.type).toEqual("error");
    });

    it("LOGIN - Incorrect Password", async () => {
      const res = await supertest(server)
        .post("/login")
        .send({
          user: {
            Email: process.env.EMAIL,
            Password: process.env.PASSWORD + "Extra",
          },
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toEqual(
        "Incorrect Email or Password. Try again!"
      );
      expect(res.body.type).toEqual("error");
    });
  });

  describe("CREATE USER", () => {
    it("Create User -- Missing user Object", async () => {
      const res = await supertest(server).post("/user/signup").send({});
      expect(res.body.msg).toBe("Missing Information");
      expect(res.statusCode).toBe(400);
      expect(res.body.type).toBe("error");
    });

    it("Create User -- Schema not Passed", async () => {
      const res = await supertest(server)
        .post("/user/signup")
        .send({
          user: {
            Username: "",
            Email: "",
            Phone: "",
            Password: "",
          },
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.type).toBe("error");
    });

    it("Create User -- EXISTING USERNAME", async () => {
      const res = await supertest(server)
        .post("/user/signup")
        .send({
          user: {
            Username: "user1",
            Email: process.env.EMAIL,
            Phone: "12345678900",
            Password: process.env.PASSWORD,
          },
        });
      expect(res.body.msg).toEqual("Username Taken");
      expect(res.statusCode).toBe(400);
      expect(res.body.type).toBe("error");
    });

    it("Create User -- EXISTING EMAIL", async () => {
      const res = await supertest(server)
        .post("/user/signup")
        .send({
          user: {
            Username: "blabla",
            Email: process.env.EMAIL,
            Phone: "12345678900",
            Password: process.env.PASSWORD,
          },
        });
      expect(res.body.msg).toEqual("Email Taken");
      expect(res.statusCode).toBe(400);
      expect(res.body.type).toBe("error");
    });

    it("Create User -- No Errors", async () => {
      const res = await supertest(server)
        .post("/user/signup")
        .send({
          user: {
            Username: "username",
            Email: "username@gmail.com",
            Phone: "12345678900",
            Password: "Hesam1376",
          },
        });
      expect(res.body.msg).toEqual("user created");
      expect(res.statusCode).toBe(200);
      expect(res.body.type).toBe("success");

      const res2 = await supertest(server).post("/user/delete").send({
        Username: "username",
      });

      expect(res2.body.message).toEqual("user deleted");
      expect(res2.statusCode).toBe(200);
      expect(res2.body.type).toBe("success");
    });
  });

  describe("GET USER", () => {
    it("Get user -- No Token", async () => {
      const res = await supertest(server).get("/user/get");
      expect(res.body.message).toEqual("Token Not Found");
      expect(res.statusCode).toBe(400);
      expect(res.body.type).toBe("error");
    });
    it("Get user -- No userID", async () => {
      const res = await supertest(server)
        .get("/user/get")
        .set("Token", process.env.TEMP_TOKEN);
      expect(res.body.message).toEqual("user not found");
      expect(res.statusCode).toBe(400);
      expect(res.body.type).toBe("error");
    });
    it("Get user -- No Errors", async () => {
      const res = await supertest(server)
        .get("/user/get")
        .set("Token", process.env.TEMP_TOKEN)
        .set("userID", process.env.TEMP_USERID);
      expect(res.body.msg).toEqual("User information provided");
      expect(res.statusCode).toBe(200);
      expect(res.body.type).toBe("success");
    });
  });
});
