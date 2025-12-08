import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, BookOpen, AlertTriangle, Scale, Ban, RefreshCw, Mail } from "lucide-react";

const Terms = () => {
  const breadcrumbData = getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub-studentportal.lovable.app/" },
    { name: "Terms & Conditions", url: "https://studyhub-studentportal.lovable.app/terms" },
  ]);

  return <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Terms & Conditions"
        description="Read StudyHub's terms of service. Understand your rights and responsibilities when using our student community platform."
        canonical="https://studyhub-studentportal.lovable.app/terms"
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
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.1s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By accessing or using StudyHub, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must be at least 13 years old to use this service</li>
                <li>Users selecting "Adult (18+)" must be 18 years or older</li>
                <li>One person may not maintain multiple accounts</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.3s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">You agree to use StudyHub only for lawful purposes. You must not:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, bully, or intimidate other users</li>
                <li>Share copyrighted material without permission</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Use the platform for commercial solicitation</li>
                <li>Post inappropriate or offensive content</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.4s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Content Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Users retain ownership of content they post. By posting content, you grant StudyHub a license to display and distribute your content on the platform.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All content must be educational or community-focused</li>
                <li>Do not share exam answers or promote academic dishonesty</li>
                <li>Respect intellectual property rights</li>
                <li>We may remove content that violates these guidelines</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.5s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Spamming or flooding the platform with repetitive content</li>
                <li>Impersonating other users or entities</li>
                <li>Distributing malware or malicious links</li>
                <li>Scraping or automated data collection</li>
                <li>Circumventing security measures</li>
                <li>Age misrepresentation</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.6s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                StudyHub is provided "as is" without warranties of any kind. We do not guarantee the accuracy of user-generated content. Educational advice from other users should not replace professional guidance.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.7s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may update these terms from time to time. Continued use of StudyHub after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="animate-fade-in" style={{
          animationDelay: "0.8s"
        }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                For questions about these Terms, contact us at{" "}
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
export default Terms;