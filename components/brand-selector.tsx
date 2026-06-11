'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface Brand {
  id: string
  name: string
  industry: string
  departments: string[]
  logo?: string
  founded?: string
}

const INDUSTRIES_LIST = [
  'Technology & Software',
  'Artificial Intelligence & Automation',
  'Finance & Investment Banking',
  'Corporate & Commercial Law',
  'Medicine & Healthcare',
  'Allied Health & Sports Science',
  'Professional Sport',
  'Media & Entertainment',
  'Social Media & Creator Economy',
  'Marketing & Brand Strategy',
  'Engineering',
  'Construction & Property Development',
  'Entrepreneurship & Startups',
  'Sustainability & Renewable Energy',
  'Government & Public Policy',
  'Economics & Data Analytics',
  'Cybersecurity',
  'Gaming & Esports',
  'Fashion, Beauty & Luxury',
  'Defence & Space Technology',
]

const BRANDS_DATA: Brand[] = [
  { id: '01', name: 'Apple', industry: 'Technology', departments: ['Product Design', 'Marketing', 'Operations', 'Customer Support', 'Engineering', 'Finance', 'Human Resources', 'Legal & Compliance'], logo: '/apple-logo.png', founded: '1976' },
  { id: '02', name: 'Formula 1', industry: 'Sports & Entertainment', departments: ['Racing Operations', 'Team Management', 'Marketing', 'Broadcasting', 'Event Management', 'Sponsorship', 'Technology', 'Safety'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/F1-CMNOw3xS9pWnXPK6KeLDPZsF00FHKC.webp', founded: '1950' },
  { id: '03', name: 'SKIMS', industry: 'Fashion & Retail', departments: ['Product Design', 'Marketing', 'E-commerce', 'Supply Chain', 'Customer Service', 'Operations', 'Retail Expansion', 'Brand Partnerships'], logo: '/skims-logo.avif', founded: '2019' },
  { id: '04', name: 'Sephora', industry: 'Retail & Beauty', departments: ['Store Operations', 'Merchandising', 'Marketing', 'Supply Chain', 'Customer Service', 'E-commerce', 'Product Development', 'Visual Merchandising'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sephora_logo-aPHttrL91M9OPtPoubStaIPWGLRYLL.webp', founded: '1969' },
  { id: '05', name: 'Los Angeles Lakers', industry: 'Sports', departments: ['Team Management', 'Player Development', 'Marketing', 'Arena Operations', 'Fan Engagement', 'Sponsorship', 'Broadcast Media', 'Community Relations'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/los-angeles-lakers-logo-on-transparent-background-free-vector-EPFQtistkX1kL3ChdpEqmXDWpabDLD.png', founded: '1947' },
  { id: '06', name: 'TikTok', industry: 'Social Media', departments: ['Content Strategy', 'Creator Relations', 'Advertising', 'Product Development', 'Trust & Safety', 'Operations', 'Marketing', 'Analytics'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tiktok-logo-icon-vector-PNG-NQv1014gQYTM3SzT3zhC58J9uibsiH.png', founded: '2016' },
  { id: '07', name: 'Macquarie Group', industry: 'Finance', departments: ['Investment Banking', 'Asset Management', 'Trading', 'Infrastructure Finance', 'Risk Management', 'Operations', 'Compliance', 'Technology'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshotter-YouTube-MBAudioLogo12-011-FZi4vHOvLV1XzaayaqmfmmzMFwuALT.jpg', founded: '1969' },
  { id: '08', name: 'Nike', industry: 'Sports & Apparel', departments: ['Product Design', 'Marketing', 'Supply Chain', 'Retail', 'Sales', 'Operations', 'Innovation', 'Finance'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nike-swoosh-logo-on-transparent-background-free-vector-IdxzwdOuQEVKZB4brfS8wgaFl9Hur3.jpg', founded: '1964' },
  { id: '09', name: 'OpenAI', industry: 'Technology', departments: ['Research', 'Product Development', 'Safety & Policy', 'Operations', 'Marketing', 'Sales', 'Engineering', 'Business Development'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/what-is-openai-6FIMAllZvvTspl5KRLtRvtvtTRnbi0.webp', founded: '2015' },
  { id: '10', name: 'Chelsea F.C.', industry: 'Sports', departments: ['Team Management', 'Player Development', 'Marketing', 'Stadium Operations', 'Fan Experience', 'Sponsorship', 'Broadcasting', 'Academy'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-0HxxssxOtVnx1obkNbvEDIRHdgmhaW.jpeg', founded: '1905' },
  { id: '11', name: 'Commonwealth Bank', industry: 'Finance', departments: ['Retail Banking', 'Business Banking', 'Investment Banking', 'Operations', 'Risk Management', 'Technology', 'Customer Service', 'Compliance'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2020-australia-commonwealth-bank-new-logo-design-2-Qtrbu7V75A1AjhXM9UTLCRHFZRuGkq.jpg', founded: '1911' },
  { id: '12', name: 'The Walt Disney Company', industry: 'Entertainment', departments: ['Content Creation', 'Theme Parks', 'Streaming Services', 'Licensing', 'Animation', 'Live Action', 'Marketing', 'Finance'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngimg.com%20-%20walt_disney_PNG47-CEcYTXKV22auoq8beqt9bW8lgTUlAY.png', founded: '1923' },
  { id: '13', name: 'Tesla', industry: 'Automotive & Energy', departments: ['Manufacturing', 'Engineering', 'Battery Technology', 'Sales', 'Supply Chain', 'Product Development', 'Operations', 'Sustainability'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tesla_logo-9Lz5eJiRzuvGSUoMmwGAP4BD37IISV.png', founded: '2003' },
  { id: '14', name: 'Netflix', industry: 'Video Streaming', departments: ['Content Acquisition', 'Original Content', 'Product Engineering', 'Marketing', 'Data Analytics', 'Operations', 'Customer Service', 'Technology'], logo: '/netflix-logo.webp', founded: '1997' },
  { id: '15', name: 'Canva', industry: 'Software & Design', departments: ['Product Design', 'Engineering', 'Marketing', 'Content Creation', 'Sales', 'Customer Success', 'Operations', 'Research'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%281%29-rFTWSRhID5mzsPJSx13MhiDPUHEK0r.png', founded: '2013' },
  { id: '16', name: 'NASA', industry: 'Defence & Space Technology', departments: ['Space Exploration', 'Astronaut Operations', 'Engineering', 'Research & Development', 'Mission Control', 'Technology Innovation', 'Public Outreach', 'Operations'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-NASA-icon-PNG-7kkOxTF4D5mkyLUUmbMzoATujER7Q3.avif', founded: '1958' },
  { id: '17', name: 'Scuderia Ferrari', industry: 'Sports & Automotive', departments: ['Racing Operations', 'Vehicle Engineering', 'Aerodynamics', 'Driver Management', 'Operations', 'Marketing', 'Logistics', 'Technology'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-03-03%20at%206.54.27%E2%80%AFpm-zh9bxX5PdGNs3ONCNIDjAQ5lctEeTr.png', founded: '1929' },
  { id: '18', name: 'Spotify', industry: 'Music & Streaming', departments: ['Product Development', 'Content Partnerships', 'Marketing', 'Engineering', 'Data Analytics', 'Operations', 'Sales', 'Artist Relations'], logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2024-spotify-brand-assets-media-kit-bNKTdIk7rO8c2MVKCUSstea9uviNZA.jpg', founded: '2006' },
  { id: '19', name: 'Coca-Cola', industry: 'Beverage', departments: ['Production', 'Distribution', 'Marketing', 'Sales', 'Supply Chain', 'Innovation', 'Customer Service', 'Brand Management'], logo: '/coca-cola-logo.jpg', founded: '1886' },
  { id: '20', name: 'Google', industry: 'Technology', departments: ['Search & Ads', 'Cloud Services', 'Product Management', 'Engineering', 'Sales', 'Marketing', 'HR', 'Privacy & Security'], logo: '/google-logo.webp', founded: '1998' },
]

interface BrandSelectorProps {
  onBrandSelect: (brand: Brand) => void
  onDepartmentSelect: (department: string) => void
  onClose: () => void
}

export function BrandSelector({ onBrandSelect, onDepartmentSelect, onClose }: BrandSelectorProps) {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [showDepartments, setShowDepartments] = useState(false)
  const [flipped, setFlipped] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [showIndustriesToggle, setShowIndustriesToggle] = useState(false)
  const brandsGridRef = useRef<HTMLDivElement>(null)

  const handleBrandClick = (brand: Brand) => {
    setSelectedBrand(brand)
    
    // If industry was pre-selected, go straight to questions
    if (selectedIndustry) {
      onBrandSelect(brand)
      onDepartmentSelect(selectedIndustry)
    } else {
      // If no industry selected, show departments/industry selection
      setShowDepartments(true)
    }
  }

  const handleDepartmentClick = (department: string) => {
    if (selectedBrand) {
      // Pass brand information along with department
      onBrandSelect(selectedBrand)
      onDepartmentSelect(department)
    }
  }

  const handleBackToBrands = () => {
    setSelectedBrand(null)
    setShowDepartments(false)
  }

  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry)
    // Scroll to brands grid
    setTimeout(() => {
      brandsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const departmentDescriptions: Record<string, string> = {
    'Product Design': 'Creating innovative user experiences',
    'Marketing': 'Building brand awareness and campaigns',
    'Operations': 'Optimizing efficiency and processes',
    'Customer Support': 'Delivering exceptional customer service',
    'Engineering': 'Building technology infrastructure',
    'Finance': 'Managing budgets and strategy',
    'Human Resources': 'Recruiting and developing talent',
    'Legal & Compliance': 'Managing legal and compliance',
    'Cloud Services': 'Delivering cloud solutions',
    'Software Development': 'Creating software products',
    'Sales': 'Driving revenue and partnerships',
    'Enterprise Support': 'Supporting enterprise clients',
    'Research & Development': 'Innovating new technologies',
    'Security': 'Protecting data and systems',
    'Customer Success': 'Ensuring customer satisfaction',
    'Logistics': 'Managing supply chain',
    'AWS Sales': 'Selling cloud services',
    'Technology': 'Managing tech infrastructure',
    'Supply Chain': 'Optimizing inventory',
    'Search & Ads': 'Managing search products',
    'Product Management': 'Leading product strategy',
    'HR': 'Human resource management',
    'Privacy & Security': 'Protecting user privacy',
    'Semiconductors': 'Manufacturing components',
    'Display Technology': 'Developing displays',
    'Manufacturing': 'Operating facilities',
    'Compliance': 'Ensuring regulatory compliance',
  }

  const [hoveredDept, setHoveredDept] = useState<string | null>(null)

  if (showDepartments && selectedBrand) {
    const isApple = selectedBrand.name === 'Apple'
    const isMicrosoft = selectedBrand.name === 'Microsoft'
    
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #07091c 0%, #0e1737 50%, #182046 100%)',
        }}
      >
        {isApple ? (
          <video
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: -1 }}
          >
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3029420-hd_1920_1080_24fps-1yQDUsR5hEu3Gta3BUIJnfTnYpE0fC.mp4" type="video/mp4" />
          </video>
        ) : isMicrosoft ? (
          <video
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: -1 }}
          >
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11922047_720_1280_24fps-c6Wp9bNgNVaN2PYpQADhvUTBiOhq01.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-instawally-176851-Uc1gEfYKinqI7PEGeHmYzrOr5VENvb.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              zIndex: -1,
            }}
          />
        )}

        {/* Content overlay */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {/* Back Button */}
        <button
          onClick={handleBackToBrands}
          className="absolute top-8 left-8 text-white hover:text-gray-300 text-3xl transition-colors z-10"
        >
          ←
        </button>

        {/* Header - Centered at top */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center" style={{ fontFamily: "'Georgia', 'Garamond', serif" }}>
            {selectedBrand.name}
          </h2>
          <p className="text-xl text-gray-300 text-center mt-3">Select department you would like to work in</p>
        </div>

        {/* Department Grid - 4 columns, no flip */}
        <div className="w-full flex items-center justify-center px-8">
          <div className="grid grid-cols-4 gap-12 max-w-7xl">
            {selectedBrand.departments.map((dept, idx) => (
              <button
                key={idx}
                onClick={() => handleDepartmentClick(dept)}
                className="w-64 h-64 rounded-3xl cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex flex-col items-center justify-center p-6"
              >
                <p className="text-white font-bold text-center text-2xl mb-4">
                  {dept}
                </p>
                <p className="text-white/80 text-center text-sm leading-relaxed">
                  {departmentDescriptions[dept] || 'Managing this department'}
                </p>
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center p-8 overflow-y-auto"
      style={{
        backgroundImage: selectedBrand?.name === 'Microsoft' 
          ? 'none'
          : 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/moon%202-6wtzMhimtwyBopV4t7fjq5fWuwZpjs.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: selectedBrand?.name === 'Microsoft' ? '#0a0f22' : 'transparent'
      }}
    >
      {/* Microsoft Video Background */}
      {selectedBrand?.name === 'Microsoft' && (
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11922047_720_1280_24fps-c6Wp9bNgNVaN2PYpQADhvUTBiOhq01.mp4" type="video/mp4" />
        </video>
      )}
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center w-full">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 sm:top-6 right-3 sm:right-6 text-white hover:text-gray-200 text-2xl sm:text-3xl transition-colors z-10 font-bold p-2 active:scale-90"
      >
        ✕
      </button>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-12 text-center drop-shadow-lg px-4" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
        Select your company
      </h2>

      {/* Mobile-only Description Link */}
      <a 
        href="#" 
        className="sm:hidden text-white text-xs underline hover:text-gray-200 transition-colors mb-6 px-4 text-center"
        onClick={(e) => e.preventDefault()}
      >
        Learn more about LAUNCH
      </a>

      {/* Industries Toggle Button */}
      <div className="flex justify-center mb-4 sm:mb-8 px-4">
        <button
          onClick={() => setShowIndustriesToggle(!showIndustriesToggle)}
          className="px-4 sm:px-8 py-2 sm:py-4 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-lg transition-all cursor-pointer drop-shadow-md"
        >
          Industries {showIndustriesToggle ? '▲' : '▼'}
        </button>
      </div>

      {/* Industries Grid - Only show when toggled */}
      {showIndustriesToggle && (
        <>
          <div className="flex justify-center mb-6 px-0 w-full">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full gap-2 sm:gap-4 md:gap-8 px-1 sm:px-4 md:px-8 lg:px-12">
              {INDUSTRIES_LIST.map((industry, index) => (
                <button
                  key={industry}
                  onClick={() => handleIndustrySelect(industry)}
                  className="flex flex-col items-center gap-2 sm:gap-3 cursor-pointer"
                >
                  <div
                    className={`w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-md sm:rounded-xl lg:rounded-2xl transition-all relative overflow-hidden shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl duration-300 flex items-center justify-center flex-shrink-0 animate-popIn ${
                      selectedIndustry === industry
                        ? 'bg-white/40 border-1 sm:border-2 border-white'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                    style={{ 
                      perspective: '1000px',
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="backdrop-blur-md flex items-center justify-center w-full h-full">
                      <p className="text-white font-semibold text-center px-2 text-xs sm:text-sm md:text-base drop-shadow-md">
                        {industry}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dotted Line Separator */}
          <div className="flex justify-center mb-6 sm:mb-8 px-4">
            <div className="w-full max-w-6xl border-t-2 border-dotted border-slate-300"></div>
          </div>
        </>
      )}

      {/* Brands Grid - Responsive columns */}
      <div className="flex justify-center px-0 pb-8 w-full">
        <div ref={brandsGridRef} className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full gap-2 sm:gap-4 md:gap-8 px-1 sm:px-4 md:px-8 lg:px-12">
          {BRANDS_DATA.map((brand, index) => (
          <button
            key={brand.id}
            onClick={() => handleBrandClick(brand)}
            className="flex flex-col items-center gap-2 sm:gap-3 cursor-pointer"
            title={brand.name}
          >
            <div
              className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-md sm:rounded-xl lg:rounded-2xl transition-all relative overflow-hidden shadow-md sm:shadow-lg bg-white hover:bg-gray-50 flex items-center justify-center flex-shrink-0 animate-popIn"
              style={{ 
                perspective: '1000px',
                animationDelay: `${index * 0.05}s`
              }}
            >
              {/* Logo */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                style={{
                  backfaceVisibility: 'hidden',
                }}
              >
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className={
                      brand.name === 'Amazon' 
                        ? 'object-contain bg-white' 
                        : brand.name === 'Samsung'
                        ? 'object-cover scale-120'
                        :                       brand.name === 'Apple'
                        ? 'object-contain scale-150'
                        : brand.name === 'Formula 1'
                        ? 'object-contain scale-[2]'
                        : brand.name === 'TikTok'
                        ? 'object-contain scale-50'
                        : brand.name === 'OpenAI'
                        ? 'object-contain scale-180'
                        : brand.name === 'Commonwealth Bank'
                        ? 'object-contain scale-110'
                        : brand.name === 'The Walt Disney Company'
                        ? 'object-contain scale-95'
                        : brand.name === 'Tesla'
                        ? 'object-contain scale-95'
                        : brand.name === 'Netflix'
                        ? 'object-contain scale-50'
                        : brand.name === 'Canva'
                        ? 'object-contain scale-85'
                        : brand.name === 'NASA'
                        ? 'object-contain scale-70'
                        : brand.name === 'Scuderia Ferrari'
                        ? 'object-contain scale-[1.4]'
                        : brand.name === 'Google'
                        ? 'object-contain scale-150 translate-x-1'
                        : brand.name === 'SKIMS'
                        ? 'object-contain scale-700'
                        : brand.name === 'Coca-Cola'
                        ? 'object-contain scale-60'
                        : 'object-cover'
                    }
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span className="text-5xl font-black text-gray-800">
                      {brand.id}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 text-center px-2">
                      {brand.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Company Name Below - Hidden on mobile */}
            <p className="text-white font-semibold text-center text-sm drop-shadow-md hidden sm:block">{brand.name}</p>
          </button>
          ))}
        </div>
      </div>

      </div>
    </div>
  )
}
