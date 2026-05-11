/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { BRAND, styles } from './_brand.ts'
import { BrandLayout } from './_BrandLayout.tsx'

interface RecoveryEmailProps {
  siteName?: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <BrandLayout preview={`Reset your ${BRAND.name} password in seconds`}>
    <Heading style={styles.h1}>Secure your account in seconds.</Heading>
    <Text style={styles.text}>
      We got a request to reset your {BRAND.name} password. Tap below to choose
      a new one and jump back in.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Reset Password
      </Button>
    </div>
    <Text style={styles.hint}>
      Didn't ask for this? Ignore this email — your password stays the same.
    </Text>
  </BrandLayout>
)

export default RecoveryEmail
