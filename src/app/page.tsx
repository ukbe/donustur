import Logo from '@/components/common/Logo';

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
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="feature-block">
              <h3 className="text-xl font-semibold leading-7 text-gray-900">QR Kod ile Kolay Kullanım</h3>
              <p className="mt-2 text-base leading-7 text-gray-600">Akıllı geri dönüşüm kutularındaki QR kodları okutarak puan kazanın.</p>
            </div>
            <div className="feature-block">
              <h3 className="text-xl font-semibold leading-7 text-gray-900">Ödüller Kazanın</h3>
              <p className="mt-2 text-base leading-7 text-gray-600">Biriken puanlarınızı çeşitli ödüller için kullanın veya STK&apos;lara bağışlayın.</p>
            </div>
            <div className="feature-block">
              <h3 className="text-xl font-semibold leading-7 text-gray-900">Çevreye Katkıda Bulunun</h3>
              <p className="mt-2 text-base leading-7 text-gray-600">Geri dönüşüm yaparak sürdürülebilir bir gelecek için adım atın.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
