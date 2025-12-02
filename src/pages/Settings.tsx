import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Loader2, User, MapPin, GraduationCap, BookOpen, Save, ArrowLeft, 
  Camera, Bell, Shield, Globe, Filter, Lock, Eye, EyeOff, MessageSquare,
  Users, FileText, Megaphone, BarChart3
} from "lucide-react";
import { toast } from "sonner";

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
  notify_mock_tests: boolean;
  notify_announcements: boolean;
  notify_weekly_report: boolean;
  show_verified_only: boolean;
  hide_memes: boolean;
  blocked_subjects: string[];
  safe_mode: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
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
    notify_mock_tests: true,
    notify_announcements: true,
    notify_weekly_report: true,
    show_verified_only: false,
    hide_memes: false,
    blocked_subjects: [],
    safe_mode: false,
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const countries = ["United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Poland", "Switzerland", "Belgium", "Austria", "Other"];
  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate", "Postgraduate"];
  const streams = ["CBSE", "IGCSE", "IB", "AP", "A-Levels", "GCSE", "State Board", "Cambridge", "Edexcel", "German Abitur", "French Baccalauréat", "Dutch VWO", "Other"];
  const languages = ["English", "Spanish", "French", "German", "Hindi", "Chinese", "Japanese", "Portuguese", "Arabic", "Russian"];
  const timezones = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney"];
  const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Geography"];

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUserId(user.id);
    setUserEmail(user.email || "");

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileData) {
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
        notify_mock_tests: profileData.notify_mock_tests ?? true,
        notify_announcements: profileData.notify_announcements ?? true,
        notify_weekly_report: profileData.notify_weekly_report ?? true,
        show_verified_only: profileData.show_verified_only ?? false,
        hide_memes: profileData.hide_memes ?? false,
        blocked_subjects: profileData.blocked_subjects || [],
        safe_mode: profileData.safe_mode ?? false,
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
        notify_mock_tests: profile.notify_mock_tests,
        notify_announcements: profile.notify_announcements,
        notify_weekly_report: profile.notify_weekly_report,
        show_verified_only: profile.show_verified_only,
        hide_memes: profile.hide_memes,
        blocked_subjects: profile.blocked_subjects,
        safe_mode: profile.safe_mode,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
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

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Region</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Profile Picture & Bio
                  </CardTitle>
                  <CardDescription>
                    Personalize your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {profile.username.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Upload a profile picture. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {profile.bio.length}/200
                    </p>
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
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={userEmail}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Country
                      </Label>
                      <Select value={profile.country} onValueChange={(v) => setProfile(prev => ({ ...prev, country: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Grade
                      </Label>
                      <Select value={profile.grade} onValueChange={(v) => setProfile(prev => ({ ...prev, grade: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Stream
                      </Label>
                      <Select value={profile.stream} onValueChange={(v) => setProfile(prev => ({ ...prev, stream: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stream" />
                        </SelectTrigger>
                        <SelectContent>
                          {streams.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button onClick={handleChangePassword} variant="outline" disabled={!newPassword || !confirmPassword}>
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile Changes
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Control what notifications you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">New Doubt Replies</p>
                        <p className="text-sm text-muted-foreground">Get notified when someone replies to your doubts</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.notify_doubt_replies}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, notify_doubt_replies: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Mentions (@)</p>
                        <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.notify_mentions}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, notify_mentions: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Group Updates</p>
                        <p className="text-sm text-muted-foreground">Get notified about group activities</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.notify_group_updates}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, notify_group_updates: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">New Mock Test Releases</p>
                        <p className="text-sm text-muted-foreground">Get notified when new tests are available</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.notify_mock_tests}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, notify_mock_tests: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Admin Announcements</p>
                        <p className="text-sm text-muted-foreground">Important updates from administrators</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.notify_announcements}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, notify_announcements: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Weekly Progress Report</p>
                        <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.notify_weekly_report}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, notify_weekly_report: v }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Notification Settings
              </Button>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control who can see your information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Public Profile</p>
                        <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.is_public}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, is_public: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Allow Direct Messages</p>
                        <p className="text-sm text-muted-foreground">Let other users send you messages</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.allow_dms}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, allow_dms: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Show Online Status</p>
                        <p className="text-sm text-muted-foreground">Display when you're online</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.show_online_status}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, show_online_status: v }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Privacy Settings
              </Button>
            </TabsContent>

            {/* Language & Region Tab */}
            <TabsContent value="language" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Language & Region
                  </CardTitle>
                  <CardDescription>
                    Set your language and regional preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>App Language</Label>
                    <Select value={profile.app_language} onValueChange={(v) => setProfile(prev => ({ ...prev, app_language: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Select value={profile.timezone} onValueChange={(v) => setProfile(prev => ({ ...prev, timezone: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select value={profile.date_format} onValueChange={(v) => setProfile(prev => ({ ...prev, date_format: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormats.map((fmt) => (
                          <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveProfile} disabled={saving} variant="gradient" className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Regional Settings
              </Button>
            </TabsContent>

            {/* Content Filters Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Content Filters
                  </CardTitle>
                  <CardDescription>
                    Customize what content you see
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Only Verified Posts</p>
                      <p className="text-sm text-muted-foreground">Only see posts from verified users</p>
                    </div>
                    <Switch
                      checked={profile.show_verified_only}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, show_verified_only: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Hide Memes/Off-topic</p>
                      <p className="text-sm text-muted-foreground">Filter out meme and off-topic posts</p>
                    </div>
                    <Switch
                      checked={profile.hide_memes}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, hide_memes: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Safe Mode (for Juniors)</p>
                      <p className="text-sm text-muted-foreground">Extra content filtering for younger users</p>
                    </div>
                    <Switch
                      checked={profile.safe_mode}
                      onCheckedChange={(v) => setProfile(prev => ({ ...prev, safe_mode: v }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Block Specific Subjects</Label>
                    <p className="text-sm text-muted-foreground">Hide posts from subjects you're not interested in</p>
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
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Content Settings
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
