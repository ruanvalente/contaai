"use client";

import { Container } from "@/shared/ui/container";

export function AudioPage() {
  return (
    <>
      <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
        <div className="px-4 py-4 lg:px-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Audio Books
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Escute suas histórias
          </p>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        <Container>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border border-amber-100">
              <div className="flex flex-col items-center text-center py-8 sm:py-12">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-accent-500/10 rounded-full flex items-center justify-center mb-6 relative">
                  <HeadphonesIcon className="w-12 h-12 sm:w-14 sm:h-14 text-accent-500" />
                  <span className="absolute -top-1 -right-1 bg-warning text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    SOON
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Em Breve
                </h2>
                <p className="text-gray-500 mb-6 max-w-md px-4">
                  Estamos trabalhando para trazer a experiência de audio books
                  para você. Em breve você poderá ouvir seus livros favoritos em
                  qualquer lugar.
                </p>
                <div className="flex items-center gap-2 text-sm text-accent-600 bg-accent-100 px-4 py-2 rounded-full">
                  <ClockIcon className="w-4 h-4" />
                  <span>Lançamento previsto: em breve...</span>
                </div>
              </div>
            </div>

            <div className="border-t border-primary-300 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                O que está por vir
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FeatureCard
                  icon={<PlayIcon className="w-5 h-5" />}
                  title="Narração profissional"
                  description="Histórias narradas por profissionais"
                  bgColor="bg-purple-100"
                  iconColor="text-purple-600"
                />
                <FeatureCard
                  icon={<SpeedIcon className="w-5 h-5" />}
                  title="Controle de velocidade"
                  description="Ouça em 0.5x até 2x"
                  bgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <FeatureCard
                  icon={<DownloadIcon className="w-5 h-5" />}
                  title="Download offline"
                  description="Ouça sem internet"
                  bgColor="bg-green-100"
                  iconColor="text-green-600"
                />
                <FeatureCard
                  icon={<SleepIcon className="w-5 h-5" />}
                  title="Timer de sono"
                  description="Desligamento automático"
                  bgColor="bg-orange-100"
                  iconColor="text-orange-600"
                />
              </div>
            </div>

            <div className="border-t border-primary-300 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Prévia do Player
              </h3>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-primary-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-linear-to-br from-accent-400 to-accent-600 flex items-center justify-center shrink-0 animate-pulse">
                    <BookAudioIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="h-4 bg-primary-200 rounded w-32 mx-auto sm:mx-0 mb-2" />
                    <div className="h-3 bg-primary-200 rounded w-24 mx-auto sm:mx-0 mb-4" />
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
                        <SkipBackIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="w-14 h-14 rounded-full bg-accent-500 flex items-center justify-center">
                        <PlayIcon className="w-6 h-6 text-white ml-1" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
                        <SkipForwardIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 px-2">
                  <div className="w-full h-2 bg-primary-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-accent-500 rounded-full" />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">1:24</span>
                    <span className="text-xs text-gray-400">45:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  bgColor,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-primary-200">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 ${iconColor}`}
        >
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function SpeedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SleepIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function BookAudioIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 10l2 2 4-4" />
    </svg>
  );
}

function SkipBackIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="19 20 9 12 19 4 19 20" />
      <line x1="5" y1="19" x2="5" y2="5" />
    </svg>
  );
}

function SkipForwardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}
