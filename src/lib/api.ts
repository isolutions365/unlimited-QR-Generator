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
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = cleanPath.startsWith('/api/') || cleanPath === '/api' ? cleanPath : `/api${cleanPath}`;
    const headers = { ...this.getHeaders(), ...options.headers } as Record<string, string>;
    
    if (path.includes('signup') || path.includes('register') || path.includes('auth')) {
      console.log(`[ApiClient Request -> ${options.method || 'GET'} ${url}]`, {
        path,
        fullUrl: url,
        method: options.method || 'GET',
        headers: {
          'Content-Type': headers['Content-Type'],
          'Authorization': headers['Authorization'] 
            ? `${headers['Authorization'].slice(0, 15)}...` 
            : 'None (No Bearer Token Attached)'
        }
      });
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      throw new Error(`Server API offline: Target endpoint "${path}" returned HTML content instead of JSON. Please verify if the Express service processes are running.`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication API
  async signup(email: string, password: string, name: string): Promise<{ token: string; user: UserSession }> {
    return this.register(email, password, name);
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: UserSession }> {
    const candidateEndpoints = ['/auth/register', '/auth/signup', '/register', '/signup'];
    let lastError: Error | null = null;

    for (const endpoint of candidateEndpoints) {
      try {
        const res = await this.request<{ token: string; user: UserSession }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({ email, password, name }),
        });
        localStorage.setItem('qr_jwt_token', res.token);
        return res;
      } catch (err: any) {
        lastError = err;
        // If error is 404, try next endpoint in candidate list
        if (err.message && err.message.includes('404')) {
          console.warn(`[api.register] Endpoint ${endpoint} returned 404, trying fallback...`);
          continue;
        }
        // Non-404 errors (e.g. 400 Bad Request like invalid email/password) throw immediately
        throw err;
      }
    }

    throw lastError || new Error('Authentication failed. None of the register endpoints responded.');
  }

  async login(email: string, password: string): Promise<{ token: string; user: UserSession }> {
    const candidateEndpoints = ['/auth/login', '/auth/signin', '/login', '/signin'];
    let lastError: Error | null = null;

    for (const endpoint of candidateEndpoints) {
      try {
        const res = await this.request<{ token: string; user: UserSession }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem('qr_jwt_token', res.token);
        return res;
      } catch (err: any) {
        lastError = err;
        if (err.message && err.message.includes('404')) {
          console.warn(`[api.login] Endpoint ${endpoint} returned 404, trying fallback...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('Login failed. None of the authentication endpoints responded.');
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
  async suggestColors(industry: string, promptVibe: string, locale?: string): Promise<{
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
      body: JSON.stringify({ industry, promptVibe, locale }),
    });
  }

  async suggestStyles(vibe: string, locale?: string): Promise<{
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
      body: JSON.stringify({ vibe, locale }),
    });
  }

  async brandMatch(brandName: string, brandDescription: string, locale?: string): Promise<{
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
      body: JSON.stringify({ brandName, brandDescription, locale }),
    });
  }

  async getDesignRecommendations(qrContent: string, currentDesign: any, locale?: string): Promise<{
    recommendations: string[];
  }> {
    return this.request<{
      recommendations: string[];
    }>('/ai/design-recommendations', {
      method: 'POST',
      body: JSON.stringify({ qrContent, currentDesign, locale }),
    });
  }

  async getLayoutOptimization(qrContent: string, currentDesign: any, locale?: string): Promise<{
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
      body: JSON.stringify({ qrContent, currentDesign, locale }),
    });
  }

  // --- SAAS GROWTH SUITE SERVICES ---
  async getUserProfile(refCode?: string): Promise<any> {
    const url = refCode ? `/user/profile?refCode=${encodeURIComponent(refCode)}` : '/user/profile';
    return this.request<any>(url);
  }

  async updateUserProfile(profile: any): Promise<any> {
    return this.request<any>('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async getUserReferrals(): Promise<{
    referralCode: string;
    clicks: number;
    signups: number;
    rewardTier: string;
    unlockedFeatures: string[];
  }> {
    return this.request<any>('/user/referrals');
  }

  async trackReferralClick(code: string): Promise<any> {
    return this.request<any>('/referral/click', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getCommunityPosts(): Promise<any[]> {
    return this.request<any[]>('/community/posts');
  }

  async createCommunityPost(post: { title: string; content: string; category: string }): Promise<any> {
    return this.request<any>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async upvoteCommunityPost(id: string): Promise<any> {
    return this.request<any>(`/community/posts/${id}/upvote`, {
      method: 'POST',
    });
  }

  async commentCommunityPost(id: string, content: string): Promise<any> {
    return this.request<any>(`/community/posts/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getRoadmapItems(): Promise<any[]> {
    return this.request<any[]>('/roadmap/items');
  }

  async subscribeNewsletter(email: string, preferences?: string[]): Promise<any> {
    return this.request<any>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, preferences }),
    });
  }

  async submitFeedback(feedback: { type: 'bug' | 'compliment' | 'suggestion'; satisfaction: number; text: string; email?: string; userId?: string }): Promise<any> {
    return this.request<any>('/feedback/submit', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async getNotifications(): Promise<any[]> {
    return this.request<any[]>('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<any> {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
