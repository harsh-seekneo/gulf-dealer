import { USER_LOGIN_URL } from "../config/env";

export const buildUserLoginRedirectUrl = (returnTo = window.location.href) => {
  const loginUrl = new URL(USER_LOGIN_URL);
  loginUrl.searchParams.set("redirect", returnTo);

  return loginUrl.toString();
};

export const redirectToUserLogin = (returnTo) => {
  window.location.replace(buildUserLoginRedirectUrl(returnTo));
};
