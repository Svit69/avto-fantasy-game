export class AuthorizedTelegramAppUrlFactory {
  constructor(tokenService) {
    this.tokenService = tokenService;
  }

  createAuthorizedAppUrl(appUrl, user) {
    if (user?.status !== "active" || !this.tokenService.hasSecret()) return appUrl;
    const url = new URL(appUrl);
    url.searchParams.set("web_login", this.tokenService.createToken(user.id));
    return url.toString();
  }
}
