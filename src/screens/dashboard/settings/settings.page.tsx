"use client";

import { useState } from "react";
import { Container } from "@/shared/ui/container";
import { Avatar } from "@/shared/ui/avatar";
import { User, Palette, BookOpen, Bell, Shield, Info, Sun, Moon, Monitor } from "lucide-react";

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const sections = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "appearance", label: "Aparência", icon: Palette },
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
              {activeSection === "appearance" && <AppearanceSection />}
              {activeSection === "reading" && <ReadingSection />}
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
      
      <div className="flex items-center gap-4">
        <Avatar name="Usuário" size="lg" />
        <button className="text-sm text-accent-600 hover:underline">
          Alterar foto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            type="text"
            defaultValue="Usuário"
            className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            defaultValue="usuario@email.com"
            className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          rows={3}
          placeholder="Conte um pouco sobre você..."
          className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-primary-200">
        <button className="px-6 py-2.5 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors">
          Salvar Alterações
        </button>
        <button className="px-6 py-2.5 border border-primary-300 text-gray-700 rounded-xl font-medium hover:bg-primary-200 transition-colors">
          Cancelar
        </button>
      </div>

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

function AppearanceSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Aparência</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
        <div className="grid grid-cols-3 gap-3">
          {["light", "dark", "system"].map((theme) => (
            <button
              key={theme}
              className={`p-4 rounded-xl border-2 transition-colors ${
                theme === "light" 
                  ? "border-accent-500 bg-accent-500/5" 
                  : "border-primary-300 hover:border-accent-500"
              }`}
            >
              <div className="w-full h-12 bg-primary-100 rounded-lg mb-2 flex items-center justify-center">
                {theme === "light" && <Sun className="w-6 h-6 text-warning" />}
                {theme === "dark" && <Moon className="w-6 h-6 text-gray-600" />}
                {theme === "system" && <Monitor className="w-6 h-6 text-gray-600" />}
              </div>
              <span className="text-sm font-medium text-gray-700 capitalize">{theme}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Fonte</label>
        <select className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500">
          <option>Inter (Padrão)</option>
          <option>Playfair Display</option>
          <option>Georgia</option>
        </select>
      </div>

      <button className="px-6 py-2.5 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors">
        Aplicar
      </button>
    </div>
  );
}

function ReadingSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Preferências de Leitura</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Tamanho da fonte</p>
            <p className="text-sm text-gray-500">Ajuste o tamanho do texto</p>
          </div>
          <select className="px-4 py-2 border border-primary-300 rounded-xl">
            <option>16px</option>
            <option>18px</option>
            <option>20px</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Modo noturno</p>
            <p className="text-sm text-gray-500">Reduz brilho para leitura</p>
          </div>
          <ToggleSwitch />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Auto-scroll</p>
            <p className="text-sm text-gray-500">Role automaticamente</p>
          </div>
          <ToggleSwitch defaultChecked />
        </div>
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
