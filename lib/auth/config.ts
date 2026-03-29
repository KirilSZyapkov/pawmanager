import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@/drizzle/db";
import bcrypt from "bcryptjs";

declare module 'next-auth' {
    interface User {
        id: string;
        role: "owner" | "staff" | "client";
        businessId?: string;
        email?: string;
        name: string;
    }

    interface Session {
        user: User;
    }
};

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: "owner" | "staff" | "client";
        businessId?: string;
        email?: string;
        name: string;

    }
};

export const authConfig: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
                role: { label: 'Role', type: 'role' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Моля въведете емаил и парола");
                };

                const role = credentials.role as "owner" | "staff" | "client";

                if (role === 'owner') {
                    const business = await db.query.businesses.findFirst({
                        where: (businesses, { eq }) => eq(businesses.email, credentials.email)
                    });

                    if (!business || !business.password) {
                        throw new Error("Invalid credentials!");
                    };

                    const isValidPassword = await bcrypt.compare(
                        credentials.password,
                        business.password
                    );

                    if (!isValidPassword) {
                        throw new Error("Invalid credentials!");
                    }

                    return {
                        id: business.id,
                        email: business.email,
                        name: business.name,
                        role: 'owner',
                        businessId: business.id,
                    };
                };

                if (role === 'staff') {
                    const staffMember = await db.query.staff.findFirst({
                        where: (staff, { eq }) => eq(staff.email, credentials.email)
                    });

                    if (!staffMember) {
                        throw new Error("Invalid credentials!");
                    };

                    return {
                        id: staffMember.id,
                        email: staffMember.email,
                        name: staffMember.name,
                        role: 'staff',
                        businessId: staffMember.businessId,
                    };
                };

                if (role === 'client') {
                    // Клиентите влизат с телефон и код, затова връщаме null за credentials
                    return null;
                };

                throw new Error("Invalid credentials!");
            }
        }),

        CredentialsProvider({
            id: 'client-code',
            name: 'client-code',
            credentials: {
                phone: { label: 'Phone', type: 'tel' },
                code: { label: 'Code', type: 'text' }
            },

            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.code) {
                    throw new Error("Invalid credentials!");
                };

                const client = await db.query.clients.findFirst({
                    where: (clients, { eq }) => eq(clients.phone, credentials.phone)
                });

                if (!client) {
                    throw new Error("Invalid credentials!");
                };

                if (credentials.code !== '123456') {
                    throw new Error("Invalid credentials!");
                };

                return {
                    id: client.id,
                    name: client.name,
                    email: client.email || undefined,
                    phone: client.phone,
                    role: 'client',
                    businessId: client.businessId,
                };

            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.businessId = user.businessId;
                token.email = user.email;
                token.name = user.name;
            };

            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as 'owner' | 'staff' | 'client';
                session.user.businessId = token.businessId as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            };

            return session;
        }
    },

    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error'
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,
}