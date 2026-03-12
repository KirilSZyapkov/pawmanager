import {CreateNextContextOptions} from "@trpc/server/adapters/next";
import {getServerSession} from "next-auth";
import db from "../../drizzle/db";
import {authConfig} from "@/lib/auth/config";

export async function createContext(opts: CreateNextContextOptions) {
  const session = await getServerSession(authConfig);

  return{
    db,
    session,
    req: opts.req,
    res: opts.res
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;