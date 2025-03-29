import { ContextVariableMap, Hono } from "hono";
import Middleware from "../middlewares/middleware";
import { SupabaseClient, User } from "@supabase/supabase-js";
import GeminiService from "../services/gemini";
import cosineSimilarity from "cosine-similarity";

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
    console.log("POST /user: Please provide at least 5 preferences");
    return c.json({ error: "Please provide at least 5 preferences" }, 400);
  }
  const existing = await db
    .from("preferences")
    .select("user_id")
    .eq("user_id", user.id)

  if ((existing.data?.length as number) > 0) {
    console.log("POST /user: User already exists");
    return c.json({
      status: "error",
      message: "User already exists"
    }, 400);
  }
  // generate preferences text embeddings from gemini ai
  const profile_embedding = await new GeminiService(c)
    .getTextEmbedding(preferences);
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

app.get("/feed", async (c) => {
  const db = c.var.DB;
  const user = c.var.user;

  // Fetch the user's profile embedding
  const { data: userProfile, error: userError } = await db
    .from("preferences")
    .select("profile_embedding")
    .eq("user_id", user.id)
    .single();

  if (userError || !userProfile) {
    console.log("GET /feed: Error fetching user profile embedding", userError?.message);
    return c.json({
      status: "error",
      message: "Error fetching user profile embedding",
    }, 500);
  }

  const userEmbedding = userProfile.profile_embedding;

  // Fetch all articles with their embeddings
  const { data: articles, error: articlesError } = await db
    .from("articles")
    .select("article_id, article_data, tags, article_embedding");

  if (articlesError || !articles) {
    console.log("GET /feed: Error fetching articles", articlesError?.message);
    return c.json({
      status: "error",
      message: "Error fetching articles",
    }, 500);
  }

  // Calculate cosine similarity for each article
  const similarArticles = articles
    .map((article) => ({
      article_id: article.article_id,
      article_data: article.article_data,
      tags: article.tags,
      similarity: cosineSimilarity(userEmbedding, article.article_embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity) // Sort by similarity in descending order
    .slice(0, 10); // Retrieve the top 10 similar articles

  return c.json({
    status: "success",
    data: similarArticles,
  });
});

export default app;
