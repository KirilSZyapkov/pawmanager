import {getServerSession} from "next-auth";
import { authConfig } from "@/lib/auth/config";
import {redirect} from "next/navigation";

export async function requireUser(){
    const session = await getServerSession(authConfig);

    if(!session?.user){
        redirect("/auth/signin");
    };

    return session;
}

export async function requireOwner() {
    const user = await requireUser();

    if(user.role !== "owner"){
        redirect("/");
    }

    return user;
}