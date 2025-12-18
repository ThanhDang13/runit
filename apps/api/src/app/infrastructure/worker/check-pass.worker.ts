import { ThreadWorker } from "poolifier";

export interface PassCheckTask {
  output: string;
  expected: string;
}

export interface PassCheckResult extends PassCheckTask {
  passed: boolean;
}

export default new ThreadWorker(
  (task: PassCheckTask): PassCheckResult => {
    const { output, expected } = task;
    return { ...task, passed: output === expected };
  },
  {
    maxInactiveTime: 60000
  }
);
