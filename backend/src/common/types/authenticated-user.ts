export type AuthenticatedUser = {
  id: string;
  sessionId: string;
  name: string;
  email: string;
};

export type JwtPayload = {
  sub: string;
  sessionId: string;
  type: "access" | "refresh";
};
