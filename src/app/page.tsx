import Logo from '@/components/common/Logo';
import {QrCodeIcon, GiftIcon, GlobeAltIcon} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'QR Kod ile Kolay Kullanım',
    description: 'Akıllı geri dönüşüm kutularındaki QR kodları okutarak puan kazanın.',
    href: '#',
    icon: QrCodeIcon,
  },
  {
    name: 'Ödüller Kazanın',
    description: 'Biriken puanlarınızı çeşitli ödüller için kullanın veya STK&apos;lara bağışlayın.',
    href: '#',
    icon: GiftIcon,
  },
  {
    name: 'Çevreye Katkıda Bulunun',
    description: 'Geri dönüşüm yaparak sürdürülebilir bir gelecek için adım atın.',
    href: '#',
    icon: GlobeAltIcon,
  },
];

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
                href="/signup"
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

      {/* Feature Blocks */}
      <div className="bg-gray-50/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl sm:mt-20 lg:mt-24 px-6 lg:px-8">
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
