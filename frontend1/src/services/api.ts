
import { toast } from "@/hooks/use-toast";

// Define base URL - should be configured based on environment
const API_BASE_URL = "http://localhost:8000"; // Empty string for relative URLs on same domain

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface FormField {
  field_id: string;
  field_type_id: number;
  label: string;
  required: boolean;
  options?: string[];
}

export interface FormCreate {
  title: string;
  description: string;
  field_config: FormField[];
}

export interface FormResponse {
  id: number;
  title: string;
  description: string;
  field_config: FormField[];
  creator_id: number;
  created_at: string;
}

export interface FieldType {
  id: number;
  name: string;
  description: string;
  has_options: boolean;
  created_at: string;
}

export interface ApplicationResponse {
  id: number;
  form_id: number;
  form_data: Record<string, any>;
  created_at: string;
  status?: string; // Added for UI display purposes
}

export interface ApplicationSubmit {
  form_data: string; // JSON stringified form data
  files?: File[];
}

// Helper functions
const getToken = () => localStorage.getItem("token");

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "An error occurred");
  }
  return response.json();
};

// API functions
export const api = {
  // Auth endpoints
  auth: {
    async login(credentials: LoginCredentials): Promise<TokenResponse> {
      const formData = new FormData();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);
      
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: "POST",
        body: formData,
      });
      
      return handleResponse(response);
    },

    async register(credentials: RegisterCredentials): Promise<any> {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      return handleResponse(response);
    },
  },

  // Forms endpoints
  forms: {
    async list(skip = 0, limit = 100): Promise<FormResponse[]> {
      const response = await fetch(`${API_BASE_URL}/forms/?skip=${skip}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      return handleResponse(response);
    },

    async get(formId: number): Promise<FormResponse> {
      const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      return handleResponse(response);
    },

    async create(form: FormCreate): Promise<FormResponse> {
      const response = await fetch(`${API_BASE_URL}/forms/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      
      return handleResponse(response);
    },

    async delete(formId: number): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete form");
      }
    },
  },

  // Field types endpoints
  fieldTypes: {
    async list(skip = 0, limit = 100): Promise<FieldType[]> {
      const response = await fetch(`${API_BASE_URL}/field-types/?skip=${skip}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      return handleResponse(response);
    },

    async get(fieldTypeId: number): Promise<FieldType> {
      const response = await fetch(`${API_BASE_URL}/field-types/${fieldTypeId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      return handleResponse(response);
    },
  },

  // Applications endpoints
  applications: {
    async listByForm(formId: number, skip = 0, limit = 100): Promise<ApplicationResponse[]> {
      const response = await fetch(`${API_BASE_URL}/applications/form/${formId}?skip=${skip}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      return handleResponse(response);
    },

    async get(applicationId: number): Promise<ApplicationResponse> {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      return handleResponse(response);
    },

    async delete(applicationId: number): Promise<ApplicationResponse> {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      return handleResponse(response);
    },

    async submit(formId: number, applicationData: ApplicationSubmit): Promise<ApplicationResponse> {
      const formData = new FormData();
      formData.append("form_data", applicationData.form_data);
      
      if (applicationData.files && applicationData.files.length > 0) {
        applicationData.files.forEach(file => {
          formData.append("files", file);
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/applications/submit/${formId}`, {
        method: "POST",
        body: formData,
      });
      
      return handleResponse(response);
    },

    async downloadFile(applicationId: number, fieldId: string): Promise<Blob> {
      const response = await fetch(
        `${API_BASE_URL}/applications/${applicationId}/download-file/${fieldId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to download file");
      }
      
      return response.blob();
    },

    // async downloadResume(applicationId: number): Promise<Blob> {
    //   const response = await fetch(
    //     `${API_BASE_URL}/applications/${applicationId}/download-resume`,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${getToken()}`,
    //       },
    //     }
    //   );
      
    //   if (!response.ok) {
    //     const errorData = await response.json().catch(() => ({}));
    //     throw new Error(errorData.detail || "Failed to download resume");
    //   }
      
    //   return response.blob();
    // },
  },
};

// Error handler utility
export const handleApiError = (error: any) => {
  console.error("API Error:", error);
  const message = error.message || "An unexpected error occurred";
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
  return null;
};
