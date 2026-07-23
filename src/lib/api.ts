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
    const payload = { email, password: password ? '***' : '', name };
    const requestPath = '/auth/register';
    const resolvedUrl = requestPath.startsWith('/api') ? requestPath : `/api${requestPath}`;
    const currentHeaders = this.getHeaders() as Record<string, string>;
    const token = localStorage.getItem('qr_jwt_token');

    console.log('[api.signup Called]', {
      endpoint: requestPath,
      resolvedUrl,
      payload,
      authorizationHeader: currentHeaders['Authorization'] 
        ? `${currentHeaders['Authorization'].slice(0, 15)}...` 
        : 'None (Unauthenticated Signup Request)',
      hasExistingToken: Boolean(token),
      timestamp: new Date().toISOString()
    });

    try {
      const result = await this.register(email, password, name);
      console.log('[api.signup Success]', { resolvedUrl, user: result.user });
      return result;
    } catch (err: any) {
      console.error('[api.signup Failure]', {
        endpoint: requestPath,
        resolvedUrl,
        error: err.message || err,
      });
      throw err;
    }
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: UserSession }> {
    let res: { token: string; user: UserSession };
    const payload = { email, password: password ? '***' : '', name };
    const primaryPath = '/auth/register';
    const primaryUrl = primaryPath.startsWith('/api') ? primaryPath : `/api${primaryPath}`;
    const currentHeaders = this.getHeaders() as Record<string, string>;
    const existingToken = localStorage.getItem('qr_jwt_token');

    console.log('[api.register Attempting Primary Request]', {
      path: primaryPath,
      url: primaryUrl,
      payload,
      authorizationHeader: currentHeaders['Authorization'] 
        ? `${currentHeaders['Authorization'].slice(0, 15)}...` 
        : 'None (Standard Public Signup)',
      hasExistingToken: Boolean(existingToken)
    });

    try {
      res = await this.request<{ token: string; user: UserSession }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
    } catch (err: any) {
      console.warn('[api.register Primary Request Failed]', {
        path: primaryPath,
        url: primaryUrl,
        error: err.message
      });

      if (err.message && err.message.includes('404')) {
        const fallbackPath = '/signup';
        const fallbackUrl = `/api${fallbackPath}`;
        console.log('[api.register Attempting Fallback Request]', {
          path: fallbackPath,
          url: fallbackUrl,
          payload
        });

        res = await this.request<{ token: string; user: UserSession }>('/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password, name }),
        });
      } else {
        throw err;
      }
    }
    localStorage.setItem('qr_jwt_token', res.token);
    return res;
  }

  async login(email: string, password: string): Promise<{ token: string; user: UserSession }> {
    let res: { token: string; user: UserSession };
    try {
      res = await this.request<{ token: string; user: UserSession }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err: any) {
      if (err.message && err.message.includes('404')) {
        res = await this.request<{ token: string; user: UserSession }>('/signin', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      } else {
        throw err;
      }
    }
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
