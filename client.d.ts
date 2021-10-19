export = App;

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

declare class App<App> {

  static create(params:AppCreateParams): Promise<AppInterface>;
  static find(params:AppFindParams): Promise<AppInterface>;
  static list({ access_token:string }): Promise<AppInterface[]>;

  constructor(params:AppCtorParams);

  deploy(params:object):Promise<void>;
  destroy(params:object):Promise<DestroyResult>;

  builds(): Promise<object[]>;
  logs(): Promise<object[]>;
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
