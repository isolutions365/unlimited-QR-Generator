import { QRProject, ScanLog } from '../types';

export interface UserSession {
  id: string;
  email: string;
  name: string;
}

// REST Client Helper
class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('qr_jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = path.startsWith('/api') ? path : `/api${path}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication API
  async register(email: string, password: string, name: string): Promise<{ token: string; user: UserSession }> {
    const res = await this.request<{ token: string; user: UserSession }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.setItem('qr_jwt_token', res.token);
    return res;
  }

  async login(email: string, password: string): Promise<{ token: string; user: UserSession }> {
    const res = await this.request<{ token: string; user: UserSession }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('qr_jwt_token', res.token);
    return res;
  }

  async me(): Promise<UserSession | null> {
    const token = localStorage.getItem('qr_jwt_token');
    if (!token) return null;
    try {
      return await this.request<UserSession>('/auth/me');
    } catch (e) {
      // Token expired or invalid
      this.logout();
      return null;
    }
  }

  logout() {
    localStorage.removeItem('qr_jwt_token');
  }

  // Projects API
  async getProjects(): Promise<QRProject[]> {
    return this.request<QRProject[]>('/projects');
  }

  async saveProject(project: Partial<QRProject>): Promise<QRProject> {
    return this.request<QRProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Scans API
  async getScans(): Promise<ScanLog[]> {
    return this.request<ScanLog[]>('/scans');
  }

  async seedScanClick(projectId: string, trackingId: string): Promise<ScanLog> {
    return this.request<ScanLog>('/scans/seed', {
      method: 'POST',
      body: JSON.stringify({ projectId, trackingId }),
    });
  }

  async purgeScans(): Promise<void> {
    await this.request('/scans/purge', {
      method: 'DELETE',
    });
  }

  // --- PREMIUM AI CO-PILOT REST SERVICES ---
  async suggestColors(industry: string, promptVibe: string): Promise<{
    primaryColor: string;
    secondaryColor: string;
    bgColor: string;
    gradientType: 'none' | 'linear' | 'radial';
    gradientColor: string;
    description: string;
  }> {
    return this.request<{
      primaryColor: string;
      secondaryColor: string;
      bgColor: string;
      gradientType: 'none' | 'linear' | 'radial';
      gradientColor: string;
      description: string;
    }>('/ai/suggest-colors', {
      method: 'POST',
      body: JSON.stringify({ industry, promptVibe }),
    });
  }

  async suggestStyles(vibe: string): Promise<{
    dotStyle: 'square' | 'rounded' | 'dots' | 'classy';
    eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    logoScale: number;
    description: string;
  }> {
    return this.request<{
      dotStyle: 'square' | 'rounded' | 'dots' | 'classy';
      eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
      errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
      logoScale: number;
      description: string;
    }>('/ai/suggest-styles', {
      method: 'POST',
      body: JSON.stringify({ vibe }),
    });
  }

  async brandMatch(brandName: string, brandDescription: string): Promise<{
    primaryColor: string;
    gradientType: 'none' | 'linear' | 'radial';
    gradientColor: string;
    bgColor: string;
    dotStyle: 'square' | 'rounded' | 'dots' | 'classy';
    eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
    logoScale: number;
    explanation: string;
  }> {
    return this.request<{
      primaryColor: string;
      gradientType: 'none' | 'linear' | 'radial';
      gradientColor: string;
      bgColor: string;
      dotStyle: 'square' | 'rounded' | 'dots' | 'classy';
      eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
      logoScale: number;
      explanation: string;
    }>('/ai/brand-match', {
      method: 'POST',
      body: JSON.stringify({ brandName, brandDescription }),
    });
  }

  async getDesignRecommendations(qrContent: string, currentDesign: any): Promise<{
    recommendations: string[];
  }> {
    return this.request<{
      recommendations: string[];
    }>('/ai/design-recommendations', {
      method: 'POST',
      body: JSON.stringify({ qrContent, currentDesign }),
    });
  }

  async getLayoutOptimization(qrContent: string, currentDesign: any): Promise<{
    optimizedErrorCorrection: 'L' | 'M' | 'Q' | 'H';
    optimizedMargin: number;
    optimizedLogoScale: number;
    vibe: string;
  }> {
    return this.request<{
      optimizedErrorCorrection: 'L' | 'M' | 'Q' | 'H';
      optimizedMargin: number;
      optimizedLogoScale: number;
      vibe: string;
    }>('/ai/layout-optimize', {
      method: 'POST',
      body: JSON.stringify({ qrContent, currentDesign }),
    });
  }
}

export const api = new ApiClient();
