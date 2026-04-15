import Link from "next/link";
import { Header as LandingHeader } from "@/features/discovery/widgets/landing-header.widget";
import { Hero as LandingHero } from "@/features/discovery/widgets/landing-hero.widget";
import { BookCarousel as LandingBookCarousel } from "@/features/discovery/widgets/landing-book-carousel.widget";
import { Container } from "@/shared/ui/container.ui";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-primary-100">
      <LandingHeader />
      <LandingHero />

      <section id="my-authors" className="py-20 bg-primary-200">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
              Meus Autores
            </h2>
            <p className="text-gray-700 max-w-xl mx-auto">
              Acompanhe seus autores favoritos e descubra novas histórias.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Maria Silva", stories: 12 },
              { name: "João Pedro", stories: 8 },
              { name: "Ana Clara", stories: 15 },
            ].map((author) => (
              <div
                key={author.name}
                className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-gray-700 font-display">
                    {author.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {author.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {author.stories} histórias publicadas
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <LandingBookCarousel />

      <section id="community" className="py-20 bg-primary-100">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
              Comunidade
            </h2>
            <p className="text-gray-700 max-w-xl mx-auto">
              Conecte-se com outros escritores e amantes da literatura.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                title: "Fóruns de Discussão",
                desc: "Participe de conversas sobre literatura",
              },
              {
                title: "Eventos Literários",
                desc: "Workshops e encontros online",
              },
              {
                title: "Feedback entre Autores",
                desc: "Receba e ofereça críticas construtivas",
              },
              {
                title: "Desafios de Escrita",
                desc: "Participe de desafios mensais",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-accent-100 rounded-lg p-6 hover:bg-accent-100/80 transition-colors cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="contributes" className="py-20 bg-primary-200">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
              Contribua
            </h2>
            <p className="text-gray-700 max-w-xl mx-auto mb-8">
              Compartilhe suas histórias com a comunidade. É grátis e simples.
            </p>
            <Link
              href="/register"
              className="inline-block bg-accent-500 text-white px-8 py-4 rounded-full font-medium hover:bg-accent-600 transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </Container>
      </section>

      <footer className="py-12 bg-primary-300">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xl font-display font-bold text-gray-900">
                Conta<span className="text-accent-500">AI</span>
              </span>
              <p className="text-gray-700 text-sm mt-2">
                Compartilhando histórias desde 2026
              </p>
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-gray-700 hover:text-accent-500 transition-colors text-sm"
              >
                Termos
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-accent-500 transition-colors text-sm"
              >
                Privacidade
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-accent-500 transition-colors text-sm"
              >
                Contato
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700/20 text-center">
            <p className="text-gray-500 text-sm">
              © 6 ContaAI. Todos os direitos reservados.
            </p>
          </div>
        </Container>
      </footer>
    </main>
  );
}