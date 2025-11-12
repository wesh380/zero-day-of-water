"use client"

import { Compass, Lock, Plus, Minus, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "How physically demanding is the tour?",
      answer:
        "The Son Doong expedition requires excellent physical fitness. You'll trek 15+ kilometers through jungle terrain, rappel down 80-meter drops, and navigate underground rivers. Participants must be able to carry a 15kg backpack and have prior caving or trekking experience.",
    },
    {
      question: "What is included in the tour price?",
      answer:
        "Your expedition includes all permits, professional guides, safety equipment, camping gear, meals during the expedition, transportation from Phong Nha, and emergency evacuation insurance. Personal items like clothing and toiletries are not included.",
    },
    {
      question: "Is it safe to explore Son Doong Cave?",
      answer:
        "Safety is our absolute priority. All guides are certified cave rescue specialists, we use professional-grade equipment, maintain constant communication with base camp, and have comprehensive emergency protocols. Weather conditions are monitored continuously.",
    },
    {
      question: "How do I book a spot?",
      answer:
        "Expeditions are limited to 10 people per group and run only during dry season (February-August). Book 6-12 months in advance through our website. A 50% deposit secures your spot, with final payment due 30 days before departure.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Background Image with Overlay */}

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full">
            <Compass className="w-5 h-5" />
            <span className="font-medium text-balance">Son Doong Expeditions</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {["The Expedition", "Safety", "Gallery", "FAQ", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full hover:bg-primary/30 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full hover:bg-primary/30 transition-colors"
            >
              Login
            </a>
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-6">
              Book Now
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
          {/* Badge */}
          <div className="mb-6 px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full">
            <span className="text-sm font-medium">Limited Group Expeditions</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6 text-balance">Enter a Lost World.</h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-foreground/90 max-w-4xl mb-12 leading-relaxed text-pretty">
            Explore the colossal chambers of Son Doong Cave in Vietnam, a unique ecosystem with its own jungle and
            weather system, on a fully-guided 4-day expedition.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-8 py-4 text-lg"
            >
              Book Your Expedition
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-primary/20 ring-1 ring-primary/30 backdrop-blur border-0 text-foreground hover:bg-primary/30 rounded-full px-8 py-4 text-lg"
            >
              View Itinerary
            </Button>
          </div>

          {/* Footer Note */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 ring-1 ring-primary/30 backdrop-blur rounded-full">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Safety is our Priority</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Total Expeditions */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">250+</div>
                <p className="text-muted-foreground leading-relaxed">Successful Expeditions</p>
              </div>
            </div>

            {/* Total Explorers */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">2,500+</div>
                <p className="text-muted-foreground leading-relaxed">Explorers Guided</p>
              </div>
            </div>

            {/* Safety Record */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground leading-relaxed">Safety Record</p>
              </div>
            </div>

            {/* Years Experience */}
            <div className="rounded-2xl bg-card ring-1 ring-border backdrop-blur p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">15+</div>
                <p className="text-muted-foreground leading-relaxed">Years of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-12">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">Your Epic Journey</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                From jungle treks to underground camps, here's what to expect.
              </p>
            </div>

            {/* Journey Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Phase 1: Briefing & Prep */}
              <div className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 h-80 flex flex-col">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-muted-foreground mb-4">01.</div>
                  <h3 className="text-xl font-semibold mb-4">Briefing & Prep</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Your adventure begins in Phong Nha with a full safety briefing and equipment check to ensure you're
                    ready for the trek.
                  </p>
                </div>
              </div>

              {/* Phase 2: The Trek */}
              <div className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 h-80 flex flex-col">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-muted-foreground mb-4">02.</div>
                  <h3 className="text-xl font-semibold mb-4">The Trek</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Hike through pristine jungle, cross rivers, and camp in remote locations on your way to the entrance
                    of Son Doong.
                  </p>
                </div>
              </div>

              {/* Phase 3: Caving */}
              <div className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 h-80 flex flex-col">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-muted-foreground mb-4">03.</div>
                  <h3 className="text-xl font-semibold mb-4">Caving</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Descend into the cave to witness colossal stalagmites, explore vast chambers, and see the unique
                    underground jungle.
                  </p>
                </div>
              </div>

              {/* Phase 4: Base Camp */}
              <div className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur p-8 h-80 flex flex-col">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-muted-foreground mb-4">04.</div>
                  <h3 className="text-xl font-semibold mb-4">Base Camp</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Spend nights at breathtaking campsites inside the cave, sharing stories with your group before
                    trekking back.
                  </p>
                </div>
              </div>
            </div>

            {/* Check Availability Button */}
            <div className="text-center">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-12 py-4 text-lg font-semibold"
              >
                Check Availability
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left Column - Title and Description */}
              <div>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                  Everything you need to know about the expedition, from physical requirements to booking your spot on
                  this exclusive adventure.
                </p>
              </div>

              {/* Right Column - FAQ Accordion */}
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-secondary ring-1 ring-border backdrop-blur overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-accent/10 transition-colors"
                    >
                      <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                      {openFaq === index ? (
                        <Minus className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur p-12">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">Contact Our Team</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left Column - Contact Form */}
              <div className="rounded-2xl bg-secondary text-foreground p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Send an Inquiry</h3>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                      placeholder="Tell us about your expedition interests..."
                    />
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-3 font-normal text-base">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Right Column - Contact Info */}
              <div className="space-y-8">
                <div>
                  <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                    For questions about private tours, partnerships, or media inquiries, please get in touch. We reply
                    within one business day.
                  </p>
                </div>

                {/* Profile Card */}
                <div className="rounded-2xl bg-secondary text-foreground p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src="/images/design-mode/edam-garden.jpg"
                      alt="David Luong"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-lg font-semibold">David Luong</h4>
                      <p className="text-muted-foreground">Lead Expedition Guide</p>
                    </div>
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-card ring-1 ring-border backdrop-blur-2xl p-12">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Compass className="w-6 h-6" />
                  <span className="text-xl font-semibold">Son Doong Expeditions</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  The official tour operator for expeditions into Son Doong, the world's largest cave. We are dedicated
                  to safety, conservation, and unforgettable adventures.
                </p>
              </div>

              {/* Expedition Links */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">EXPEDITION</h3>
                <ul className="space-y-3">
                  {["Itinerary", "Pricing", "Gear List", "Photo Gallery"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm leading-relaxed"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* About Links */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">ABOUT</h3>
                <ul className="space-y-3">
                  {["Our Mission", "Safety Standards", "Our Team", "Conservation"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm leading-relaxed"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6">RESOURCES</h3>
                <ul className="space-y-3">
                  {["Help Center", "Contact Us", "FAQ", "Terms & Conditions"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm leading-relaxed"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="border-t border-border pt-12 mb-12">
              <div className="max-w-md">
                <h3 className="text-lg font-semibold mb-4">Get Expedition Updates</h3>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg bg-primary/20 ring-1 ring-primary/30 backdrop-blur border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                  <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-lg px-6 h-[50px]">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>

            {/* Sub-footer */}
            <div className="border-t border-border pt-8">
              <p className="text-muted-foreground text-sm text-center">© 2025 Son Doong Expeditions</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
