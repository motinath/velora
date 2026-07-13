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

  // Dashboard
  getDashboardStats: () => request("/dashboard/stats"),

  // Projects
  listProjects: () => request("/projects/"),
  createProject: (name: string, technology: string = "SKY130", designType: string = "Memory Cell", description: string = "") =>
    request("/projects/", {
      method: "POST",
      body: JSON.stringify({ name, technology, design_type: designType, description })
    }),
  getProject: (projectId: number) => request(`/projects/${projectId}`),
  updateProject: (projectId: number, updateData: { name?: string; technology?: string; design_type?: string; description?: string }) =>
    request(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(updateData)
    }),
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
  tuneDesign: (designId: number, components: Record<string, Record<string, number>>, vdd: number, optimization: string) =>
    request(`/designs/${designId}/tune`, {
      method: "POST",
      body: JSON.stringify({ components, vdd, optimization })
    }),
  listTopologies: () => request("/designs/topologies"),
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
  analyzeLog: (fileId: number) => request(`/analysis/log/analyze?file_id=${fileId}`, { method: "POST" }),

  // Version Rollbacks & Design Intents
  rollbackDesign: (projectId: number, version: number) =>
    request(`/designs/project/${projectId}/rollback/${version}`, { method: "POST" }),
  getDesignIntents: (designId: number) =>
    request(`/designs/${designId}/intents`),
  getVerificationChecks: (designId: number) =>
    request(`/verification/${designId}/checks`),
  getSimulationWaveforms: (designId: number) =>
    request(`/simulation/${designId}/waveforms`),

  // Plugins & EDA tool execution
  listPlugins: () => request("/plugins/"),
  executePluginCommand: (pluginName: string, command: string, args: any = {}) =>
    request(`/plugins/${pluginName}/execute`, {
      method: "POST",
      body: JSON.stringify({ command, args })
    }),

  // Collaboration & Comments
  shareProject: (projectId: number, email: string, role: string) =>
    request(`/projects/${projectId}/share`, {
      method: "POST",
      body: JSON.stringify({ email, role })
    }),
  getProjectPermissions: (projectId: number) => request(`/projects/${projectId}/permissions`),
  addProjectComment: (projectId: number, commentText: string) =>
    request(`/projects/${projectId}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment_text: commentText })
    }),
  getProjectComments: (projectId: number) => request(`/projects/${projectId}/comments`),

  // Library Manager
  listLibraryComponents: () => request("/library/components"),
  listPdkStatus: () => request("/library/pdk"),
  togglePdk: (pdkName: string, enabled: boolean) =>
    request("/library/pdk/toggle", {
      method: "POST",
      body: JSON.stringify({ pdk_name: pdkName, enabled })
    }),

  // Files CRUD Extensions
  renameFile: (fileId: number, newFilename: string) =>
    request(`/files/${fileId}/rename`, {
      method: "POST",
      body: JSON.stringify({ new_filename: newFilename })
    }),
  moveFile: (fileId: number, newProjectId: number) =>
    request(`/files/${fileId}/move`, {
      method: "POST",
      body: JSON.stringify({ new_project_id: newProjectId })
    }),
  downloadFileUrl: (fileId: number) => `${API_BASE}/files/${fileId}/download`,

  // Settings
  getSettingsConfig: () => request("/settings/config"),
  saveSettingsConfig: (config: any) =>
    request("/settings/config", {
      method: "POST",
      body: JSON.stringify(config)
    })
};
