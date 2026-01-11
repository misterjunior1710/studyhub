import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UserCheck, Shield, AlertTriangle, Scale, Ban, RefreshCw, Mail, BookOpen, Users, Gavel, Clock } from "lucide-react";

const Terms = () => {
  const breadcrumbData = getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub.world/" },
    { name: "Terms & Conditions", url: "https://studyhub.world/terms" },
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Terms of Service | User Agreement | Community Rules"
        description="Terms of service and community guidelines. User agreement for students. Rules for homework help, study groups, and community."
        canonical="https://studyhub.world/terms"
      />
      <StructuredData data={breadcrumbData} />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 1, 2025
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Welcome to StudyHub! These Terms & Conditions govern your use of our platform. By creating an account or using StudyHub, you agree to these terms. Please read them carefully.
            </p>
          </div>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By accessing or using StudyHub, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree to these terms, you may not use our platform.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>These terms constitute a legally binding agreement between you and StudyHub</li>
                <li>Your continued use of the platform constitutes ongoing acceptance of these terms</li>
                <li>We reserve the right to modify these terms at any time with notice</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                StudyHub is designed exclusively for students. By using our platform, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You are a student currently enrolled in an educational institution, or recently graduated</li>
                <li>You are at least 13 years of age (or the minimum age required in your country)</li>
                <li>If you are under the age of majority in your jurisdiction, you have parental or guardian consent to use this platform</li>
                <li>You will provide accurate and truthful information about your grade level, stream, and educational background</li>
                <li>You will not create accounts for non-educational or commercial purposes</li>
                <li>You have the legal capacity to enter into this agreement</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                We reserve the right to verify user eligibility and terminate accounts that do not meet these requirements.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                When you create an account on StudyHub, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate and current</li>
                <li>Keep your password confidential and secure</li>
                <li>Not share your account credentials with others</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Not create multiple accounts for deceptive purposes</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                We are not liable for any loss or damage arising from your failure to protect your account credentials.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                StudyHub is a platform for learning and academic collaboration. You agree to use the platform responsibly:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use the platform only for educational and learning purposes</li>
                <li>Engage respectfully with other students and community members</li>
                <li>Share helpful, accurate, and constructive content</li>
                <li>Cite sources when sharing external information or resources</li>
                <li>Respect intellectual property rights of others</li>
                <li>Report content that violates our guidelines</li>
                <li>Follow the instructions and guidance of moderators and administrators</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The following activities are strictly prohibited on StudyHub:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Harassment & Bullying:</strong> Intimidating, threatening, or harassing other users in any form</li>
                <li><strong>Hate Speech:</strong> Content promoting discrimination based on race, gender, religion, nationality, disability, or sexual orientation</li>
                <li><strong>Inappropriate Content:</strong> Posting sexually explicit, violent, or otherwise inappropriate material</li>
                <li><strong>Academic Dishonesty:</strong> Sharing exam answers, facilitating cheating, or plagiarism</li>
                <li><strong>Spam & Advertising:</strong> Posting unsolicited promotional content or advertisements</li>
                <li><strong>Impersonation:</strong> Pretending to be another person or entity</li>
                <li><strong>Malicious Activity:</strong> Uploading viruses, malware, or attempting to hack the platform</li>
                <li><strong>Illegal Content:</strong> Sharing content that violates any applicable laws</li>
                <li><strong>Personal Information:</strong> Sharing private information of others without consent</li>
                <li><strong>Manipulation:</strong> Artificially inflating points, streaks, or engagement metrics</li>
                <li><strong>Commercial Use:</strong> Using the platform for commercial purposes without authorization</li>
              </ul>
              <p className="text-muted-foreground text-sm font-medium">
                Violation of these rules may result in content removal, account suspension, or permanent ban.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                User-Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You are solely responsible for all content you post, upload, or share on StudyHub:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You retain ownership of content you create, but grant StudyHub a license to display, distribute, and store it on our platform</li>
                <li>You represent that you have the right to share any content you post</li>
                <li>You are responsible for ensuring your content does not violate any third-party rights</li>
                <li>We do not endorse or verify the accuracy of user-generated content</li>
                <li>We reserve the right to remove any content that violates our guidelines</li>
                <li>Content may be moderated, edited, or removed at our discretion</li>
                <li>Deleted content may persist in backups for a limited time</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                By posting content, you grant StudyHub a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content in connection with operating the platform.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                No Guarantee of Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground font-medium">
                StudyHub is a platform to facilitate learning and peer-to-peer collaboration. We make no guarantees regarding:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Academic Results:</strong> Using StudyHub does not guarantee improved grades, test scores, or academic performance</li>
                <li><strong>Content Accuracy:</strong> Information shared by users may contain errors or inaccuracies; always verify important information with official sources</li>
                <li><strong>Answer Correctness:</strong> Answers provided by other students are not professionally verified and may be incorrect</li>
                <li><strong>Educational Value:</strong> The quality of learning depends on individual effort and engagement</li>
                <li><strong>Availability:</strong> Continuous, uninterrupted access to the platform</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                You should not rely solely on StudyHub for academic preparation. Always consult teachers, textbooks, and official curriculum materials.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.45s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Platform Provided "As-Is"
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                StudyHub is provided on an "as-is" and "as-available" basis without warranties of any kind, either express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Implied warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties of non-infringement</li>
                <li>Warranties that the platform will be uninterrupted, error-free, or secure</li>
                <li>Warranties that defects will be corrected</li>
                <li>Warranties regarding the accuracy or reliability of any content</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                We strive to provide a reliable and valuable service, but technical issues, downtime, and bugs may occur. We are not liable for any disruption to your studies caused by platform unavailability.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, StudyHub and its operators shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>Damages resulting from unauthorized access to your account or data</li>
                <li>Damages resulting from content posted by other users</li>
                <li>Damages resulting from any third-party services or links</li>
                <li>Academic consequences resulting from use or inability to use the platform</li>
                <li>Damages exceeding the amount you have paid to StudyHub (if any) in the past 12 months</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                Some jurisdictions do not allow limitation of liability for certain damages, so some of the above limitations may not apply to you.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.55s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                Account Suspension and Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate your account at our sole discretion:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Temporary Suspension:</strong> For minor or first-time violations of our terms</li>
                <li><strong>Permanent Ban:</strong> For serious or repeated violations</li>
                <li><strong>Immediate Termination:</strong> For illegal activity, severe harassment, or threats of harm</li>
                <li><strong>Warning System:</strong> Users may receive warnings before suspension for minor infractions</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Upon termination:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your access to the platform will be revoked</li>
                <li>Your content may be removed or retained at our discretion</li>
                <li>You may appeal bans through our support channels</li>
                <li>Creating new accounts to evade bans is prohibited</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                You may also terminate your account at any time through your Settings page.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may update these Terms & Conditions from time to time:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We will notify users of significant changes via email or platform notification</li>
                <li>The "Last updated" date at the top of this page will be revised</li>
                <li>Continued use of StudyHub after changes constitutes acceptance of the new terms</li>
                <li>If you disagree with the updated terms, you must stop using the platform</li>
                <li>We encourage you to review these terms periodically</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.65s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-primary" />
                Governing Law and Disputes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                These Terms & Conditions are governed by applicable laws. In the event of any dispute:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We encourage you to contact us first to resolve issues informally</li>
                <li>Any disputes will be resolved through negotiation in good faith</li>
                <li>If informal resolution fails, disputes may be submitted to appropriate legal jurisdiction</li>
                <li>You agree to waive any right to participate in class action lawsuits against StudyHub</li>
                <li>The prevailing party in any legal action may be entitled to recover reasonable legal fees</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Severability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If any provision of these Terms & Conditions is found to be unenforceable or invalid:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>That provision will be modified to the minimum extent necessary to make it enforceable</li>
                <li>If modification is not possible, that provision will be severed from these terms</li>
                <li>The remaining provisions will continue in full force and effect</li>
                <li>The invalidity of one provision does not affect the validity of other provisions</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{ animationDelay: "0.75s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have questions about these Terms & Conditions, please contact us at{" "}
                <a className="text-primary hover:underline" href="mailto:studyhub.community.web@gmail.com">
                  studyhub.community.web@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground mt-4 text-sm">
                We aim to respond to all inquiries within a reasonable timeframe.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
