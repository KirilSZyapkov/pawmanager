import { inferAsyncReturnType } from "@trpc/server";
import {CreateNextContextOptions} from "@trpc/server/adapters/next";
import {getServerSession} from "next-auth";
import db from "../../drizzle/db";
import {authConfig} from "@/lib/auth/config"