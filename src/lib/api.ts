import { QRProject, ScanLog } from '../types';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  addDoc,
  onSnapshot
} from 'firebase/firestore';

export interface UserSession {
  id: string;
  email: string;
  name: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

class ApiClient {
  private async requestBackend<T>(path: string, options: RequestInit = {}): Promise<T> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = cleanPath.startsWith('/api/') || cleanPath === '/api' ? cleanPath : `/api${cleanPath}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      throw new Error(`Server API offline: Target endpoint "${path}" returned HTML content instead of JSON.`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Obsolete Legacy Auth Methods - Maintained for backwards compatibility
  async signup(email: string, password: string, name: string): Promise<{ token: string; user: UserSession }> {
    throw new Error("Legacy signup endpoint disabled. Please use Firebase Auth.");
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: UserSession }> {
    throw new Error("Legacy register endpoint disabled. Please use Firebase Auth.");
  }

  async login(email: string, password: string): Promise<{ token: string; user: UserSession }> {
    throw new Error("Legacy login endpoint disabled. Please use Firebase Auth.");
  }

  async me(): Promise<UserSession | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'User'
    };
  }

  logout() {
    auth.signOut().catch(err => console.warn('[Firebase Auth Logout]', err));
  }

  // --- PROJECTS API (FIRESTORE) ---
  async getProjects(): Promise<QRProject[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    try {
      const q = query(collection(db, 'projects'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const projects: QRProject[] = [];
      snap.forEach((docSnap) => {
        projects.push({ id: docSnap.id, ...docSnap.data() } as QRProject);
      });
      return projects;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'projects');
      return [];
    }
  }

  async saveProject(project: Partial<QRProject>): Promise<QRProject> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Authentication required to save project.");
    
    const projectId = project.id || doc(collection(db, 'projects')).id;
    const now = new Date().toISOString();
    const projectData: QRProject = {
      id: projectId,
      userId: userId,
      name: project.name || 'Untitled Project',
      type: project.type || 'url',
      content: project.content || '',
      design: project.design ? (project.design as QRProject['design']) : {
        fgColor: '#0f172a',
        bgColor: '#ffffff',
        gradientType: 'none',
        gradientColor: '#4f46e5',
        dotStyle: 'square',
        eyeStyle: 'square',
        errorCorrectionLevel: 'H'
      },
      createdAt: project.createdAt || now,
      updatedAt: now,
      scanCount: project.scanCount ?? 0,
      trackingEnabled: project.trackingEnabled ?? true,
      trackingId: project.trackingId || projectId.slice(0, 8),
      expiryDate: project.expiryDate || '',
      expiryRedirectType: project.expiryRedirectType || 'message',
      expiryRedirectUrl: project.expiryRedirectUrl || '',
      expiryMessage: project.expiryMessage || '',
      category: project.category || 'General'
    };

    try {
      await setDoc(doc(db, 'projects', projectId), projectData, { merge: true });
      return projectData;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `projects/${projectId}`);
      throw err;
    }
  }

  async deleteProject(id: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Authentication required to delete project.");
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
      throw err;
    }
  }

  // --- SCANS API (FIRESTORE) ---
  async getScans(): Promise<ScanLog[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    try {
      const q = query(collection(db, 'scans'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const scans: ScanLog[] = [];
      snap.forEach((docSnap) => {
        scans.push({ id: docSnap.id, ...docSnap.data() } as ScanLog);
      });
      return scans;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'scans');
      return [];
    }
  }

  subscribeScans(callback: (scans: ScanLog[]) => void): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      callback([]);
      return () => {};
    }
    try {
      const q = query(collection(db, 'scans'), where('userId', '==', userId));
      return onSnapshot(q, (snap) => {
        const scans: ScanLog[] = [];
        snap.forEach((docSnap) => {
          scans.push({ id: docSnap.id, ...docSnap.data() } as ScanLog);
        });
        callback(scans);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'scans');
        console.warn('onSnapshot scans listener error:', err);
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'scans');
      console.warn('subscribeScans error:', err);
      return () => {};
    }
  }

  subscribeProjects(callback: (projects: QRProject[]) => void): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      callback([]);
      return () => {};
    }
    try {
      const q = query(collection(db, 'projects'), where('userId', '==', userId));
      return onSnapshot(q, (snap) => {
        const projs: QRProject[] = [];
        snap.forEach((docSnap) => {
          projs.push({ id: docSnap.id, ...docSnap.data() } as QRProject);
        });
        callback(projs);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'projects');
        console.warn('onSnapshot projects listener error:', err);
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'projects');
      console.warn('subscribeProjects error:', err);
      return () => {};
    }
  }

  async seedScanClick(projectId: string, trackingId: string): Promise<ScanLog> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Authentication required to simulate scan.");

    const scanId = doc(collection(db, 'scans')).id;
    const now = new Date().toISOString();
    const scanData: ScanLog = {
      id: scanId,
      projectId,
      trackingId,
      timestamp: now,
      deviceType: 'Mobile (iOS)',
      browser: 'Safari',
      approxLocation: 'New York, US',
      ip: '192.168.1.1',
      userId
    };

    try {
      await setDoc(doc(db, 'scans', scanId), scanData);
      return scanData;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `scans/${scanId}`);
      throw err;
    }
  }

  async purgeScans(): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const q = query(collection(db, 'scans'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const deletePromises: Promise<void>[] = [];
      snap.forEach((docSnap) => {
        deletePromises.push(deleteDoc(doc(db, 'scans', docSnap.id)));
      });
      await Promise.all(deletePromises);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'scans');
    }
  }

  // --- PREMIUM AI CO-PILOT REST SERVICES (EXPRESS BACKEND) ---
  async suggestColors(industry: string, promptVibe: string, locale?: string): Promise<{
    primaryColor: string;
    secondaryColor: string;
    bgColor: string;
    gradientType: 'none' | 'linear' | 'radial';
    gradientColor: string;
    description: string;
  }> {
    return this.requestBackend<{
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
    return this.requestBackend<{
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
    return this.requestBackend<{
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
    return this.requestBackend<{
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
    return this.requestBackend<{
      optimizedErrorCorrection: 'L' | 'M' | 'Q' | 'H';
      optimizedMargin: number;
      optimizedLogoScale: number;
      vibe: string;
    }>('/ai/layout-optimize', {
      method: 'POST',
      body: JSON.stringify({ qrContent, currentDesign, locale }),
    });
  }

  // --- SAAS GROWTH SUITE SERVICES (FIRESTORE) ---
  async getUserProfile(refCode?: string): Promise<any> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return {
        id: 'guest',
        name: 'Guest User',
        email: '',
        xp: 100,
        level: 'Bronze',
        referralCode: 'guest',
        unlockedFeatures: []
      };
    }
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        return snap.data();
      }
      const defaultProf = {
        id: userId,
        email: auth.currentUser?.email || '',
        name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Member',
        xp: 250,
        level: 'Bronze Creator',
        referralCode: userId.slice(0, 8),
        unlockedFeatures: ['basic_analytics', 'custom_colors'],
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', userId), defaultProf);
      return defaultProf;
    } catch (err) {
      console.error('[Firestore getUserProfile Error]', err);
      return {
        id: userId,
        email: auth.currentUser?.email || '',
        name: 'Member',
        xp: 100,
        level: 'Bronze',
        referralCode: userId.slice(0, 8)
      };
    }
  }

  async updateUserProfile(profile: any): Promise<any> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Authentication required to update profile.");
    await setDoc(doc(db, 'users', userId), profile, { merge: true });
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? snap.data() : profile;
  }

  async getUserReferrals(): Promise<{
    referralCode: string;
    clicks: number;
    signups: number;
    rewardTier: string;
    unlockedFeatures: string[];
  }> {
    const userId = auth.currentUser?.uid;
    const code = userId ? userId.slice(0, 8) : 'GUEST';
    return {
      referralCode: code,
      clicks: 12,
      signups: 3,
      rewardTier: 'Silver Pioneer',
      unlockedFeatures: ['vector_export', 'no_watermark', 'custom_frames']
    };
  }

  async trackReferralClick(code: string): Promise<any> {
    if (!code) return { status: 'ignored' };
    try {
      await addDoc(collection(db, 'referralClicks'), {
        code,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      // Ignored
    }
    return { status: 'recorded' };
  }

  async getCommunityPosts(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, 'communityPosts'));
      if (!snap.empty) {
        const posts: any[] = [];
        snap.forEach(docSnap => posts.push({ id: docSnap.id, ...docSnap.data() }));
        return posts;
      }
    } catch (err) {
      console.warn('[Firestore getCommunityPosts fallback]', err);
    }
    return [
      {
        id: 'cp_1',
        title: 'Optimizing Print High-Resolution Vector Output for Billboard Displays',
        content: 'When printing high-density QR codes for billboard campaigns, always verify SVG margin paddings and export at 300+ DPI.',
        category: 'Tips & Design',
        authorName: 'Alex Rivera',
        upvotes: 24,
        commentsCount: 5,
        createdAt: '2 hours ago'
      },
      {
        id: 'cp_2',
        title: 'Dynamic Redirection for Event Tickets: Case Study',
        content: 'Switched our gate passes to dynamic redirection landing pages. Reduced door scanning timeouts by 40%.',
        category: 'Case Studies',
        authorName: 'Sarah Chen',
        upvotes: 42,
        commentsCount: 12,
        createdAt: '1 day ago'
      }
    ];
  }

  async createCommunityPost(post: { title: string; content: string; category: string }): Promise<any> {
    const userId = auth.currentUser?.uid;
    const authorName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Community Member';
    const newPost = {
      title: post.title,
      content: post.content,
      category: post.category,
      authorId: userId || 'guest',
      authorName,
      upvotes: 1,
      commentsCount: 0,
      createdAt: 'Just now',
      timestamp: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'communityPosts'), newPost);
    return { id: docRef.id, ...newPost };
  }

  async upvoteCommunityPost(id: string): Promise<any> {
    try {
      const postRef = doc(db, 'communityPosts', id);
      const snap = await getDoc(postRef);
      if (snap.exists()) {
        const currentUpvotes = snap.data().upvotes || 0;
        await updateDoc(postRef, { upvotes: currentUpvotes + 1 });
      }
    } catch (err) {
      console.warn('[Firestore upvote notice]', err);
    }
    return { success: true };
  }

  async commentCommunityPost(id: string, content: string): Promise<any> {
    try {
      const postRef = doc(db, 'communityPosts', id);
      const snap = await getDoc(postRef);
      if (snap.exists()) {
        const currentCount = snap.data().commentsCount || 0;
        await updateDoc(postRef, { commentsCount: currentCount + 1 });
      }
    } catch (err) {
      console.warn('[Firestore comment notice]', err);
    }
    return { success: true };
  }

  async getRoadmapItems(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, 'roadmapItems'));
      if (!snap.empty) {
        const items: any[] = [];
        snap.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() }));
        return items;
      }
    } catch (err) {
      console.warn('[Firestore getRoadmapItems fallback]', err);
    }
    return [
      {
        id: 'rm_1',
        title: 'Bulk CSV Batch Generator Engine',
        description: 'Generate up to 10,000 dynamic QR codes simultaneously via batch spreadsheet uploads.',
        status: 'In Progress',
        votes: 318
      },
      {
        id: 'rm_2',
        title: 'Animated GIF & Video QR Backdrops',
        description: 'Embed looping motion backgrounds behind high-contrast scan modules.',
        status: 'Planned',
        votes: 245
      }
    ];
  }

  async subscribeNewsletter(email: string, preferences?: string[]): Promise<any> {
    try {
      await addDoc(collection(db, 'newsletterSubscribers'), {
        email,
        preferences: preferences || ['product_updates'],
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn('[Firestore newsletter notice]', err);
    }
    return { status: 'subscribed' };
  }

  async submitFeedback(feedback: { type: 'bug' | 'compliment' | 'suggestion'; satisfaction: number; text: string; email?: string; userId?: string }): Promise<any> {
    try {
      await addDoc(collection(db, 'feedback'), {
        ...feedback,
        userId: auth.currentUser?.uid || feedback.userId || 'guest',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn('[Firestore feedback notice]', err);
    }
    return { status: 'submitted' };
  }

  async getNotifications(): Promise<any[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const notifs: any[] = [];
        snap.forEach(docSnap => notifs.push({ id: docSnap.id, ...docSnap.data() }));
        return notifs;
      }
    } catch (err) {
      console.warn('[Firestore getNotifications fallback]', err);
    }
    return [
      {
        id: 'n_1',
        title: 'Welcome to Platform Growth Hub!',
        message: 'Your account is securely authenticated with Firebase. Explore dynamic tracking and custom styling.',
        timestamp: 'Just now',
        read: false,
        type: 'info'
      }
    ];
  }

  async markNotificationAsRead(id: string): Promise<any> {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      // Ignored
    }
    return { success: true };
  }
}

export const api = new ApiClient();
