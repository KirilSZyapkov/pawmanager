import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest } from "next/server";
import { appRouter } from "@/lib/trpc/server";
import { createContext } from '@/lib/trpc/context';

const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: () => createContext(req),
    });

export { handler as GET, handler as POST };