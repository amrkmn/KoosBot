import { ApplyOptions } from "@sapphire/decorators";
import { ApiRequest, ApiResponse, methods, Route } from "@sapphire/plugin-api";

@ApplyOptions<Route.Options>({ route: `` })
export class UserRoute extends Route {
    public [methods.GET](_request: ApiRequest, response: ApiResponse) {
        response.json({ message: `Landing page for ${this.container.client.user?.tag}` });
    }

    public [methods.POST](_request: ApiRequest, response: ApiResponse) {
        response.json({ message: `Landing page for ${this.container.client.user?.tag}` });
    }
}
