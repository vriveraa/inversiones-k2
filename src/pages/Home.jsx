import Hero from '../sections/Hero.jsx'
import StatsBar from '../sections/StatsBar.jsx'
import WhyAuctions from '../sections/WhyAuctions.jsx'
import HowItWorks from '../sections/HowItWorks.jsx'
import PropertyTypes from '../sections/PropertyTypes.jsx'
import TrustSection from '../sections/TrustSection.jsx'
import Testimonials from '../sections/Testimonials.jsx'
import FinalCTA from '../sections/FinalCTA.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <WhyAuctions />
      <HowItWorks />
      <PropertyTypes />
      <TrustSection />
      <Testimonials />
      <FinalCTA />
    </>
  )
}
