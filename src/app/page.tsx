'use client';

import Logo from '@/components/common/Logo';
import {QrCodeIcon, GiftIcon, GlobeAltIcon} from '@heroicons/react/24/outline';
import { useEffect, useState, useRef } from 'react';
import { listCauses, type Cause } from '@/lib/api';
import Image from 'next/image';
import { getUrl } from 'aws-amplify/storage';
import Link from 'next/link';

const features = [
  {
    name: 'QR Kod ile Kolay Kullanım',
    description: 'Akıllı geri dönüşüm kutularındaki QR kodları okutarak puan kazanın.',
    href: '/about',
    icon: QrCodeIcon,
  },
  {
    name: 'Ödüller Kazanın',
    description: "Biriken puanlarınızı çeşitli ödüller için kullanın veya STK'lara bağışlayın.",
    href: '/about',
    icon: GiftIcon,
  },
  {
    name: 'Çevreye Katkıda Bulunun',
    description: 'Geri dönüşüm yaparak sürdürülebilir bir gelecek için adım atın.',
    href: '/about',
    icon: GlobeAltIcon,
  },
];

function CausesSlider() {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [signedImageUrls, setSignedImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCauses() {
      try {
        // Load causes
        const causesList = await listCauses(true); // Only active causes
        setCauses(causesList);

        // Get signed URLs for all logos
        const urls: Record<string, string> = {};
        for (const cause of causesList) {
          if (cause.logoUrl) {
            try {
              const { url } = await getUrl({
                path: cause.logoUrl,
                options: {
                  bucket: 'donustur-templates',
                  expiresIn: 3600,
                }
              });
              urls[cause.logoUrl] = url.toString();
            } catch (e) {
              console.error('Error getting signed URL for', cause.logoUrl, e);
            }
          }
        }
        setSignedImageUrls(urls);
      } catch (error) {
        console.error('Error loading causes:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCauses();
  }, []);

  useEffect(() => {
    // Auto-rotate slides every 5 seconds if causes exist
    if (causes.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % causes.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [causes.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + causes.length) % causes.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % causes.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-pulse text-green-600">Yükleniyor...</div>
      </div>
    );
  }

  if (causes.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Desteklediğimiz Kurumlar</h2>
      <div className="relative overflow-hidden rounded-lg shadow-md mx-auto max-w-3xl">
        <div 
          ref={sliderRef}
          className="flex transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {causes.map((cause) => (
            <div key={cause.id} className="w-full flex-shrink-0">
              <div className="bg-white p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                    {cause.logoUrl && signedImageUrls[cause.logoUrl] ? (
                      <Image
                        src={signedImageUrls[cause.logoUrl]}
                        alt={cause.name}
                        width={128}
                        height={128}
                        className="object-contain"
                      />
                    ) : (
                      <div className="text-4xl text-green-600 font-bold">
                        {cause.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{cause.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{cause.description}</p>
                <div className="text-green-600 font-medium mb-3">{cause.credits} puan değerinde destek</div>
                <Link 
                  href="/signin" 
                  className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-500 transition-colors"
                >
                  Desteklemek İçin Giriş Yap
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
          onClick={handlePrevSlide}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-800">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        
        <button 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
          onClick={handleNextSlide}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-800">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
          {causes.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-green-600' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Logo className="mx-auto mb-8" width={360} height={120} />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Geri dönüşüm ile dünyayı değiştirin</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">Her geri dönüşüm ile puan kazanın, çevreye katkıda bulunun ve ödüller kazanın.</p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/signin"
                className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Hemen Başla
              </a>
              <a href="/about" className="text-sm font-semibold leading-6 text-gray-900">
                Daha Fazla Bilgi <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Causes Slider Section */}
      <div className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <CausesSlider />
        </div>
      </div>

      {/* Feature Blocks */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-green-500">
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a href={feature.href} className="text-sm/6 font-semibold">
                      daha fazla bilgi <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
