/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Link, Text } from 'npm:@react-email/components@0.0.22'
import { BRAND, styles } from './_brand.ts'
import { BrandLayout } from './_BrandLayout.tsx'

interface EmailChangeEmailProps {
  siteName?: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <BrandLayout preview={`Confirm your new ${BRAND.name} email`}>
    <Heading style={styles.h1}>Confirm your new email.</Heading>
    <Text style={styles.textLeft}>
      You asked to switch your {BRAND.name} email from{' '}
      <Link href={`mailto:${oldEmail}`} style={styles.link}>{oldEmail}</Link>{' '}
      to{' '}
      <Link href={`mailto:${newEmail}`} style={styles.link}>{newEmail}</Link>.
      Tap below to confirm the change.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Confirm Email Change
      </Button>
    </div>
    <Text style={styles.hint}>
      Didn't request this? Secure your account immediately by resetting your password.
    </Text>
  </BrandLayout>
)

export default EmailChangeEmail
