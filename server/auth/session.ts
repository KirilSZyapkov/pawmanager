import {getServerSession} from "next-auth";
import { authConfig } from "@/lib/auth/config";
import {redirect} from "next/navigation";

export async function requireUser(){
    const session = await getServerSession(authConfig);

    if(!session?.user){
        redirect("/auth/signin");
    };

    return session.user;
}

export async function requireOwner() {
    const user = await requireUser();

    if (user.role === "client") {
        redirect("/client");
    }

    if (user.role === "staff") {
        redirect("/staff");
    }

    return user;
}