/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import { BRAND, styles } from './_brand.ts'

interface BrandLayoutProps {
  preview: string
  children: React.ReactNode
}

export const BrandLayout = ({ preview, children }: BrandLayoutProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={styles.main}>
      <Container style={styles.card}>
        <Section style={styles.logoWrap}>
          <Link href={BRAND.url}>
            <Img
              src={BRAND.logoUrl}
              alt={BRAND.name}
              width="64"
              height="64"
              style={styles.logo}
            />
          </Link>
        </Section>
        {children}
      </Container>
      <Container style={styles.footer}>
        <Img
          src={BRAND.logoUrl}
          alt={BRAND.name}
          width="36"
          height="36"
          style={styles.footerLogo}
        />
        <Link href={BRAND.url} style={styles.footerBrand}>
          {BRAND.name}
        </Link>
        <Text style={styles.footerText}>{BRAND.tagline}</Text>
        <Text style={styles.footerText}>
          Need a hand?{' '}
          <Link href={`mailto:${BRAND.supportEmail}`} style={styles.footerBrand}>
            {BRAND.supportEmail}
          </Link>
        </Text>
        <Text style={{ ...styles.footerText, marginTop: '12px' }}>
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default BrandLayout
