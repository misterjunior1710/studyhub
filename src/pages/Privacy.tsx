import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, Bell, Users, Trash2, Mail } from "lucide-react";
const Privacy = () => {
  return <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.1s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p>We collect information you provide directly to us, such as:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Account information (email, username, profile details)</li>
                <li>Content you post (questions, answers, comments)</li>
                <li>Study preferences and settings</li>
                <li>Communication preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your learning experience</li>
                <li>Connect you with study partners and groups</li>
                <li>Send notifications about activity relevant to you</li>
                <li>Analyze usage patterns to improve our platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.3s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication measures</li>
                <li>Secure data storage with industry-standard practices</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.4s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Sharing Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share your information in limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>With service providers who assist our operations</li>
                <li>To protect rights, privacy, safety, or property</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.5s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Your Privacy Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have control over your data through our Settings page:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Manage notification preferences</li>
                <li>Control profile visibility (public/private)</li>
                <li>Manage who can message you</li>
                <li>Download your data</li>
                <li>Delete your account</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.6s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Data Retention & Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We retain your information for as long as your account is active. You can request deletion of your account and associated data at any time through Settings.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.7s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a className="text-primary hover:underline" href="mailto:studyhub.community.web@gmail.com">
                  ​studyhub.community.web@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>;
};
export default Privacy;