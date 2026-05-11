/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Heading, Text } from 'npm:@react-email/components@0.0.22'
import { BRAND, styles } from './_brand.ts'
import { BrandLayout } from './_BrandLayout.tsx'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <BrandLayout preview={`Your ${BRAND.name} verification code`}>
    <Heading style={styles.h1}>Quick check — it's really you, right?</Heading>
    <Text style={styles.text}>
      Use the code below to confirm your identity on {BRAND.name}.
    </Text>
    <div style={styles.codeBox}>{token}</div>
    <Text style={styles.hint}>
      This code expires shortly. If this wasn't you, ignore this email and consider
      resetting your password.
    </Text>
  </BrandLayout>
)

export default ReauthenticationEmail
