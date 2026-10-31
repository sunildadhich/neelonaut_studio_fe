export type ArtifactType = "article" | "technical_guide" | "research_document" | "notes" | "essay" | "story" | "collection" | "interactive_article";
export type Block = { type: "paragraph" | "heading" | "quote" | "code" | "image" | "list" | "divider"; text?: string; level?: number; language?: string; items?: string[]; url?: string };
export type User = { id: string; email: string; username: string; status: string; email_verified_at: string | null };
export type Workspace = { id: string; owner_id: string; name: string };
export type Document = { id: string; workspace_id: string; owner_id: string; title: string; artifact_type: ArtifactType; status: "draft" | "archived"; content: { blocks: Block[] }; version: number };
export type Publication = { id: string; document_id: string; author_id: string; title: string; slug: string; excerpt: string | null; content: { blocks: Block[] }; visibility: "public" | "private" | "unlisted"; published_at: string | null };
export type AIResponse = { suggestion?: string; text?: string; result?: string; output?: string };

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const csrf = () => document.cookie.match(/(?:^|; )studio_csrf=([^;]+)/)?.[1] || "";
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method || "GET";
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (method !== "GET") headers.set("X-CSRF-Token", decodeURIComponent(csrf()));
  const res = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
export const api = {
  me: () => request<User>("/auth/me"),
  signup: (body: { email: string; username: string; password: string }) => request<User>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) => request<User>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  workspaces: () => request<Workspace[]>("/workspaces"),
  createWorkspace: (name: string) => request<Workspace>("/workspaces", { method: "POST", body: JSON.stringify({ name }) }),
  documents: (workspaceId?: string) => request<Document[]>(`/documents${workspaceId ? `?workspace_id=${workspaceId}` : ""}`),
  document: (id: string) => request<Document>(`/documents/${id}`),
  createDocument: (body: { workspace_id: string; title: string; artifact_type: ArtifactType; content: { blocks: Block[] } }) => request<Document>("/documents", { method: "POST", body: JSON.stringify(body) }),
  updateDocument: (id: string, body: { title?: string; content?: { blocks: Block[] }; status?: "draft" | "archived"; expected_version: number }) => request<Document>(`/documents/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  versions: (id: string) => request<Array<{ version: number; title: string; content: { blocks: Block[] }; created_at: string }>>(`/documents/${id}/versions`),
  publish: (body: { document_id: string; visibility: string; excerpt?: string; slug?: string; allow_comments: boolean }) => request<Publication>("/publications", { method: "POST", body: JSON.stringify(body) }),
  publication: (slug: string) => request<Publication>(`/publications/${encodeURIComponent(slug)}`),
  latest: (query = "") => request<Publication[]>(`/discovery/latest${query ? `?q=${encodeURIComponent(query)}` : ""}`),
  ai: (body: { task_type: string; writing_mode: string; text: string; selected_text?: string; consent_my_voice?: boolean }) => request<{ content: string }>("/ai/generate", { method: "POST", body: JSON.stringify(body) }),
};
