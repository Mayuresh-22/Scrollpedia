import { ContextVariableMap, Hono } from "hono";
import Middleware from "../middlewares/middleware";
import { SupabaseClient, User } from "@supabase/supabase-js";
import GeminiService from "../services/gemini";
import { shuffle } from "../utils/shuffle";

// Define CloudflareBindings type with required environment variables
interface CloudflareBindings {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  BACKEND_URL: string;
  GEMINI_KEY: string;
  ASSETS: string;
  [key: string]: any; // Allow additional properties for flexibility
}

// Extend ContextVariableMap for custom variables
export interface Variables extends ContextVariableMap {
  DB: SupabaseClient;
  user: User;
}

const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

app.use("/*", Middleware);

app.get("/ping", (c) => {
  return c.text("pong");
});

app.get("/message", (c) => {
  return c.text("Hello from Scrolpedia!");
});

app.get("/user", async (c) => {
  const db = c.var.DB;
  const user = c.var.user;
  const { data, error } = await db
    .from("preferences")
    .select("user_id, preferences")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }
  return c.json({
    status: "success",
    data
  });
});

app.post("/user", async (c) => {
  const db = c.var.DB;
  const user = c.var.user;
  const { preferences } = await c.req.json();

  if (preferences.length === 0 || preferences.length < 5) {
    return c.json({ error: "Please provide at least 5 preferences" }, 400);
  }

  const existing = await db
    .from("preferences")
    .select("user_id")
    .eq("user_id", user.id);

  if ((existing.data?.length as number) > 0) {
    return c.json({
      status: "error",
      message: "User already exists"
    }, 400);
  }

  const profile_embedding = await new GeminiService(c).getTextEmbedding(preferences); // Updated context type
  if (!profile_embedding) {
    return c.json({
      status: "error",
      message: "Error generating profile embedding"
    }, 500);
  }

  const { data, error } = await db.from("preferences").insert({
    user_id: user.id,
    preferences,
    profile_embedding,
  });

  if (error) {
    return c.json({
      status: "error",
      message: error.message
    }, 500);
  }
  return c.json({
    message: "User created successfully",
    status: "success",
    data: {
      user_id: user.id,
      preferences
    }
  });
});

app.get("/feed", async (c) => {
  const db = c.var.DB;
  const user = c.var.user;
  const { data: userProfile, error: userError } = await db
    .from("preferences")
    .select("profile_embedding")
    .eq("user_id", user.id)
    .single();

  if (userError || !userProfile) {
    return c.json({
      status: "error",
      message: "Error fetching user profile embedding",
    }, 500);
  }

  const { data: similarArticles, error: articlesError } = await db.rpc("match_articles", {
    query_embedding: userProfile.profile_embedding,
    match_threshold: 0.45,
    match_count: 30
  });

  if (articlesError || !similarArticles) {
    return c.json({
      status: "error",
      message: "Error fetching similar articles",
    }, 500);
  }

  return c.json({
    status: "success",
    data: shuffle(similarArticles)
  });
});

app.get("/user/interactions", async (c) => {
  const db = c.var.DB;
  const user = c.var.user;

  // Define the expected type for the interaction data
  interface InteractionItem {
    action_type: string;
    count: number;
  }

  const { data, error } = await db
    .from("interactions")
    .select("action_type, count: count(*)", { count: "exact" }) // Correct syntax for counting with implicit grouping
    .eq("user_id", user.id);

  if (error) {
    return c.json({ status: "error", message: error.message }, 500);
  }

  const stats = {
    likes: 0,
    saves: 0,
  };

  data?.forEach((item: InteractionItem) => {
    if (item.action_type === "like") {
      stats.likes = item.count;
    } else if (item.action_type === "save") {
      stats.saves = item.count;
    }
  });

  return c.json({ status: "success", data: stats });
});

// Endpoint to add a comment
app.post("/comments", async (c) => {
  const db = c.var.DB;
  const { username, article_id, comment } = await c.req.json();

  if (!username || !article_id || !comment) {
    return c.json({ status: "error", message: "Missing required fields" }, 400);
  }

  try {
    const { data, error } = await db
      .from("comments")
      .insert({
        username,
        article_id: parseInt(article_id), // Ensure article_id is int8
        comment,
      })
      .select();

    if (error) {
      console.error("Supabase insert error:", error.message);
      return c.json({ status: "error", message: error.message }, 500);
    }

    return c.json({
      status: "success",
      data: data[0],
    });
  } catch (error) {
    console.error("Unexpected error in /comments:", error);
    return c.json({ status: "error", message: "Internal server error" }, 500);
  }
});

// New endpoint to get the comment count for a specific article
app.get("/comments/count/:articleId", async (c) => {
  const db = c.var.DB;
  const articleId = c.req.param("articleId");

  if (!articleId) {
    return c.json({ status: "error", message: "Missing articleId parameter" }, 400);
  }

  try {
    const { data, error, count } = await db
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("article_id", parseInt(articleId));

    if (error) {
      console.error("Supabase count error:", error.message);
      return c.json({ status: "error", message: error.message }, 500);
    }

    return c.json({
      status: "success",
      count: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error in /comments/count:", error);
    return c.json({ status: "error", message: "Internal server error" }, 500);
  }
});

export default app;