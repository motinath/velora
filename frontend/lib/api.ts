const API_BASE = "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
  tokenRequired?: boolean;
}

async function request(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers || {});
  
  if (options.tokenRequired !== false) {
    const token = localStorage.getItem("velora_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Do not set Content-Type if uploading files (browser does this automatically with boundaries)
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch {
      parsedErr = { detail: errText || "Request failed" };
    }
    throw new Error(parsedErr.detail || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  register: (email: string, password: string) => 
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      tokenRequired: false
    }),

  login: async (email: string, password: string) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      tokenRequired: false
    });
    if (data.access_token) {
      localStorage.setItem("velora_token", data.access_token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem("velora_token");
  },

  isLoggedIn: () => {
    return !!localStorage.getItem("velora_token");
  },

  // Projects
  listProjects: () => request("/projects/"),
  createProject: (name: string, technology: string = "SKY130", designType: string = "Memory Cell", description: string = "") => 
    request("/projects/", {
      method: "POST",
      body: JSON.stringify({ name, technology, design_type: designType, description })
    }),
  getProject: (projectId: number) => request(`/projects/${projectId}`),
  deleteProject: (projectId: number) => 
    request(`/projects/${projectId}`, {
      method: "DELETE"
    }),

  // Designs
  generateDesign: (projectId: number, prompt: string) =>
    request(`/designs/project/${projectId}/generate`, {
      method: "POST",
      body: JSON.stringify({ prompt })
    }),
  getDesignHistory: (projectId: number) => request(`/designs/project/${projectId}/history`),
  getDesignDetail: (designId: number) => request(`/designs/${designId}`),

  // Files
  uploadFile: (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append("project_id", projectId.toString());
    formData.append("file", file);
    return request("/files/upload", {
      method: "POST",
      body: formData
    });
  },
  listFiles: (projectId: number) => request(`/files/project/${projectId}`),
  deleteFile: (fileId: number) => 
    request(`/files/${fileId}`, {
      method: "DELETE"
    }),

  // Chat
  listSessions: (projectId: number) => request(`/chat/sessions/project/${projectId}`),
  createSession: (projectId: number, name: string) => 
    request("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, name })
    }),
  getSession: (sessionId: number) => request(`/chat/sessions/${sessionId}`),
  sendMessage: (sessionId: number, content: string, contextMetadata?: any) => 
    request(`/chat/sessions/${sessionId}/message`, {
      method: "POST",
      body: JSON.stringify({ content, context_metadata: contextMetadata })
    }),

  // Direct Analysis
  explainRtl: (fileId: number) => request(`/analysis/rtl/explain?file_id=${fileId}`, { method: "POST" }),
  analyzeReport: (fileId: number) => request(`/analysis/report/analyze?file_id=${fileId}`, { method: "POST" }),
  analyzeLog: (fileId: number) => request(`/analysis/log/analyze?file_id=${fileId}`, { method: "POST" })
};
