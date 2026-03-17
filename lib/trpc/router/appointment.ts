import {z} from "zod";
import {TRPCError} from "@trpc/server";
import {router, businessProcedure} from "../trpc";
import db from "@/drizzle/db";
import {appointmentSchema} from "@/lib/validators/appointment";