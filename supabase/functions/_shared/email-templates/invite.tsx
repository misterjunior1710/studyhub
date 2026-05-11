/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { BRAND, styles } from './_brand.ts'
import { BrandLayout } from './_BrandLayout.tsx'

interface InviteEmailProps {
  siteName?: string
  siteUrl?: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <BrandLayout preview={`You're invited to join ${BRAND.name}`}>
    <Heading style={styles.h1}>You're in. Welcome to the squad.</Heading>
    <Text style={styles.text}>
      Someone just invited you to join <strong>{BRAND.name}</strong> — your
      learning grind starts now. Accept your invite below to set up your account.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Accept Invite
      </Button>
    </div>
    <Text style={styles.hint}>
      Not expecting this? You can safely ignore this email.
    </Text>
  </BrandLayout>
)

export default InviteEmail
