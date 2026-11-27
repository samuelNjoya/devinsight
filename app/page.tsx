// app/page.tsx

import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Preview } from '@/components/landing/Preview'
import { Testimonials } from '@/components/landing/Testimonials'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Preview />
      <Testimonials />
    </>
  )
}