/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { BRAND, styles } from './_brand.ts'
import { BrandLayout } from './_BrandLayout.tsx'

interface MagicLinkEmailProps {
  siteName?: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <BrandLayout preview={`One click and you're back inside ${BRAND.name}`}>
    <Heading style={styles.h1}>One click and you're back inside.</Heading>
    <Text style={styles.text}>
      Tap below to securely sign in to {BRAND.name}. This link is one-time use
      and expires shortly — keep it to yourself.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Log Me In
      </Button>
    </div>
    <Text style={styles.hint}>
      Didn't request this? You can safely ignore it — your account stays locked.
    </Text>
  </BrandLayout>
)

export default MagicLinkEmail
