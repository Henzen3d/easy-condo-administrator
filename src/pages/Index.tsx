
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building, CreditCard, Home, Users, FileText, BarChart4, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./Dashboard";

const FeatureCard = ({ icon, title, description, link }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="mb-4 text-muted-foreground">{description}</p>
        <Link to={link}>
          <Button variant="outline" className="w-full justify-between">
            Acessar
            <ArrowRight size={16} />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const Index = () => {
  // No login system implemented yet, so we're simulating a logged-in state
  const [isLoggedIn] = useState(true);

  // If the user is logged in, redirect to the dashboard
  if (isLoggedIn) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

  // This is the landing page for non-logged-in users
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 text-white p-1.5 rounded-md flex items-center justify-center">
              <Building size={24} />
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              <span className="text-primary-600">Condo</span>
              <span className="text-gray-800 dark:text-gray-200">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost">Sobre</Button>
            <Button variant="ghost">Recursos</Button>
            <Button variant="ghost">Preços</Button>
            <Button variant="ghost">Contato</Button>
            <Button>Entrar</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12">
        <section className="mb-20 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-slide-in-top">
            Gestão de Condomínios<br />
            <span className="text-primary-600">Simples e Eficiente</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground animate-slide-in-top animation-delay-200">
            Controle completo das finanças, unidades e moradores do seu condomínio em uma única plataforma
          </p>
          <div className="flex justify-center gap-4 animate-slide-in-top animation-delay-300">
            <Button size="lg" className="gap-2">
              Começar Agora
              <ArrowRight size={16} />
            </Button>
            <Button size="lg" variant="outline">
              Ver Demonstração
            </Button>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Recursos Principais
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Home size={24} />}
              title="Gestão de Unidades"
              description="Cadastre e gerencie todas as unidades e moradores do condomínio."
              link="/units"
            />
            <FeatureCard
              icon={<CreditCard size={24} />}
              title="Contas Bancárias"
              description="Controle as contas bancárias do condomínio e suas movimentações."
              link="/bank-accounts"
            />
            <FeatureCard
              icon={<BarChart4 size={24} />}
              title="Transações"
              description="Registre receitas, despesas e acompanhe o fluxo financeiro."
              link="/transactions"
            />
            <FeatureCard
              icon={<FileText size={24} />}
              title="Cobranças"
              description="Emita e gerencie cobranças para os moradores do condomínio."
              link="/billing"
            />
            <FeatureCard
              icon={<Users size={24} />}
              title="Relatórios"
              description="Gere relatórios detalhados para acompanhar o desempenho financeiro."
              link="/reports"
            />
            <FeatureCard
              icon={<Settings size={24} />}
              title="Configurações"
              description="Personalize as configurações do condomínio conforme suas necessidades."
              link="/settings"
            />
          </div>
        </section>

        <section className="mb-20">
          <div className="glass-morphism rounded-3xl p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <h2 className="mb-4 text-3xl font-bold tracking-tight">
                  Facilite a gestão do seu condomínio
                </h2>
                <p className="mb-6 text-lg text-muted-foreground">
                  O CondoAdmin simplifica todas as tarefas administrativas do seu condomínio, 
                  desde o controle financeiro até a comunicação com moradores. Tudo isso
                  em uma interface intuitiva e fácil de usar.
                </p>
                <ul className="mb-8 space-y-4">
                  {[
                    "Dashboard com visão geral das finanças",
                    "Gestão completa de moradores e unidades",
                    "Controle de contas bancárias e saldos",
                    "Registro de receitas e despesas",
                    "Emissão de cobranças e boletos",
                    "Relatórios financeiros detalhados"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-primary-600"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="gap-2">
                  Saiba Mais
                  <ArrowRight size={16} />
                </Button>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Condomínio moderno"
                  className="rounded-xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="text-center mb-12">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Pronto para começar?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Experimente o CondoAdmin hoje mesmo e descubra como é fácil gerenciar seu condomínio
          </p>
          <Button size="lg" className="gap-2">
            Criar Conta Grátis
            <ArrowRight size={16} />
          </Button>
        </section>
      </main>

      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary-600 text-white p-1.5 rounded-md flex items-center justify-center">
                  <Building size={18} />
                </div>
                <span className="text-xl font-semibold tracking-tight">
                  <span className="text-primary-600">Condo</span>
                  <span className="text-gray-800 dark:text-gray-200">Admin</span>
                </span>
              </div>
              <p className="text-muted-foreground">
                Solução completa para administração de condomínios.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Produto</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto">Recursos</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Preços</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Demonstração</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Suporte</Button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto">Sobre nós</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Contato</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Blog</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Termos</Button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Contato</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>contato@condoadmin.com</li>
                <li>(11) 9 1234-5678</li>
                <li>Av. Paulista, 1000 - São Paulo/SP</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-muted-foreground">
            © {new Date().getFullYear()} CondoAdmin. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
