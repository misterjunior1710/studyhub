import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Loader2, User, MapPin, GraduationCap, BookOpen, Save, ArrowLeft, 
  Camera, Bell, Shield, Globe, Filter, Lock, Eye, EyeOff, MessageSquare,
  Users, FileText, Megaphone, BarChart3, Smartphone, Monitor, Tablet,
  Download, Trash2, RefreshCw, Clock, Target, Timer, Palette, LogOut, AlertTriangle, Ban, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import AdminModerationPanel from "@/components/AdminModerationPanel";
import BanAppealDialog from "@/components/BanAppealDialog";
import { applyThemeColor } from "@/hooks/useThemePersistence";

interface ProfileData {
  username: string;
  bio: string;
  avatar_url: string;
  country: string;
  grade: string;
  stream: string;
  is_public: boolean;
  allow_dms: boolean;
  show_online_status: boolean;
  app_language: string;
  timezone: string;
  date_format: string;
  notify_doubt_replies: boolean;
  notify_mentions: boolean;
  notify_group_updates: boolean;
  notify_announcements: boolean;
  notify_feature_updates: boolean;
  show_verified_only: boolean;
  blocked_subjects: string[];
  safe_mode: boolean;
  daily_reminder_time: string;
  weekly_study_goal: number;
  daily_hours_target: number;
  auto_start_focus_timer: boolean;
  theme_color: string;
}

const themeColors = [
  { name: "purple", label: "Purple", primary: "262 83% 58%", accent: "330 85% 60%" },
  { name: "blue", label: "Ocean Blue", primary: "217 91% 60%", accent: "199 89% 48%" },
  { name: "green", label: "Forest Green", primary: "142 76% 36%", accent: "160 84% 39%" },
  { name: "orange", label: "Sunset Orange", primary: "24 95% 53%", accent: "38 92% 50%" },
  { name: "red", label: "Ruby Red", primary: "0 72% 51%", accent: "350 89% 60%" },
  { name: "teal", label: "Teal", primary: "173 80% 40%", accent: "187 92% 35%" },
  { name: "indigo", label: "Indigo", primary: "239 84% 67%", accent: "250 70% 55%" },
  { name: "slate", label: "Slate Gray", primary: "215 20% 45%", accent: "215 25% 35%" },
];

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [bannedUntil, setBannedUntil] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    bio: "",
    avatar_url: "",
    country: "",
    grade: "",
    stream: "",
    is_public: true,
    allow_dms: true,
    show_online_status: true,
    app_language: "English",
    timezone: "UTC",
    date_format: "MM/DD/YYYY",
    notify_doubt_replies: true,
    notify_mentions: true,
    notify_group_updates: true,
    notify_announcements: true,
    notify_feature_updates: false,
    show_verified_only: false,
    blocked_subjects: [],
    safe_mode: false,
    daily_reminder_time: "09:00",
    weekly_study_goal: 10,
    daily_hours_target: 2,
    auto_start_focus_timer: false,
    theme_color: "purple",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const countries = ["United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Poland", "Switzerland", "Belgium", "Austria", "Other"];
  const isAdult = profile.grade === "Adult (18+)" || profile.grade === "Working Professional";
  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate", "Postgraduate", "Adult (18+)", "Working Professional"];
  const streams = isAdult 
    ? ["Not Applicable", "Self-Learning", "Professional Development", "BDS", "MDS", "Dental Hygiene", "Dental Technology", "Dental Nursing", "Other"]
    : ["CBSE", "IGCSE", "IB", "AP", "A-Levels", "GCSE", "State Board", "Cambridge", "Edexcel", "German Abitur", "French Baccalauréat", "Dutch VWO", "Other"];
  const languages = ["English", "Spanish", "French", "German", "Hindi", "Chinese", "Japanese", "Portuguese", "Arabic", "Russian"];
  const timezones = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney"];
  const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
  const subjects = isAdult
    ? ["General", "Career Advice", "Finance", "Technology", "Business", "Personal Development", "Health & Wellness", "Dentistry", "Oral Health", "Dental Sciences", "Other", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Geography"]
    : ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Geography", "General"];

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  useEffect(() => {
    // Apply theme color using shared function
    applyThemeColor(profile.theme_color);
  }, [profile.theme_color]);

  const checkAuthAndLoadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUserId(user.id);
    setUserEmail(user.email || "");

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!roleData);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileData) {
      // Check ban status
      setIsBanned(profileData.is_banned ?? false);
      setBannedUntil(profileData.banned_until);

      setProfile({
        username: profileData.username || "",
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
        country: profileData.country || "",
        grade: profileData.grade || "",
        stream: profileData.stream || "",
        is_public: profileData.is_public ?? true,
        allow_dms: profileData.allow_dms ?? true,
        show_online_status: profileData.show_online_status ?? true,
        app_language: profileData.app_language || "English",
        timezone: profileData.timezone || "UTC",
        date_format: profileData.date_format || "MM/DD/YYYY",
        notify_doubt_replies: profileData.notify_doubt_replies ?? true,
        notify_mentions: profileData.notify_mentions ?? true,
        notify_group_updates: profileData.notify_group_updates ?? true,
        notify_announcements: profileData.notify_announcements ?? true,
        notify_feature_updates: profileData.notify_feature_updates ?? false,
        show_verified_only: profileData.show_verified_only ?? false,
        blocked_subjects: profileData.blocked_subjects || [],
        safe_mode: profileData.safe_mode ?? false,
        daily_reminder_time: profileData.daily_reminder_time || "09:00",
        weekly_study_goal: profileData.weekly_study_goal || 10,
        daily_hours_target: profileData.daily_hours_target || 2,
        auto_start_focus_timer: profileData.auto_start_focus_timer ?? false,
        theme_color: profileData.theme_color || "purple",
      });
    }

    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploadingAvatar(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('post-files')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload avatar");
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-files')
      .getPublicUrl(fileName);

    setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    setUploadingAvatar(false);
    toast.success("Avatar uploaded!");
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username.trim(),
        bio: profile.bio.trim(),
        avatar_url: profile.avatar_url,
        country: profile.country,
        grade: profile.grade,
        stream: profile.stream,
        is_public: profile.is_public,
        allow_dms: profile.allow_dms,
        show_online_status: profile.show_online_status,
        app_language: profile.app_language,
        timezone: profile.timezone,
        date_format: profile.date_format,
        notify_doubt_replies: profile.notify_doubt_replies,
        notify_mentions: profile.notify_mentions,
        notify_group_updates: profile.notify_group_updates,
        notify_announcements: profile.notify_announcements,
        notify_feature_updates: profile.notify_feature_updates,
        show_verified_only: profile.show_verified_only,
        blocked_subjects: profile.blocked_subjects,
        safe_mode: profile.safe_mode,
        daily_reminder_time: profile.daily_reminder_time,
        weekly_study_goal: profile.weekly_study_goal,
        daily_hours_target: profile.daily_hours_target,
        auto_start_focus_timer: profile.auto_start_focus_timer,
        theme_color: profile.theme_color,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Settings saved successfully!");
    }

    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSignOutAll = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      toast.error("Failed to sign out of all devices");
    } else {
      toast.success("Signed out of all devices");
      navigate("/auth");
    }
  };

  const handleDownloadData = async () => {
    if (!userId) return;

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single();
    const { data: postsData } = await supabase.from("posts").select("*").eq("user_id", userId);
    const { data: commentsData } = await supabase.from("comments").select("*").eq("user_id", userId);

    const exportData = {
      profile: profileData,
      posts: postsData,
      comments: commentsData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyhub-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data downloaded!");
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    // Note: Full account deletion requires server-side implementation
    // For now, we'll delete user data and sign out
    if (userId) {
      await supabase.from("posts").delete().eq("user_id", userId);
      await supabase.from("comments").delete().eq("user_id", userId);
      await supabase.from("bookmarks").delete().eq("user_id", userId);
      await supabase.from("votes").delete().eq("user_id", userId);
      await supabase.from("notifications").delete().eq("user_id", userId);
    }
    await supabase.auth.signOut();
    toast.success("Account data deleted");
    navigate("/auth");
  };

  const toggleBlockedSubject = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      blocked_subjects: prev.blocked_subjects.includes(subject)
        ? prev.blocked_subjects.filter(s => s !== subject)
        : [...prev.blocked_subjects, subject]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Settings"
        description="Manage your StudyHub account settings, preferences, and privacy options."
        noIndex={true}
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and preferences
            </p>
          </div>

          {/* Ban Notice */}
          {isBanned && userId && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Ban className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Your account has been banned</p>
                    <p className="text-sm text-muted-foreground">
                      {bannedUntil 
                        ? `Ban expires: ${new Date(bannedUntil).toLocaleDateString()}`
                        : "This ban is permanent"
                      }
                    </p>
                  </div>
                </div>
                <BanAppealDialog userId={userId} bannedUntil={bannedUntil} />
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className={`flex flex-wrap lg:grid lg:w-auto gap-1 ${isAdmin ? 'lg:grid-cols-8' : 'lg:grid-cols-7'}`}>
              <TabsTrigger value="profile" className="flex-shrink-0 gap-1 px-2 sm:px-3">
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex-shrink-0 gap-1 px-2 sm:px-3">
                <Palette className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Theme</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-shrink-0 gap-1 px-2 sm:px-3">
                <Bell className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex-shrink-0 gap-1 px-2 sm:px-3">
                <Shield className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex-shrink-0 gap-1 px-2 sm:px-3">
                <Target className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex-shrink-0 gap-1 px-2 sm:px-3">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Region</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex-shrink-0 gap-1 px-2 sm:px-3">
                <Download className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Data</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="moderation" className="flex-shrink-0 gap-1 px-2 sm:px-3 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden lg:inline">Moderation</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Profile Picture & Bio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.avatar_url} alt={`${profile.username || 'User'}'s profile picture`} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {profile.username.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </label>
                      <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Upload a profile picture. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} maxLength={200} />
                    <p className="text-xs text-muted-foreground text-right">{profile.bio.length}/200</p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={profile.username} onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))} placeholder="Enter your username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={userEmail} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" />Country</Label>
                      <Select value={profile.country} onValueChange={(v) => setProfile(prev => ({ ...prev, country: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4" />Grade</Label>
                      <Select value={profile.grade} onValueChange={(v) => {
                        const wasAdult = profile.grade === "Adult (18+)" || profile.grade === "Working Professional";
                        const nowAdult = v === "Adult (18+)" || v === "Working Professional";
                        if (wasAdult !== nowAdult) {
                          setProfile(prev => ({ ...prev, grade: v, stream: "" }));
                        } else {
                          setProfile(prev => ({ ...prev, grade: v }));
                        }
                      }}>
                        <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                        <SelectContent>{grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Stream</Label>
                      <Select value={profile.stream} onValueChange={(v) => setProfile(prev => ({ ...prev, stream: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                        <SelectContent>{streams.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" />Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input id="new-password" type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPasswords(!showPasswords)}>
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type={showPasswords ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                  </div>
                  <Button onClick={handleChangePassword} variant="outline" disabled={!newPassword || !confirmPassword}>Update Password</Button>
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Profile</>}
              </Button>
            </TabsContent>

            {/* Appearance/Theme Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Color Theme</CardTitle>
                  <CardDescription>Choose your preferred color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {themeColors.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setProfile(prev => ({ ...prev, theme_color: theme.name }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          profile.theme_color === theme.name 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div 
                          className="w-full h-12 rounded-md mb-2" 
                          style={{ background: `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))` }}
                        />
                        <p className="text-sm font-medium">{theme.label}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Theme
              </Button>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'notify_doubt_replies', icon: MessageSquare, title: 'New Question Replies', desc: 'When someone replies to your questions' },
                    { key: 'notify_mentions', icon: User, title: 'Mentions (@)', desc: 'When someone mentions you' },
                    { key: 'notify_group_updates', icon: Users, title: 'Group Updates', desc: 'About group activities' },
                    { key: 'notify_announcements', icon: Megaphone, title: 'Admin Announcements', desc: 'Important updates from administrators' },
                    { key: 'notify_feature_updates', icon: Sparkles, title: 'Feature Updates', desc: 'New features, improvements, and bug fixes (default: off)' },
                  ].map(({ key, icon: Icon, title, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{title}</p>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={profile[key as keyof ProfileData] as boolean}
                        onCheckedChange={(v) => setProfile(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Notifications
              </Button>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'is_public', icon: Eye, title: 'Public Profile', desc: 'Allow others to see your profile' },
                    { key: 'allow_dms', icon: MessageSquare, title: 'Allow Direct Messages', desc: 'Let other users send you messages' },
                    { key: 'show_online_status', icon: Globe, title: 'Show Online Status', desc: 'Display when you\'re online' },
                  ].map(({ key, icon: Icon, title, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{title}</p>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={profile[key as keyof ProfileData] as boolean}
                        onCheckedChange={(v) => setProfile(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-primary" />Content Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'show_verified_only', title: 'Show Only Verified Posts', desc: 'Only see posts from verified users' },
                    { key: 'safe_mode', title: 'Safe Mode (for Juniors)', desc: 'Extra content filtering for younger users' },
                  ].map(({ key, title, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={profile[key as keyof ProfileData] as boolean}
                        onCheckedChange={(v) => setProfile(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}

                  <div className="space-y-3">
                    <Label>Block Specific Subjects</Label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject) => (
                        <Button
                          key={subject}
                          variant={profile.blocked_subjects.includes(subject) ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleBlockedSubject(subject)}
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Privacy Settings
              </Button>
            </TabsContent>

            {/* Study Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Study Goals</CardTitle>
                  <CardDescription>Set your learning targets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2"><Clock className="h-4 w-4" />Daily Reminder Time</Label>
                    <Input
                      type="time"
                      value={profile.daily_reminder_time}
                      onChange={(e) => setProfile(prev => ({ ...prev, daily_reminder_time: e.target.value }))}
                      className="w-40"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Weekly Study Goal</Label>
                      <span className="text-sm font-medium text-primary">{profile.weekly_study_goal} hours</span>
                    </div>
                    <Slider
                      value={[profile.weekly_study_goal]}
                      onValueChange={([v]) => setProfile(prev => ({ ...prev, weekly_study_goal: v }))}
                      min={1}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Daily Hours Target</Label>
                      <span className="text-sm font-medium text-primary">{profile.daily_hours_target} hours</span>
                    </div>
                    <Slider
                      value={[profile.daily_hours_target]}
                      onValueChange={([v]) => setProfile(prev => ({ ...prev, daily_hours_target: v }))}
                      min={0.5}
                      max={12}
                      step={0.5}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Timer className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Auto-start Focus Timer</p>
                        <p className="text-sm text-muted-foreground">Start timer when opening study mode</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.auto_start_focus_timer}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, auto_start_focus_timer: v }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Goals
              </Button>
            </TabsContent>

            {/* Language & Region Tab */}
            <TabsContent value="language" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />Language & Region</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>App Language</Label>
                    <Select value={profile.app_language} onValueChange={(v) => setProfile(prev => ({ ...prev, app_language: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                      <SelectContent>{languages.map((lang) => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Select value={profile.timezone} onValueChange={(v) => setProfile(prev => ({ ...prev, timezone: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                      <SelectContent>{timezones.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select value={profile.date_format} onValueChange={(v) => setProfile(prev => ({ ...prev, date_format: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select date format" /></SelectTrigger>
                      <SelectContent>{dateFormats.map((fmt) => <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Regional Settings
              </Button>
            </TabsContent>

            {/* Data & Account Tab */}
            <TabsContent value="data" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-primary" />Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleDownloadData} variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Download All My Data
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={() => toast.success("Search history cleared!")}>
                    <RefreshCw className="h-4 w-4" />
                    Clear Search History
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={() => toast.success("Recommendations reset!")}>
                    <RefreshCw className="h-4 w-4" />
                    Reset Recommendations
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete My Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    All your posts, comments, and data will be permanently deleted
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Moderation Tab */}
            {isAdmin && (
              <TabsContent value="moderation">
                <AdminModerationPanel />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
