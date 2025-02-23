import Logo from '@/components/common/Logo';
import {PencilSquareIcon, QrCodeIcon, LinkIcon, LockClosedIcon, StarIcon} from '@heroicons/react/24/outline';

const steps = [
  {
    title: 'Hesap Oluşturun',
    description: 'Dönüştür uygulamasını kullanmaya başlamak için ücretsiz bir hesap oluşturun.',
    icon: PencilSquareIcon,
  },
  {
    title: 'QR Kodu Tarayın',
    description: 'Akıllı geri dönüşüm kutusundaki QR kodu telefonunuzun kamerası ile tarayın.',
    icon: QrCodeIcon,
  },
  {
    title: 'Bağlantıya Tıklayın',
    description: 'Telefonunuzda beliren bağlantıya tıklayarak Dönüştür uygulamasına yönlendirilirsiniz.',
    icon: LinkIcon,
  },
  {
    title: 'Giriş Yapın',
    description: 'Eğer oturum açık değilse, hesabınıza giriş yapın.',
    icon: LockClosedIcon,
  },
  {
    title: 'Puanları Kazanın',
    description: 'Geri dönüşüm işleminiz onaylanır ve hesabınıza puanlar eklenir.',
    icon: StarIcon,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Logo className="mx-auto mb-8" />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Nasıl Çalışır?</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">Dönüştür ile geri dönüşüm yapmak ve ödüller kazanmak çok kolay.</p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10">
            {steps.map((step, index) => (
              <div key={index} className="relative pl-16">
                <dt className="text-2xl font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                    <step.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {step.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{step.description}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-16 text-center">
            <a
              href="/signup"
              className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Hemen Başla
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
