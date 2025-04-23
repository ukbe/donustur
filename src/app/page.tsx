'use client';

import Logo from '@/components/common/Logo';
import {QrCodeIcon, GiftIcon, GlobeAltIcon} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { listCauses, type Cause } from '@/lib/api';
import Image from 'next/image';
import { getUrl } from 'aws-amplify/storage';

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

  // Create a duplicate array of causes to make the infinite scroll effect smoother
  const displayCauses = [...causes, ...causes, ...causes]; // Triple the array for smooth looping

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Desteklenen Kuruluşlar</h2>
      <div className="relative overflow-hidden mx-auto max-w-6xl h-24 bg-white rounded-lg shadow-md">
        <div 
          className="absolute flex space-x-12" 
          style={{
            animation: 'marquee 120s linear infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {displayCauses.map((cause, index) => (
            <div key={`${cause.id}-${index}`} className="flex-shrink-0 h-24 w-32 flex items-center justify-center p-2">
              {cause.logoUrl && signedImageUrls[cause.logoUrl] ? (
                <Image
                  src={signedImageUrls[cause.logoUrl]}
                  alt={cause.name}
                  width={96}
                  height={64}
                  className="object-contain max-h-full"
                />
              ) : (
                <div className="text-4xl text-green-600 font-bold w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                  {cause.name.charAt(0)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-200%);
          }
        }
      `}</style>
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
