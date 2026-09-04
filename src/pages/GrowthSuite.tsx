import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/i18n';
import { getProductionBaseUrl } from '../config/siteConfig';
import { auth, db } from '../lib/firebase';
import { updatePassword, deleteUser, updateProfile } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Award, Star, Share2, Copy, Check, Users, MessageSquare, ThumbsUp, 
  Calendar, Lightbulb, ChevronRight, Send, Zap, AlertCircle, 
  ArrowUpRight, TrendingUp, Filter, Search, ShieldCheck, Mail, Heart, 
  RefreshCw, Layers, Sliders, Play, Trash2, CheckCircle2, ChevronDown, Bell, Key, ShieldAlert, Home
} from 'lucide-react';
import { api } from '../lib/api';

interface GrowthSuiteProps {
  view: string;
  onNavigate: (path: string) => void;
  locale: string;
  user: any;
  onSignInClick: () => void;
}

export default function GrowthSuite({
   view: initialView, onNavigate, locale, user, onSignInClick }: GrowthSuiteProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>(initialView || 'profile');
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('');
  const [avatarInput, setAvatarInput] = useState<string>('');
  const [bioInput, setBioInput] = useState<string>('');
  const [companyInput, setCompanyInput] = useState<string>('');
  const [linkedinInput, setLinkedinInput] = useState<string>('');
  const [twitterInput, setTwitterInput] = useState<string>('');
  const [githubInput, setGithubInput] = useState<string>('');
  const [defaultQrType, setDefaultQrType] = useState<string>('url');
  const [defaultFgColor, setDefaultFgColor] = useState<string>('#0f172a');
  const [defaultBgColor, setDefaultBgColor] = useState<string>('#ffffff');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

  // Community creation
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostCategory, setNewPostCategory] = useState<string>('feature');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Referral state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);
  const [newsletterLoading, setNewsletterLoading] = useState<boolean>(false);

  // Feedback state
  const [feedbackType, setFeedbackType] = useState<'bug' | 'compliment' | 'suggestion'>('suggestion');
  const [feedbackSatisfaction, setFeedbackSatisfaction] = useState<number>(9);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  // Notification states
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);

  // Sync tab with route path
  useEffect(() => {
    if (initialView) {
      setActiveTab(initialView);
    }
  }, [initialView]);

  // Load SaaS Suite Data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if referrer code is inside URL query string
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        // Track referral click
        await api.trackReferralClick(refCode).catch(e => console.warn(e));
        // Save refer code in localstorage for registration tracking
        localStorage.setItem('qr_referrer_code', refCode);
      }

      const activeRefCode = localStorage.getItem('qr_referrer_code') || undefined;

      if (user) {
        // Fetch User Profile
        const profData = await api.getUserProfile(activeRefCode);
        setProfile(profData);
        setNameInput(profData.name || user?.name || '');
        setAvatarInput(profData.avatar || profData.photoURL || '');
        setBioInput(profData.bio || '');
        setCompanyInput(profData.company || '');
        setLinkedinInput(profData.linkedin || '');
        setTwitterInput(profData.twitter || '');
        setGithubInput(profData.github || '');
        setDefaultQrType(profData.defaultQrType || 'url');
        setDefaultFgColor(profData.defaultFgColor || '#0f172a');
        setDefaultBgColor(profData.defaultBgColor || '#ffffff');

        // Clear local storage reference after consumption
        if (activeRefCode) {
          localStorage.removeItem('qr_referrer_code');
        }

        // Fetch Referrals metrics
        const refData = await api.getUserReferrals();
        setReferrals(refData);

        // Fetch Notifications
        const notifs = await api.getNotifications();
        setNotifications(notifs);
      }

      // Fetch Public Community & Roadmap
      const communityPosts = await api.getCommunityPosts();
      setPosts(communityPosts);

      const roadmapData = await api.getRoadmapItems();
      setRoadmap(roadmapData);

    } catch (err: any) {
      console.error(err);
      setError(t('growth.dbSyncError', 'Failed to securely synchronize platform databases. Please verify your connection.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: nameInput,
          photoURL: avatarInput || null
        }).catch(err => console.warn('[Auth Profile Update Note]', err));
      }

      const updated = await api.updateUserProfile({
        name: nameInput,
        avatar: avatarInput,
        bio: bioInput,
        company: companyInput,
        linkedin: linkedinInput,
        twitter: twitterInput,
        github: githubInput,
        defaultQrType,
        defaultFgColor,
        defaultBgColor
      });
      setProfile(updated);
      setEditingProfile(false);
      // Reload profile & notifications for updated XP levels
      await loadData();
    } catch (err: any) {
      setError(err.message || t('growth.updateProfileError', 'Error updating profile details.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newPasswordInput) return;
    try {
      setLoading(true);
      setError(null);
      setPasswordSuccess(null);
      await updatePassword(auth.currentUser, newPasswordInput);
      setPasswordSuccess(t('growth.passwordSuccess', 'Password updated successfully!'));
      setNewPasswordInput('');
    } catch (err: any) {
      setError(err.message || t('growth.passwordError', 'Error updating password. Please re-authenticate if required.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    try {
      setLoading(true);
      const uid = auth.currentUser.uid;
      await deleteDoc(doc(db, 'users', uid));
      await deleteUser(auth.currentUser);
      onNavigate('/');
    } catch (err: any) {
      setError(err.message || t('growth.deleteAccountError', 'Error deleting account. Please re-authenticate before deleting account.'));
      setLoading(false);
      setDeleteConfirm(false);
    }
  };

  // Handle Community Post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignInClick();
      return;
    }
    if (!((val) => (val || '').trim())(newPostTitle) || !((val) => (val || '').trim())(newPostContent)) return;

    try {
      setLoading(true);
      await api.createCommunityPost({
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory
      });
      setNewPostTitle('');
      setNewPostContent('');
      await loadData();
    } catch (err: any) {
      setError(err.message || t('growth.publishPostError', 'Error publishing post.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Upvoting
  const handleUpvote = async (postId: string) => {
    if (!user) {
      onSignInClick();
      return;
    }
    try {
      await api.upvoteCommunityPost(postId);
      await loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle Commenting
  const handleComment = async (postId: string) => {
    if (!user) {
      onSignInClick();
      return;
    }
    const content = commentInputs[postId];
    if (!content || !((val) => (val || '').trim())(content)) return;

    try {
      await api.commentCommunityPost(postId, content);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      await loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle Newsletter Subscribe
  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!((val) => (val || '').trim())(newsletterEmail)) return;
    try {
      setNewsletterLoading(true);
      await api.subscribeNewsletter(newsletterEmail);
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      if (user) {
        // Trigger profile refresh to register newsletter XP
        await loadData();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Handle Feedback Submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!((val) => (val || '').trim())(feedbackText)) return;
    try {
      setLoading(true);
      await api.submitFeedback({
        type: feedbackType,
        satisfaction: feedbackSatisfaction,
        text: feedbackText,
        email: user?.email || undefined,
        userId: user?.id || undefined
      });
      setFeedbackSuccess(true);
      setFeedbackText('');
      await loadData();
    } catch (err: any) {
      setError(err.message || t('growth.submitFeedbackError', 'Failed to submit feedback.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Mark Notification Read
  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const copyReferralLink = () => {
    if (!profile) return;
    const link = `${getProductionBaseUrl()}/?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filtered Community Posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4 relative">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white py-2.5 px-4 rounded-xl border border-slate-100 shadow-2xs">
        <button 
          onClick={() => onNavigate('/')} 
          className="hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t('common.home', 'Home')}</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-800 font-bold">{t('growth.suiteTitle', 'Growth Suite')}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* SaaS Dashboard Inside Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span className="text-sm font-black uppercase tracking-wider font-mono text-slate-800">{t('growth.suiteTitle', 'Growth Suite')}</span>
          </div>
          {user && (
            <button 
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="relative p-2 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
              title={t('growth.activityCenterTitle', 'Activity Center')}
            >
              <Bell className="w-4.5 h-4.5 text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-bounce" />
              )}
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { id: 'profile', label: t('growth.tabProfile', 'User Profile & XP'), icon: User },
            { id: 'community', label: t('growth.tabCommunity', 'Community Hub'), icon: Users },
            { id: 'roadmap', label: t('growth.tabRoadmap', 'Public Roadmap'), icon: Lightbulb },
            { id: 'testimonials', label: t('growth.tabTestimonials', 'Case Studies'), icon: Layers },
            { id: 'release-notes', label: t('growth.tabReleaseNotes', 'Release Notes'), icon: Calendar },
            { id: 'feedback', label: t('growth.tabFeedback', 'Feedback Center'), icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onNavigate(`/${tab.id}`);
                }}
                className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-0'}`} />
              </button>
            );
          })}
        </nav>

        {/* Dynamic Gamification Widget in Sidebar */}
        {user && profile && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 font-mono">{t('growth.levelCount', 'LEVEL {{level}}', { level: profile.level })}</span>
                <span className="text-[10px] font-bold text-indigo-600 font-mono">{t('growth.xpCount', '{{xp}} XP', { xp: profile.xp })}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (profile.xp % 100))}%` }} 
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {profile.badges?.map((badge: string) => (
                  <span 
                    key={badge} 
                    className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full font-mono"
                    title={t('growth.unlockedBadge', 'Unlocked Badge: {{badge}}', { badge: t('growth.badge.' + badge, badge) })}
                  >
                    <Award className="w-2.5 h-2.5" />
                    {t('growth.badge.' + badge, badge)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Primary Dashboard Content Area */}
      <main className="flex-1 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden min-h-[580px] relative">
        
        {/* Live Notification Center Overlay Panel */}
        <AnimatePresence>
          {showNotificationCenter && user && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-14 left-4 right-4 bg-slate-900 text-white rounded-xl p-4 shadow-2xl border border-slate-800 z-50 max-h-[350px] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <span className="text-xs font-black font-mono tracking-widest text-indigo-400">{t('growth.activityAlertsCount', 'ACTIVITY ALERTS ({{count}} UNREAD)', { count: unreadCount })}</span>
                <button 
                  onClick={() => setShowNotificationCenter(false)}
                  className="text-[10px] uppercase font-bold tracking-wider hover:text-indigo-400 font-mono"
                >
                  {t('growth.close', 'Close')}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-6">{t('growth.noSystemAlerts', 'No new system alerts.')}</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.read && handleMarkRead(notif.id)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                        notif.read 
                          ? 'bg-slate-950/40 border-slate-800/80 text-slate-400' 
                          : 'bg-slate-800/60 border-indigo-900/40 text-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-extrabold text-xs tracking-tight">{t(notif.title, notif.title)}</span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-300">{t(notif.message, notif.message)}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-3xs flex items-center justify-center z-40">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-xs font-mono font-bold text-slate-500">{t('growth.securingStates', 'Securing dynamic environment states...')}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="m-4 bg-red-50 border border-red-200/80 p-3 rounded-xl flex items-center gap-3 text-red-700 text-xs font-bold animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. PROFILE VIEW */}
        {activeTab === 'profile' && (
          <div className="p-6 md:p-8">
            {!user ? (
              <div className="text-center py-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black uppercase text-slate-800 tracking-tight">{t('growth.profileHeader', 'Enterprise User Profiles')}</h3>
                <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
                  {t('growth.profileDesc', 'Join FreeQRBarcodes Pro! Connect your secure cloud account to establish custom defaults, unlock real-world gamification XP, collect verified designer badges, and earn referral commissions.')}
                </p>
                <button
                  onClick={onSignInClick}
                  className="py-3 px-6 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  {t('growth.connectAccount', 'Connect Account Now')}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold font-mono shadow-md">
                      {profile?.name?.substring(0, 2).toUpperCase() || t('growth.qrPlaceholder', 'QR')}
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{profile?.name}</h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{profile?.email}</p>
                      <p className="text-xs text-slate-600 italic mt-1">"{t(profile?.bio, profile?.bio)}"</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="py-2 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    {editingProfile ? t('growth.cancelEdit', 'Cancel Edit') : t('growth.editProfile', 'Edit Profile & Defaults')}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {editingProfile ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleUpdateProfile} 
                      className="space-y-4 text-left border border-indigo-50 bg-indigo-50/10 p-5 rounded-2xl mb-8"
                    >
                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 font-mono border-b border-indigo-100/50 pb-2 mb-3">{t('growth.updateIdentityTitle', 'Update Identity & Workspace Defaults')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.fullName', 'Full Name')}</label>
                          <input 
                            type="text" 
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none bg-white font-sans font-bold text-slate-800"
                            placeholder={t('growth.namePlaceholder', 'e.g. Muhammad Mubeen')}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.avatarUrl', 'Profile Picture (Avatar URL)')}</label>
                          <input 
                            type="text" 
                            value={avatarInput}
                            onChange={(e) => setAvatarInput(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none bg-white font-sans font-mono text-slate-600"
                            placeholder={t('growth.avatarPlaceholder', 'https://example.com/avatar.jpg')}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.professionalBio', 'Professional Bio')}</label>
                          <input 
                            type="text" 
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none bg-white font-sans"
                            placeholder={t('growth.bioPlaceholder', 'e.g. Lead Digital Marketer')}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.company', 'Company / Organization')}</label>
                          <input 
                            type="text" 
                            value={companyInput}
                            onChange={(e) => setCompanyInput(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none bg-white font-sans"
                            placeholder={t('growth.companyPlaceholder', 'e.g. FreeQRBarcodes Tech')}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.linkedin', 'LinkedIn Profile (URL)')}</label>
                          <input 
                            type="text" 
                            value={linkedinInput}
                            onChange={(e) => setLinkedinInput(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none bg-white font-sans"
                            placeholder={t('growth.linkedinPlaceholder', 'e.g. linkedin.com/in/username')}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.twitter', 'Twitter / X Handle')}</label>
                          <input 
                            type="text" 
                            value={twitterInput}
                            onChange={(e) => setTwitterInput(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none bg-white font-sans"
                            placeholder={t('growth.twitterPlaceholder', 'e.g. @username')}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.github', 'GitHub Profile')}</label>
                          <input 
                            type="text" 
                            value={githubInput}
                            onChange={(e) => setGithubInput(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none bg-white font-sans"
                            placeholder={t('growth.githubPlaceholder', 'e.g. github.com/username')}
                          />
                        </div>
                      </div>

                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 font-mono border-b border-indigo-100/50 pt-3 pb-2 mb-3">{t('growth.qrPresetsTitle', 'Preferred QR Designer Presets')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.defaultQrType', 'Default QR Type')}</label>
                          <select 
                            value={defaultQrType}
                            onChange={(e) => setDefaultQrType(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-indigo-500 font-sans"
                          >
                            <option value="url">{t('growth.qrTypeUrl', 'URL Destination')}</option>
                            <option value="text">{t('growth.qrTypeText', 'Raw Text Code')}</option>
                            <option value="email">{t('growth.qrTypeEmail', 'Direct Email Package')}</option>
                            <option value="wifi">{t('growth.qrTypeWifi', 'Secure Wifi Network')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.defaultFgColor', 'Default Modules Color')}</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={defaultFgColor}
                              onChange={(e) => setDefaultFgColor(e.target.value)}
                              className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                            />
                            <input 
                              type="text"
                              value={defaultFgColor}
                              onChange={(e) => setDefaultFgColor(e.target.value)}
                              className="flex-1 text-xs border border-slate-200 rounded-xl p-2 focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.defaultBgColor', 'Default Background Color')}</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={defaultBgColor}
                              onChange={(e) => setDefaultBgColor(e.target.value)}
                              className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                            />
                            <input 
                              type="text"
                              value={defaultBgColor}
                              onChange={(e) => setDefaultBgColor(e.target.value)}
                              className="flex-1 text-xs border border-slate-200 rounded-xl p-2 focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button 
                          type="button" 
                          onClick={() => setEditingProfile(false)}
                          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          {t('growth.cancel', 'Cancel')}
                        </button>
                        <button 
                          type="submit" 
                          className="py-2.5 px-5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl transition-colors shadow-sm"
                        >
                          {t('growth.saveProfileDetails', 'Save Profiles Details (+15 XP)')}
                        </button>
                      </div>
                    </motion.form>
                  ) : null}
                </AnimatePresence>

                {/* Referral Platform Dashboard Integration inside Profile */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-left">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">{t('growth.referralsHubTitle', 'Referrals & Affiliates Hub')}</h3>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 py-1 px-3 border border-emerald-100 rounded-full font-bold font-mono uppercase">
                      {t('growth.referralTier', 'Tier: {{tier}}', { tier: referrals?.rewardTier || t('growth.referralTierFallback', 'Pioneer') })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    {t('growth.referralsDesc', 'Invite colleagues, developers, and designers to FreeQRBarcodes.com! Share your unique referral link to unlock enterprise designer features, high-resolution vector exports, and advanced brand styling matrices.')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-150 text-center">
                      <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">{t('growth.affiliateClicks', 'Affiliate URL Clicks')}</span>
                      <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{referrals?.clicks || 0}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-150 text-center">
                      <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">{t('growth.verifiedSignups', 'Verified Signups')}</span>
                      <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{referrals?.signups || 0}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-150 text-center">
                      <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">{t('growth.rewardsUnlocked', 'SaaS Rewards Unlocked')}</span>
                      <span className="text-xs font-bold text-indigo-600 mt-2 block">
                        {t('growth.featureModulesCount', '{{count}} Feature Modules', { count: referrals?.unlockedFeatures?.length || 0 })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1.5">{t('growth.yourReferralLink', 'Your Unique Referral Link')}</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={`${getProductionBaseUrl()}/?ref=${profile?.referralCode}`}
                          className="flex-1 text-xs border border-slate-200 rounded-xl p-3 bg-white font-mono text-slate-600 select-all focus:outline-none"
                        />
                        <button 
                          onClick={copyReferralLink}
                          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center min-w-[120px]"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-4 h-4 mr-1.5" />
                              <span className="text-xs font-bold">{t('growth.copied', 'Copied!')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1.5" />
                              <span className="text-xs font-bold">{t('growth.copyLink', 'Copy Link')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Unlocked Milestones Grid */}
                    <div className="border-t border-slate-200/80 pt-4 mt-6">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 font-mono mb-3">{t('growth.milestonesLedger', 'Referral Reward Milestones Ledger')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { signups: 1, name: t('growth.milestone1Name', 'High-res SVG Exports'), desc: t('growth.milestone1Desc', 'Unlock sharp production assets.') },
                          { signups: 3, name: t('growth.milestone2Name', 'Finder Eye Editor'), desc: t('growth.milestone2Desc', 'Color code inner & outer finder frames.') },
                          { signups: 5, name: t('growth.milestone3Name', 'Color Shifting Shaders'), desc: t('growth.milestone3Desc', 'Create dynamic metallic animations.') }
                        ].map((milestone) => {
                          const isUnlocked = (referrals?.signups || 0) >= milestone.signups;
                          return (
                            <div 
                              key={milestone.signups}
                              className={`p-3 rounded-xl border text-left flex gap-3 items-start transition-colors ${
                                isUnlocked 
                                  ? 'bg-emerald-50/40 border-emerald-100 text-slate-800' 
                                  : 'bg-white border-slate-200 text-slate-400'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                isUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                              }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="block text-[11px] font-extrabold uppercase tracking-tight">{milestone.name}</span>
                                <span className="block text-[9px] mt-0.5 leading-relaxed text-slate-500">{milestone.desc}</span>
                                <span className="block text-[8px] font-black font-mono mt-1 text-slate-400 uppercase">
                                  {t('growth.signupsNeeded', '{{count}} Signup{{plural}} Needed', { count: milestone.signups, plural: milestone.signups > 1 ? 's' : '' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security & Account Management (Password & Delete) */}
                <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-6 text-left shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                    <Key className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">{t('growth.securitySettingsTitle', 'Security & Account Credentials')}</h3>
                  </div>

                  {passwordSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 mb-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.newPassword', 'Change Account Password')}</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder={t('growth.newPasswordPlaceholder', 'Enter new password (min 6 chars)')}
                          className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!newPasswordInput || newPasswordInput.length < 6}
                          className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          {t('growth.updatePassword', 'Update Password')}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="border-t border-red-100 pt-5 mt-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase text-red-600 font-mono">{t('growth.dangerZone', 'Danger Zone - Delete Account')}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{t('growth.deleteAccountDesc', 'Permanently delete your account and all associated QR projects and cloud logs.')}</p>
                      </div>
                      {!deleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(true)}
                          className="py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-red-200"
                        >
                          {t('growth.deleteAccountBtn', 'Delete Account')}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(false)}
                            className="py-2 px-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200"
                          >
                            {t('growth.cancel', 'Cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                          >
                            {t('growth.confirmDelete', 'Yes, Delete Permanently')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. COMMUNITY HUB VIEW */}
        {activeTab === 'community' && (
          <div className="p-6 md:p-8 text-left">
            <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{t('growth.communityTitle', 'Community Suggestions & Discussions')}</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('growth.communityDesc', 'Vote on feature requests, share customized styling templates, and brainstorm dynamic QR operations with creators worldwide.')}
                </p>
              </div>
              <button 
                onClick={() => {
                  const el = document.getElementById('new-post-box');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="py-2 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                {t('growth.proposeFeature', 'Propose Feature')}
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('growth.searchPlaceholder', 'Search community posts...')}
                  className="w-full text-xs border border-slate-200 rounded-xl py-3 pl-9 pr-4 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: t('growth.filterAll', 'All Discussions') },
                  { value: 'feature', label: t('growth.filterFeatures', 'Feature Requests') },
                  { value: 'discussion', label: t('growth.filterGeneral', 'General') },
                  { value: 'template', label: t('growth.filterTemplates', 'Templates') },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setCategoryFilter(f.value)}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-bold border transition-colors ${
                      categoryFilter === f.value
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Posts */}
            <div className="space-y-4 mb-8">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400 font-mono">{t('growth.noDiscussions', 'No matching discussions found.')}</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div key={post.id} className="bg-slate-50/40 border border-slate-200 rounded-2xl p-5 hover:bg-slate-50 transition-all">
                    <div className="flex items-start gap-4">
                      {/* Upvote Widget */}
                      <button 
                        onClick={() => handleUpvote(post.id)}
                        className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 shrink-0 transition-colors ${
                          user && post.upvotes?.includes(user.id)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-black font-mono leading-none">{post.upvotes?.length || 0}</span>
                      </button>

                      {/* Main Post Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex text-[9px] font-bold uppercase tracking-wider bg-indigo-100/60 text-indigo-700 border border-indigo-100/30 px-2 py-0.5 rounded-full font-mono">
                            {t('growth.category.' + post.category, post.category)}
                          </span>
                          {post.status && post.status !== 'none' && (
                            <span className="inline-flex text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-mono">
                              {t('growth.status.' + post.status, post.status)}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">{post.authorName}</span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-800 leading-snug uppercase">{t(post.title, post.title)}</h3>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{t(post.content, post.content)}</p>

                        {/* Comments section */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-white/50 p-3 rounded-xl border border-slate-150">
                            {post.comments.map((comment: any) => (
                              <div key={comment.id} className="text-xs">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="font-extrabold text-slate-700">{comment.authorName}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-600 pl-0.5 leading-relaxed">{t(comment.content, comment.content)}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
                        <div className="mt-4 flex gap-2">
                          <input 
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder={t('growth.commentPlaceholder', 'Type a constructive comment...')}
                            className="flex-1 text-xs border border-slate-200 rounded-xl p-2 bg-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                          >
                            {t('growth.reply', 'Reply')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Propose/Create Feature Request Box */}
            <div id="new-post-box" className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">{t('growth.proposeNewFeature', 'Propose New Feature / Share Templates')}</h3>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.postTitleLabel', 'Title / Short Summary')}</label>
                    <input 
                      type="text" 
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder={t('growth.postTitlePlaceholder', 'e.g. Include dynamic map QR routing with geo-fencing')}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.categoryLabel', 'Category')}</label>
                    <select 
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="feature">{t('growth.categoryFeature', 'Feature Request')}</option>
                      <option value="discussion">{t('growth.categoryBrainstorm', 'General Brainstorm')}</option>
                      <option value="template">{t('growth.categoryTemplate', 'Aesthetic Template')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1">{t('growth.detailedDescLabel', 'Detailed Description & Use Case')}</label>
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={t('growth.detailedDescPlaceholder', 'Provide depth so our engineers can assess scope, including target users and how it enhances the platform.')}
                    rows={4}
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 bg-white font-sans"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 leading-snug">
                    {t('growth.postingRewardsPrefix', 'Posting rewards you with ')}<strong>{t('growth.postingRewardsXp', '+25 XP')}</strong>{t('growth.postingRewardsAndThe', ' and the ')}<strong>{t('growth.postingRewardsBadge', 'Community Pillar')}</strong>{t('growth.postingRewardsSuffix', ' badge.')}
                  </span>
                  <button 
                    type="submit"
                    className="py-2.5 px-5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    {t('growth.publishPost', 'Publish Post (+25 XP)')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. ROADMAP VIEW */}
        {activeTab === 'roadmap' && (
          <div className="p-6 md:p-8 text-left">
            <div className="border-b border-slate-100 pb-4 mb-8">
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{t('growth.roadmapTitle', 'Public Product Roadmap')}</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('growth.roadmapDesc', "Real-time transparency of FreeQRBarcodes's product planning. Check which requests have been categorized and are actively in production.")}
              </p>
            </div>

            {/* 3-Column Bento Grid Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1: Planned */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-black font-mono tracking-wider uppercase text-indigo-600">{t('growth.roadmapPlanned', 'Planned / Backlog')}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full font-bold">
                    {roadmap.filter(p => p.status === 'planned').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {roadmap.filter(p => p.status === 'planned').map(item => (
                    <div key={item.id} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4">
                      <span className="text-[9px] font-bold text-slate-400 font-mono block mb-1 uppercase">{t('growth.category.' + item.category, item.category)}</span>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight leading-snug">{t(item.title, item.title)}</h4>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-normal truncate">{t(item.content, item.content)}</p>
                      <div className="mt-3.5 pt-2 border-t border-slate-150 flex items-center justify-between">
                        <span className="text-[9px] font-bold font-mono text-slate-400">{t('growth.upvotesCount', '{{count}} Upvotes', { count: item.upvotes?.length || 0 })}</span>
                        <button 
                          onClick={() => handleUpvote(item.id)}
                          className="text-[9px] font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-800"
                        >
                          {t('growth.roadmapUpvote', 'Upvote')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: In Production */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-black font-mono tracking-wider uppercase text-purple-600">{t('growth.roadmapInProgress', 'In Progress / Testing')}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full font-bold">
                    {roadmap.filter(p => p.status === 'under_review').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {roadmap.filter(p => p.status === 'under_review').map(item => (
                    <div key={item.id} className="bg-indigo-50/10 border border-indigo-100/60 rounded-xl p-4">
                      <span className="text-[9px] font-bold text-indigo-400 font-mono block mb-1 uppercase">{t('growth.category.' + item.category, item.category)}</span>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight leading-snug">{t(item.title, item.title)}</h4>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-normal truncate">{t(item.content, item.content)}</p>
                      <div className="w-full bg-slate-100 rounded-full h-1 mt-3.5">
                        <div className="bg-purple-600 h-1 rounded-full animate-pulse" style={{ width: '65%' }} />
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-150 flex items-center justify-between">
                        <span className="text-[9px] font-bold font-mono text-slate-400">{t('growth.upvotesCount', '{{count}} Upvotes', { count: item.upvotes?.length || 0 })}</span>
                        <span className="text-[9px] font-bold font-mono text-purple-600 uppercase">{t('growth.codingPhase', 'Coding Phase')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Live */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-black font-mono tracking-wider uppercase text-emerald-600">{t('growth.roadmapLive', 'Live / Completed')}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full font-bold">
                    {roadmap.filter(p => p.status === 'completed').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {roadmap.filter(p => p.status === 'completed').map(item => (
                    <div key={item.id} className="bg-emerald-50/20 border border-emerald-100/60 rounded-xl p-4">
                      <span className="text-[9px] font-bold text-emerald-500 font-mono block mb-1 uppercase">{t('growth.category.' + item.category, item.category)}</span>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight leading-snug">{t(item.title, item.title)}</h4>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-normal truncate">{t(item.content, item.content)}</p>
                      <div className="mt-3.5 pt-2 border-t border-slate-150 flex items-center justify-between">
                        <span className="text-[9px] font-bold font-mono text-slate-400">{t('growth.upvotesCount', '{{count}} Upvotes', { count: item.upvotes?.length || 0 })}</span>
                        <div className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-[9px] font-bold font-mono text-emerald-600 uppercase">{t('growth.deployed', 'Deployed')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. CASE STUDIES & SUCCESS CENTER */}
        {activeTab === 'testimonials' && (
          <div className="p-6 md:p-8 text-left">
            <div className="border-b border-slate-100 pb-4 mb-8">
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{t('growth.testimonialsTitle', 'Customer Testimonial & Case Studies')}</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('growth.testimonialsDesc', "Discover how leading brands utilize FreeQRBarcodes's high-fidelity designer codes to increase campaign interaction levels.")}
              </p>
            </div>

            {/* Testimonials List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                {
                  quote: t('growth.testimonial1Quote', "We replaced our standard static QR codes with FreeQRBarcodes's rounded classy templates, which resulted in a massive 42% increase in our store app downloads."),
                  author: t('growth.testimonial1Author', "Marcus Aurel"),
                  role: t('growth.testimonial1Role', "Head of Marketing, Velox Retail"),
                  stats: t('growth.testimonial1Stats', "+42% Scan Engagement")
                },
                {
                  quote: t('growth.testimonial2Quote', "Dynamic quiet zone calculations and custom Reed-Solomon protection enabled zero-latency logistics tracking for our warehouses, even under harsh ambient light."),
                  author: t('growth.testimonial2Author', "Dr. Kenji Tanaka"),
                  role: t('growth.testimonial2Role', "Operations Lead, Kyoto Express"),
                  stats: t('growth.testimonial2Stats', "99.9% Read Compatibility")
                }
              ].map((tItem, i) => (
                <div key={i} className="bg-slate-50/60 border border-slate-200 rounded-2xl p-6 relative flex flex-col justify-between">
                  <div>
                    <Heart className="w-5 h-5 text-indigo-500 mb-3" />
                    <p className="text-xs italic text-slate-600 leading-relaxed font-medium">"{tItem.quote}"</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-150 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-black uppercase tracking-tight text-slate-800">{tItem.author}</span>
                      <span className="block text-[10px] text-slate-500">{tItem.role}</span>
                    </div>
                    <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 py-1 px-3 rounded-full font-bold font-mono">
                      {tItem.stats}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Case Study Details */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10">
                <Zap className="w-72 h-72 text-indigo-400" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 font-mono block mb-2">{t('growth.caseStudyReport', 'CASE STUDY REPORT')}</span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight max-w-xl">
                {t('growth.caseStudyTitle', 'Global Event QR Integration: Elevating Ticket Verification and Customer Retention')}
              </h3>
              <p className="text-xs text-slate-300 mt-3 mb-6 leading-relaxed max-w-2xl">
                {t('growth.caseStudyDesc', 'FreeQRBarcodes collaborated with Horizon Logistics to generate over 120,000 localized ticket codes with integrated error recovery algorithms. Using dynamic routing, planners could alter destination itineraries live during schedules without reprinting.')}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-850">
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase">{t('growth.scanVolumes', 'Scan Volumes')}</span>
                  <span className="block text-lg font-black text-white font-mono mt-0.5">{t('growth.scanVolumeValue', '120K+')}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase">{t('growth.setupSpeed', 'Setup Speed')}</span>
                  <span className="block text-lg font-black text-white font-mono mt-0.5">{t('growth.setupSpeedValue', '< 3 Secs')}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase">{t('growth.roiFactor', 'ROI Factor')}</span>
                  <span className="block text-lg font-black text-white font-mono mt-0.5">{t('growth.roiFactorValue', '8.4X')}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-mono uppercase">{t('growth.scannersUsed', 'Scanners Used')}</span>
                  <span className="block text-lg font-black text-white font-mono mt-0.5">{t('growth.anyMobile', 'Any Mobile')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. RELEASE NOTES VIEW */}
        {activeTab === 'release-notes' && (
          <div className="p-6 md:p-8 text-left">
            <div className="border-b border-slate-100 pb-4 mb-8">
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{t('growth.releaseNotesTitle', 'Interactive Release Notes & Gazette')}</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('growth.releaseNotesDesc', 'Stay updated with our latest SaaS engine optimization logs, database indexing integrations, and AI updates.')}
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  version: t('growth.release1Version', "v3.2.0 - SaaS Growth Engine Deployed"),
                  date: t('growth.release1Date', "July 2026"),
                  notes: [
                    t('growth.release1Note1', "Integrated User Profile and dynamic metadata dashboard structures."),
                    t('growth.release1Note2', "Added real-time Referral system metrics with multi-tier award thresholds."),
                    t('growth.release1Note3', "Integrated in-app CSAT metrics tracking with automated notifications engine."),
                    t('growth.release1Note4', "Optimized Firestore transaction logs to persist user analytics indices.")
                  ],
                  badge: t('growth.release1Badge', "Feature Release")
                },
                {
                  version: t('growth.release2Version', "v3.1.5 - ICU & Language Framework Upgrade"),
                  date: t('growth.release2Date', "June 2026"),
                  notes: [
                    t('growth.release2Note1', "Localized currency, numbers, percentage, and dynamic date formatters."),
                    t('growth.release2Note2', "Added plural and gender variable parsing inside the i18n validator module."),
                    t('growth.release2Note3', "Hardened RTL layout containers (drawers, sidebar panels, carousels) for international users.")
                  ],
                  badge: t('growth.release2Badge', "Performance Update")
                }
              ].map((log, index) => (
                <div key={index} className="border-l-2 border-indigo-500 pl-6 relative">
                  <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-2 top-1.5 ring-4 ring-white" />
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 py-0.5 px-2.5 rounded-full font-bold">
                      {log.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                  </div>
                  <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">{log.version}</h3>
                  <ul className="mt-3 space-y-2">
                    {log.notes.map((note, idx) => (
                      <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                        <span className="text-indigo-600 mt-1 shrink-0 font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Newsletter Platform Integration Inside Release Notes */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 mt-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">{t('growth.subscribeTitle', 'Subscribe to our Product Gazette')}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('growth.subscribeDesc', 'Get bi-weekly optimization tips, case studies, and advanced designer vector guides delivered directly to your inbox.')}
                  </p>
                </div>

                <div className="flex-1 max-w-sm">
                  {newsletterSubscribed ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-800 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{t('growth.subscribeSuccess', 'Thank you! Your secure subscription is active.')}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubscribe} className="flex gap-2">
                      <input 
                        type="email" 
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder={t('growth.emailPlaceholder', 'your@email.com')}
                        className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 bg-white"
                        disabled={newsletterLoading}
                      />
                      <button 
                        type="submit"
                        className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                        disabled={newsletterLoading}
                      >
                        {newsletterLoading ? t('growth.saving', 'Saving...') : t('growth.subscribeButton', 'Subscribe')}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. FEEDBACK CENTER VIEW */}
        {activeTab === 'feedback' && (
          <div className="p-6 md:p-8 text-left">
            <div className="border-b border-slate-100 pb-4 mb-8">
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{t('growth.csatTitle', 'Customer Satisfaction (CSAT) feedback')}</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('growth.csatDesc', "Your direct advisory line to FreeQRBarcodes's core team. Let us know what you think of our designs, rendering speed, and usability.")}
              </p>
            </div>

            {feedbackSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center max-w-md mx-auto my-12 animate-fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black uppercase text-emerald-900">{t('growth.feedbackSuccessTitle', 'Feedback Submitted Successfully!')}</h3>
                <p className="text-xs text-emerald-700 mt-2 leading-relaxed">
                  {t('growth.feedbackSuccessDescPrefix', 'Thank you for contributing to FreeQRBarcodes. Your advisory score has been registered. If you are signed in, check your notifications drawer to collect your ')}<strong>{t('growth.feedbackSuccessDescXp', '+15 XP')}</strong>{t('growth.feedbackSuccessDescAnd', ' and the ')}<strong>{t('growth.feedbackSuccessDescBadge', 'Product Advisory')}</strong>{t('growth.feedbackSuccessDescSuffix', ' badge.')}
                </p>
                <button 
                  onClick={() => setFeedbackSuccess(false)}
                  className="mt-6 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {t('growth.sendAnotherFeedback', 'Send Another Feedback')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-2">{t('growth.feedbackTypeLabel', 'Feedback Type')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'suggestion', label: t('growth.feedbackTypeSuggestion', 'Suggestion'), desc: t('growth.feedbackTypeSuggestionDesc', 'New ideas') },
                      { value: 'bug', label: t('growth.feedbackTypeBug', 'Bug Report'), desc: t('growth.feedbackTypeBugDesc', 'Unexpected errors') },
                      { value: 'compliment', label: t('growth.feedbackTypeCompliment', 'Compliment'), desc: t('growth.feedbackTypeComplimentDesc', 'Love the app') },
                    ].map((tItem) => (
                      <button
                        type="button"
                        key={tItem.value}
                        onClick={() => setFeedbackType(tItem.value as any)}
                        className={`py-3 px-4 rounded-xl text-left border transition-all ${
                          feedbackType === tItem.value
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-1 ring-indigo-300 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-xs font-extrabold uppercase tracking-tight">{tItem.label}</span>
                        <span className="block text-[9px] text-slate-400 font-normal mt-0.5 leading-none">{tItem.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono">{t('growth.csatRatingLabel', 'Satisfaction Rating (CSAT)')}</label>
                    <span className="text-sm font-black font-mono text-indigo-600 bg-indigo-50 py-0.5 px-3 rounded-full border border-indigo-100">
                      {feedbackSatisfaction} / 10
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={feedbackSatisfaction}
                    onChange={(e) => setFeedbackSatisfaction(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-full cursor-pointer focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase mt-1">
                    <span>{t('growth.highlyDissatisfied', 'Highly Dissatisfied')}</span>
                    <span>{t('growth.neutral', 'Neutral')}</span>
                    <span>{t('growth.extremelyHappy', 'Extremely Happy')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1.5">{t('growth.feedbackTextLabel', 'Feedback / Suggestion Text')}</label>
                  <textarea 
                    value={feedbackText}
                    required
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t('growth.feedbackPlaceholder', 'Provide specific details about your experience. All submissions are actively read by our developer and design teams.')}
                    rows={5}
                    className="w-full text-xs border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                    <span>{t('growth.trustCenterCriteria', 'Your submission conforms to our secure Trust Center criteria.')}</span>
                  </div>
                  <button 
                    type="submit"
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {t('growth.submitAdvisoryForm', 'Submit Advisory Form')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </main>
      </div>
    </div>
  );
}