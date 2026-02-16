import type { Category, Product } from "@/types";
import { supabase } from "./supabase";

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Category | null;
}

// ─── Smart Auto-Filters (derived from product names) ────────────────────────

/**
 * Extracts common prefixes from product names to create automatic filter groups.
 * e.g. ["آسيا 100", "آسيا 500", "زين 5", "زين 10"] → ["آسيا", "زين"]
 */
export async function getAutoFilters(categoryId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("name_ar")
    .eq("category_id", categoryId)
    .eq("is_active", true);

  if (error) throw error;
  if (!data || data.length < 2) return [];

  const names = data.map((d) => d.name_ar.trim());
  return extractFilterGroups(names);
}

function extractFilterGroups(names: string[]): string[] {
  const prefixCount = new Map<string, number>();

  for (const name of names) {
    const words = name.split(/\s+/);
    if (words.length === 0) continue;
    const prefix = words[0];
    if (prefix.length < 2) continue;
    prefixCount.set(prefix, (prefixCount.get(prefix) ?? 0) + 1);
  }

  const filters: string[] = [];
  for (const [prefix, count] of prefixCount) {
    if (count >= 2) filters.push(prefix);
  }

  return filters.sort();
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function getProducts(options?: {
  categoryId?: string;
  filterPrefix?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true);

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }
  if (options?.filterPrefix) {
    query = query.ilike("name_ar", `${options.filterPrefix}%`);
  }
  if (options?.search) {
    query = query.ilike("name_ar", `%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 20) - 1,
    );
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Product | null;
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Product[];
}
