declare interface AppInterface {
  name:string;
  appID:string;
  url?:string;
}

declare interface AppCreateParams {
  access_token:string;
  name?:string;
  zip?:string;
}

declare interface AppFindParams {
  access_token:string;
  appID:string;
}

declare interface AppListParams {
  access_token:string;
}

declare interface AppCtorParams { 
  access_token:string;
  appID:string;
  name:string;
  url?:string; 
}

declare interface EnvInterface {
  appID:string;
  env:object;
}

declare interface DestroyResult {
  destroyed:string;
}

declare interface StaticFile {
  name:string;
}

/**
 * ```javascript
 * let apps = await App.list();
 * ```
 */
export declare class App<App> {

  /**
   * ```javascript
   * let app = await App.create({ access_token, name, zip })
   * ```
   */ 
  static create(params:AppCreateParams): Promise<AppInterface>;


  /**
   * ```javascript
   * // find a particular app
   * let app = await App.find({ access_token, appID })
   * ```
   */ 
  static find(params:AppFindParams): Promise<AppInterface>;
  
  /**
   * ```javascript
   * // get a list of apps
   * let { apps } = await App.list({ access_token })
   * ```
   */ 
  static list(params:AppListParams): Promise<AppInterface[]>;

  /**
   * ```javascript
   * let app = new App({ access_token, appID, name, url });
   * ```
   */
  constructor(params:AppCtorParams);

  /**
   * ```javascript
   * await app.deploy();
   * ```
   */
  deploy(params:object):Promise<void>;

  /**
   * ```javascript
   * await app.destroy();
   * ```
   */
  destroy(params:object):Promise<DestroyResult>;

  /**
   * ```javascript
   * let builds = await app.builds();
   * ```
   */
  builds(): Promise<object[]>;

  /**
   * ```javascript
   * let logs = await app.logs();
   * ```
   */
  logs(): Promise<object[]>;

  /**
   * ```javascript
   * let { env } = await app.env.get();
   * ```
   */
  env: Env;
  static: Static;
}

declare class Env {
  get():Promise<EnvInterface>;
  set(params:object):Promise<EnvInterface>;
  destroy(params:object):Promise<EnvInterface>;
}

declare class Static {
  get(params?:object):Promise<StaticFile|StaticFile[]>;
  set(params:object):Promise<StaticFile>;
  destroy(params:object):Promise<object>;
}
