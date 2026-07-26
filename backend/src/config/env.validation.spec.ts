import { describe, expect, it } from "vitest";
import { envValidationSchema } from "./env.validation";

const validEnvironment = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://finance_user:finance_password@localhost:5434/finance_dashboard?schema=public",
  JWT_ACCESS_SECRET: "access-secret-with-at-least-thirty-two-characters",
  JWT_REFRESH_SECRET: "refresh-secret-with-at-least-thirty-two-characters",
};

describe("envValidationSchema", () => {
  it("aceita a configuração mínima do backend", () => {
    const result = envValidationSchema.validate(validEnvironment, { abortEarly: false });
    expect(result.error).toBeUndefined();
    expect(result.value.PORT).toBe(3001);
    expect(result.value.API_PREFIX).toBe("api/v1");
  });

  it("recusa segredos JWT curtos", () => {
    const result = envValidationSchema.validate(
      { ...validEnvironment, JWT_ACCESS_SECRET: "curta" },
      { abortEarly: false },
    );
    expect(result.error).toBeDefined();
  });
});
