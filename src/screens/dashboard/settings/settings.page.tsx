"use client";

import { useState } from "react";
import { Container } from "@/shared/ui/container";
import { ProfileFormWidget } from "@/features/profile/widgets/profile-form.widget";
import { ReadingSectionWidget } from "@/features/profile/reading/widgets/reading-section.widget";
import { User, BookOpen, Bell, Shield, Info } from "lucide-react";

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const sections = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "reading", label: "Leitura", icon: BookOpen },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "privacy", label: "Privacidade", icon: Shield },
    { id: "about", label: "Sobre", icon: Info },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
        <div className="px-4 py-4 lg:px-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Configurações
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Gerencie sua conta
          </p>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        <Container>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 flex-shrink-0">
              <nav className="bg-white rounded-2xl shadow-sm p-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                        activeSection === section.id
                          ? "bg-accent-500 text-white"
                          : "text-gray-700 hover:bg-primary-200"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex-1">
              {activeSection === "profile" && <ProfileSection />}
              {activeSection === "reading" && <ReadingSectionWidget />}
              {activeSection === "notifications" && <NotificationsSection />}
              {activeSection === "privacy" && <PrivacySection />}
              {activeSection === "about" && <AboutSection />}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}

function ProfileSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Perfil</h2>
      
      <ProfileFormWidget />

      <div className="pt-6 border-t border-primary-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Segurança</h3>
        <button className="px-4 py-2 border border-primary-300 text-gray-700 rounded-xl font-medium hover:bg-primary-200 transition-colors">
          Alterar Senha
        </button>
      </div>

      <div className="pt-6 border-t border-primary-200">
        <button className="px-4 py-2 text-error hover:underline">
          Excluir Conta
        </button>
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
      
      <div className="space-y-4">
        {[
          { label: "Novas histórias de autores seguidos", description: "Seja notificado quando autores que você segue postarem" },
          { label: "Comentários", description: "Receba notificações de comentários" },
          { label: "Favoritos", description: "Quando alguém favoritar sua história" },
          { label: "Promoções", description: "Ofertas e promoções especiais" },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacySection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Privacidade</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Perfil público</p>
            <p className="text-sm text-gray-500">Outros usuários podem ver seu perfil</p>
          </div>
          <ToggleSwitch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Mostrar lendo agora</p>
            <p className="text-sm text-gray-500">Exiba as histórias que está lendo</p>
          </div>
          <ToggleSwitch defaultChecked />
        </div>
      </div>

      <div className="pt-4 border-t border-primary-200">
        <button className="px-4 py-2 text-error hover:underline">
          Exportar meus dados
        </button>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Sobre</h2>
      
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">ContaAI</h3>
          <p className="text-sm text-gray-500">Versão 1.0.0</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-500">
        <p>Uma plataforma para amantes de histórias e contos.</p>
        <p>Desenvolvido com Next.js, TypeScript e Supabase.</p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-primary-200">
        <button className="px-4 py-2 border border-primary-300 text-gray-700 rounded-xl font-medium hover:bg-primary-200 transition-colors text-sm">
          Termos de Uso
        </button>
        <button className="px-4 py-2 border border-primary-300 text-gray-700 rounded-xl font-medium hover:bg-primary-200 transition-colors text-sm">
          Política de Privacidade
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <button
      className={`relative w-12 h-6 rounded-full transition-colors ${
        defaultChecked ? "bg-accent-500" : "bg-primary-300"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          defaultChecked ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}
