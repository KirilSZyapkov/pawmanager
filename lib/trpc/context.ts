import { NextRequest } from "next/server";
import {getServerSession} from "next-auth";
import db from "../../drizzle/db";
import {authConfig} from "@/lib/auth/config";

export async function createContext(req: NextRequest) {
  const session = await getServerSession(authConfig);

  return{
    db,
    session,
    req
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;