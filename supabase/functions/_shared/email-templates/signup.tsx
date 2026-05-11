/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { BRAND, styles } from './_brand.ts'
import { BrandLayout } from './_BrandLayout.tsx'

interface SignupEmailProps {
  siteName?: string
  siteUrl?: string
  recipient?: string
  confirmationUrl: string
}

export const SignupEmail = ({ confirmationUrl }: SignupEmailProps) => (
  <BrandLayout preview={`Verify your ${BRAND.name} account in one tap`}>
    <Heading style={styles.h1}>Your {BRAND.name} account is ready — let's lock in.</Heading>
    <Text style={styles.text}>
      Tap the button below to verify your email and unlock your study squad,
      notes, AI tools and more.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Verify & Get Started
      </Button>
    </div>
    <Text style={styles.hint}>
      Didn't sign up? You can safely ignore this email — no account will be created.
    </Text>
  </BrandLayout>
)

export default SignupEmail
