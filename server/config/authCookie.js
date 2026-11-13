const ACCESS_TOKEN_COOKIE = "accessToken";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const baseCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

const accessTokenCookieOptions = () => ({ ...baseCookieOptions(), maxAge: ONE_DAY_MS });

module.exports = { ACCESS_TOKEN_COOKIE, baseCookieOptions, accessTokenCookieOptions };
