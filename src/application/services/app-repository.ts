import { RdModule } from "@radts/reactjs";
import axios from "axios";
import { onError, onRequest, onResponse } from "./intercepter";

export class AppRepository extends RdModule {
  public readonly key: symbol;

  // public readonly lotus: testRepository;
  constructor(basePath?: string) {
    super();
    // testConfig.basePath = basePath;
    this.key = Symbol("AppRepository");
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();

    axios.defaults.timeout = 60 * 1000;
    axios.interceptors.request.use(onRequest, onError);
    axios.interceptors.response.use(onResponse, onError);
    // this.lotus = new testRepository({ ...lotusConfig });
  }

  public getName(): string {
    return this.key.description ?? "AppRepository";
  }
}
