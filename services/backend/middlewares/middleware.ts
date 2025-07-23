// i am creating this middlware as a parent middleware
// which will call other child middlewares
// usecase: not all routes need to be protected
// so we can use this middleware to check if the route is protected or not

import { SupabaseClient } from "@supabase/supabase-js";
import { createMiddleware } from "hono/factory";
import Supabase from "../services/supabase";
import AuthMiddleware from "./authMiddleware";

export const PROTECTED_ROUTES = [
    "/user",
    "/feed",
    "/interactions",
    "/viewed",
];

const Middleware = createMiddleware(async (c, next) => {
    if (!PROTECTED_ROUTES.includes(c.req.path)) {
        return await next();
    }
    const DB: SupabaseClient = new Supabase(c).supabase;
    const currUser = await AuthMiddleware(c, DB);
    if (!currUser) {
        return c.json({
            status: "error",
            message: "Unauthorized"
        }, 401);
    }
    c.set("user", currUser);
    c.set("DB", DB);
    await next();
});

export default Middleware;
