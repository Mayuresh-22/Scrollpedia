import { createMiddleware } from "hono/factory";
import Supabase from "../services/supabase";
import { Context } from "hono";
import { SupabaseClient } from "@supabase/supabase-js";

/**
* This middleware is used to authenticate the user
* @param c: Context<{ Bindings: CloudflareBindings }>
* @param DB: SupabaseClient
* @returns user: User | null
*/
const AuthMiddleware = async (c: Context<{ Bindings: CloudflareBindings }>, DB: SupabaseClient) => {
    const access_token = c.req.header("Authorization");
    const refresh_token = c.req.header("X-Refresh-Token");
    if (!access_token || !refresh_token) {
        return null;
    }
    const currUser = await DB.auth.getUser(access_token);
    if (!currUser) {
        return null;
    }
    DB.auth.setSession({
        access_token: access_token,
        refresh_token: refresh_token,
    })
    return currUser.data.user;
};

export default AuthMiddleware;