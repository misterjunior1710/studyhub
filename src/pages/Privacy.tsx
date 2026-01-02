import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, Bell, Users, Trash2, Mail, Server, Globe, UserCheck } from "lucide-react";

const Privacy = () => {
  const breadcrumbData = getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub.world/" },
    { name: "Privacy Policy", url: "https://studyhub.world/privacy" },
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Privacy Policy - How We Protect Your Data"
        description="Read StudyHub's Privacy Policy to understand how we collect, use, and protect your personal information. We never sell your data and are committed to student privacy and GDPR compliance."
        canonical="https://studyhub.world/privacy"
      />
      <StructuredData data={breadcrumbData} />
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
            <p className="text-muted-foreground max-w-2xl mx-auto">
              At StudyHub, we are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information. This Privacy Policy explains our practices in clear, student-friendly language.
            </p>
          </div>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <p className="text-muted-foreground">
                We collect information you provide directly to us when you create an account and use our platform:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground">Account Information</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Full name and username</li>
                    <li>Email address</li>
                    <li>Country of residence</li>
                    <li>Grade level (e.g., Class 11, Class 12)</li>
                    <li>Academic stream (e.g., Science, Commerce, Arts)</li>
                    <li>Profile picture (optional)</li>
                    <li>Bio and personal description (optional)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Content You Create</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Questions, answers, and comments you post</li>
                    <li>Study notes, flashcards, and quizzes</li>
                    <li>Messages in group chats and direct messages</li>
                    <li>Files and documents you upload</li>
                    <li>Whiteboard drawings and collaborative documents</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Usage Data</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Study session duration and patterns</li>
                    <li>Features you use and how often</li>
                    <li>Device type and browser information</li>
                    <li>IP address and general location data</li>
                    <li>Login times and activity timestamps</li>
                    <li>XP points and streak information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Provide our services:</strong> Enable you to create posts, join study groups, connect with other students, and use all platform features</li>
                <li><strong>Personalize your experience:</strong> Show relevant content based on your grade, stream, and country; recommend study groups and resources</li>
                <li><strong>Track your progress:</strong> Calculate XP points, maintain streaks, and display your position on leaderboards</li>
                <li><strong>Send notifications:</strong> Alert you about replies to your posts, mentions, group updates, and important announcements</li>
                <li><strong>Improve our platform:</strong> Analyze usage patterns to enhance features and fix issues</li>
                <li><strong>Ensure safety:</strong> Moderate content, prevent abuse, and maintain a positive learning environment</li>
                <li><strong>Communicate with you:</strong> Respond to support requests and send service-related updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Data Storage and Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We take the security of your data seriously and implement appropriate measures to protect it:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Encryption:</strong> All data is encrypted in transit using HTTPS/TLS and at rest using industry-standard encryption</li>
                <li><strong>Secure infrastructure:</strong> We use reputable cloud service providers with robust security certifications</li>
                <li><strong>Access controls:</strong> Only authorized personnel can access user data, and only when necessary for service operation</li>
                <li><strong>Authentication:</strong> We use secure authentication methods to protect your account</li>
                <li><strong>Regular audits:</strong> We conduct security reviews and assessments to identify and address vulnerabilities</li>
                <li><strong>Data backups:</strong> Regular backups ensure your data is not lost due to technical issues</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but will notify you of any breach that may affect your personal data.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                We Do Not Sell Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground font-medium">
                StudyHub does not sell, rent, or trade your personal information to third parties for marketing or advertising purposes.
              </p>
              <p className="text-muted-foreground">
                Your data is used solely to provide and improve our educational platform. We believe your privacy is not a product to be sold.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We use trusted third-party services to operate our platform. These services may have access to certain data as necessary to perform their functions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Cloud hosting:</strong> Our platform is hosted on secure cloud infrastructure that stores your data</li>
                <li><strong>Authentication services:</strong> We use secure authentication providers to manage login and account security</li>
                <li><strong>Analytics:</strong> We may use analytics tools to understand how our platform is used and improve user experience</li>
                <li><strong>Email services:</strong> To send notifications and support communications</li>
                <li><strong>Content delivery:</strong> To ensure fast and reliable access to platform resources</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                These third-party services are bound by their own privacy policies and are contractually obligated to protect your data.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Sharing Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may share your information only in the following limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
                <li><strong>Public content:</strong> Posts, comments, and profile information you choose to make public are visible to other users</li>
                <li><strong>Legal requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Safety and rights:</strong> To protect the safety of users, enforce our terms, or protect our legal rights</li>
                <li><strong>Service providers:</strong> With third-party vendors who help operate our platform (as described above)</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets (with prior notice)</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.45s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information in your profile settings</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Data portability:</strong> Request your data in a commonly used format</li>
                <li><strong>Withdraw consent:</strong> Opt out of optional data collection at any time</li>
                <li><strong>Object to processing:</strong> Object to certain uses of your data</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                To exercise any of these rights, please contact us using the information provided below or visit your Settings page.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
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
                <li>Manage notification preferences for different types of alerts</li>
                <li>Control profile visibility (public/private)</li>
                <li>Choose who can send you direct messages</li>
                <li>Enable or disable online status visibility</li>
                <li>Manage blocked subjects and content filters</li>
                <li>Delete your account and all associated data</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.55s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Data Retention and Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We retain your personal information for as long as your account is active or as needed to provide our services.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Account data is retained until you request deletion</li>
                <li>Upon account deletion, we remove your personal data within 30 days</li>
                <li>Some data may be retained longer if required by law or for legitimate business purposes</li>
                <li>Anonymized data may be retained for analytics and platform improvement</li>
                <li>Content you shared publicly may remain visible if others have interacted with it</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                To delete your account, go to Settings and select the account deletion option, or contact our support team.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                StudyHub is designed for students. We take extra care to protect younger users:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We do not knowingly collect personal information from children under 13</li>
                <li>If you are under the age of consent in your country, please have a parent or guardian review this policy</li>
                <li>Parents or guardians may contact us to review, delete, or stop collection of their child's information</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.65s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We will notify you of significant changes via email or platform notification</li>
                <li>The "Last updated" date at the top will be revised</li>
                <li>Continued use of StudyHub after changes constitutes acceptance of the updated policy</li>
                <li>We encourage you to review this policy periodically</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, want to exercise your data rights, or have concerns about how we handle your information, please contact us at{" "}
                <a className="text-primary hover:underline" href="mailto:studyhub.community.web@gmail.com">
                  studyhub.community.web@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground mt-4 text-sm">
                We aim to respond to all privacy-related inquiries within 30 days.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
