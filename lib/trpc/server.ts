import {inferRouterInputs inferRouterOutputs} from "@trpc/server";
import { AppRouter, appRouter } from "./router";

export {appRouter};
export type {AppRouter};

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;