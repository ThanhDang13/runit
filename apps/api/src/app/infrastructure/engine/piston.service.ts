import { Inject, Injectable, Logger, OnModuleInit, Optional } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";

export const PISTON_SERVER = "http://localhost:2000";

export type PistonRuntime = {
  language: string;
  version: string;
  aliases: string[];
};

export type PistonPhaseResult = {
  signal: string | null;
  stdout: string;
  stderr: string;
  code: number;
  output: string;
  memory: number | null;
  message: string | null;
  status: string | null;
  cpu_time: number;
  wall_time: number;
};

export type PistonExecuteResponse = {
  compile?: PistonPhaseResult;
  run: PistonPhaseResult;
  language: string;
  version: string;
};

export type PistonExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  output: string;
};

@Injectable()
export class PistonEngineService implements OnModuleInit {
  private readonly logger = new Logger(PistonEngineService.name);
  private readonly client: AxiosInstance;
  private runtimes: PistonRuntime[] = [];

  constructor(@Optional() @Inject(PISTON_SERVER) private readonly server?: string) {
    this.client = axios.create({
      baseURL: `${this.server || "http://localhost:2000"}/api/v2`,
      headers: { "Content-Type": "application/json" },
      timeout: 5000
    });
  }

  async onModuleInit() {
    await this.loadRuntimes();
  }

  async loadRuntimes(): Promise<PistonRuntime[]> {
    const res = await this.client.get<PistonRuntime[]>("/runtimes");
    this.runtimes = res.data;
    this.logger.debug(`Loaded runtimes: ${JSON.stringify(this.runtimes)}`);
    return this.runtimes;
  }

  getRuntime(language: string, version?: string): PistonRuntime | undefined {
    return this.runtimes.find(
      (r) =>
        (r.language.toLowerCase() === language.toLowerCase() ||
          r.aliases?.some((alias) => alias.toLowerCase() === language.toLowerCase())) &&
        (!version || r.version === version)
    );
  }

  async execute(
    code: string,
    language: string,
    input = "",
    version?: string
  ): Promise<PistonExecutionResult> {
    const runtime = this.getRuntime(language, version);
    if (!runtime) {
      throw new Error(`Runtime not found for language=${language} version=${version || "any"}`);
    }

    const body = {
      language: runtime.language,
      version: runtime.version,
      files: [{ name: "main", content: code }],
      stdin: input,
      args: []
    };

    const res = await this.client.post<PistonExecuteResponse>("/execute", body);
    const run = res.data.run;

    return {
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.code,
      output: run.output
    };
  }
}
