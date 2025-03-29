import { ContextVariableMap, Hono } from "hono";
import Middleware from "../middlewares/middleware";
import { SupabaseClient, User } from "@supabase/supabase-js";
import GeminiService from "../services/gemini";

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
  return c.text("Hello from Scrollpedia!");
});

// ✅ Fetch user preferences
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

//  Save user preferences
app.post("/user", async (c) => {
  const db = c.var.DB;
  const user = c.var.user;
  const { preferences } = await c.req.json();

  if (preferences.length === 0 || preferences.length < 5) {
    console.log("POST /user: Please provide at least 5 preferences");
    return c.json({ error: "Please provide at least 5 preferences" }, 400);
  }

  const existing = await db
    .from("preferences")
    .select("user_id")
    .eq("user_id", user.id);

  if ((existing.data?.length as number) > 0) {
    console.log("POST /user: User already exists");
    return c.json({
      status: "error",
      message: "User already exists"
    }, 400);
  }

  // Generate preferences text embeddings using Gemini AI
  const profile_embedding = await new GeminiService(c).getTextEmbedding(preferences);
  if (!profile_embedding) {
    console.log("POST /user: Error generating profile embedding");
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
    console.log("POST /user: Error creating user", error.message);
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

// Fetch user feed (with category filtering)
app.get("/feed", async (c) => {
  const db = c.var.DB;

  // Extract categories from query parameters
  const categoriesQuery = c.req.query("categories");
  const selectedCategories = categoriesQuery ? categoriesQuery.split(",") : [];

  try {
    let query = db.from("articles").select("article_id, article_data, tags");

    // If categories are selected, apply filtering
    if (selectedCategories.length > 0) {
      console.log("Filtering feed based on selected categories:", selectedCategories);
      query = query.contains("tags", selectedCategories);
    } else {
      console.log("Fetching all articles as no categories are selected");
    }

    const { data, error } = await query;

    if (error) {
      console.log("GET /feed: Error fetching feed", error.message);
      return c.json({
        status: "error",
        message: error.message
      }, 500);
    }

    return c.json({
      status: "success",
      data
    });

  } catch (err) {
    console.log("GET /feed: Unexpected error", err);
    return c.json({
      status: "error",
      message: "Unexpected error occurred"
    }, 500);
  }
});

export default app;
