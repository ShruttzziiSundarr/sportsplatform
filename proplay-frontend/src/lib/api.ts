const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Profile {
  id: string;
  full_name: string;
  sport: string;
  primary_position?: string;
  height_cm?: number;
  weight_kg?: number;
  visibility_score: number;
  scout_summary?: string;
  created_at?: string;
}

export interface MetricsRecord {
  id: string;
  profile_id: string;
  speed: number;
  strength: number;
  stamina: number;
  tactical: number;
  recorded_at?: string;
}

export interface CreateProfileBody {
  full_name: string;
  sport: string;
  primary_position?: string;
  height_cm?: number;
  weight_kg?: number;
}

export interface AddMetricsBody {
  speed: number;
  strength: number;
  stamina: number;
  tactical: number;
}

// ── Academy Types ──────────────────────────────────────────────────

export interface Academy {
  id: string;
  name: string;
  sport: string;
  description?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  fee_monthly?: number;
  max_capacity?: number;
  created_by?: string;
  created_at?: string;
}

export interface CreateAcademyBody {
  name: string;
  sport: string;
  description?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  fee_monthly?: number;
  max_capacity?: number;
  created_by?: string;
}

// ── Event Types ────────────────────────────────────────────────────

export interface SportEvent {
  id: string;
  title: string;
  sport: string;
  event_type: string;
  description?: string;
  location?: string;
  date: string;
  max_players: number;
  created_by?: string;
  created_at?: string;
}

export interface CreateEventBody {
  title: string;
  sport: string;
  event_type?: string;
  description?: string;
  location?: string;
  date: string;
  max_players?: number;
  created_by?: string;
}

// ── Messaging Types ────────────────────────────────────────────────

export interface Conversation {
  id: string;
  participant_a: string;
  participant_b: string;
  created_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: string;
  content: string;
  sent_at?: string;
}

export interface Thread {
  conversation: Conversation;
  messages: Message[];
}

// ── Blockchain Types ───────────────────────────────────────────────

export interface MintProofResult {
  transactionHash: string;
  metricHash: string;
  compositeScore: number;
  sport: string;
  profileId: string;
  timestamp: number;
  onChain: boolean;
  network: string;
}

// ── API Client ─────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export const api = {
  // Profiles
  getProfiles: () =>
    apiFetch<Profile[]>("/api/profiles"),

  getProfileById: (id: string) =>
    apiFetch<Profile>(`/api/profiles/${id}`),

  createProfile: (body: CreateProfileBody) =>
    apiFetch<Profile>("/api/profiles", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  addMetrics: (id: string, body: AddMetricsBody) =>
    apiFetch<MetricsRecord>(`/api/profiles/${id}/metrics`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Academies
  getAcademies: (sport?: string) =>
    apiFetch<Academy[]>(`/api/academies${sport ? `?sport=${sport}` : ""}`),

  getAcademyById: (id: string) =>
    apiFetch<Academy>(`/api/academies/${id}`),

  createAcademy: (body: CreateAcademyBody) =>
    apiFetch<Academy>("/api/academies", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Events
  getEvents: (sport?: string) =>
    apiFetch<SportEvent[]>(`/api/events${sport ? `?sport=${sport}` : ""}`),

  getEventById: (id: string) =>
    apiFetch<SportEvent>(`/api/events/${id}`),

  createEvent: (body: CreateEventBody) =>
    apiFetch<SportEvent>("/api/events", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Messaging
  getConversations: (participant: string) =>
    apiFetch<Conversation[]>(`/api/messages?participant=${participant}`),

  getThread: (conversationId: string) =>
    apiFetch<Thread>(`/api/messages/${conversationId}`),

  createConversation: (participant_a: string, participant_b: string) =>
    apiFetch<Conversation>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ participant_a, participant_b }),
    }),

  sendMessage: (conversationId: string, sender: string, content: string) =>
    apiFetch<Message>(`/api/messages/${conversationId}`, {
      method: "POST",
      body: JSON.stringify({ sender, content }),
    }),

  // Blockchain
  mintProof: (profileId: string) =>
    apiFetch<MintProofResult>(`/api/profiles/${profileId}/mint-proof`, {
      method: "POST",
    }),
};

