import { QrCode, Settings, Wallet, Users, TrendingUp, Shield, Zap, HandCoins, ArrowRight, Sparkles, CheckCircle, Star, ChartBar, ChevronDown } from 'lucide-react';
import NavbarHome from '../../components/navbar/NavbarHome';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300 overflow-x-hidden">
      <NavbarHome />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* 1. Camada de Fundo (RAINBOW REMOVIDO) - Deixando um fundo mais escuro/limpo */}
        {/* O antigo div com o fundo arco-íris foi removido. */}

        {/* 2. Efeitos de Brilho Existentes (Círculos Blur) - Camada Z-[1] */}
        <div className="absolute inset-0 z-[1]">
          {/* Posicionamentos ajustados para centralizar o foco sem o arco-íris */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-br from-violet-600/10 via-blue-600/10 to-emerald-600/10 rounded-full blur-3xl animate-slow-pulse delay-300"></div>
        </div>

        {/* 3. Conteúdo Principal - Camada Z-10 (Acima de tudo) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 animate-fade-in">
              <Sparkles size={16} />
              Plataforma de Monetização para Criadores
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up">
              <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-white bg-clip-text text-transparent">
                Monetize. Engaje.
              </span>
              <br />
              {/* === EFEITO RAINBOW REMOVIDO, SUBSTUTUÍDO POR DESTAQUE SÓLIDO === */}
              <span className="text-blue-600 dark:text-blue-400">
                Cresça.
              </span>
              {/* ================================== */}
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed animate-slide-up delay-100">
              Mais engajamento, mais receita, mais liberdade para criar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up delay-200">
              <button
                onClick={() => navigate("/streamer/dashboard/login")}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                Acessar Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/streamer/dashboard/login")}
                className="px-8 py-4 bg-zinc-100 dark:bg-zinc-950 
              border border-zinc-300 dark:border-zinc-800 
              text-zinc-900 dark:text-white font-semibold rounded-xl 
              hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-all duration-200"
              >
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Comece a monetizar em apenas 3 passos simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Settings,
                title: 'Configuração',
                description: 'Configure os widgets de alerta em seu software de transmissão ou use uma integração.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: QrCode,
                title: 'Pagamento/Alerta',
                description: 'Seus espectadores enviam pagamentos com mensagem e são exibidos em sua transmissão.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Wallet,
                title: 'Carteira/Saque',
                description: 'O dinheiro fica disponível na hora e você saca os valores a partir de R$ 1,00 via Pix.',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((item, i) => (
              <div key={i} className="group relative p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-zinc-200 dark:border-zinc-800
">
                {/* Efeito de brilho no hover para o cartão */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `linear-gradient(45deg, ${item.color.replace('from-', '#').split(' ')[0]} 0%, ${item.color.replace('to-', '#').split(' ')[1]} 100%)`, filter: 'blur(30px)', zIndex: -1 }}>
                </div>
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mensagens Monetizadas */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300">
                Destaque
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white">
                Mensagens Monetizadas
              </h2>
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Receba mensagens via Pix ou Cartão de Crédito e exiba os alertas na sua transmissão em tempo real.
                </p>
              </div>
              <div className="space-y-3">
                {['Alertas personalizáveis', 'Integração com OBS', 'Pagamentos instantâneos'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/streamer/dashboard/login")}
                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Saiba mais
              </button>
            </div>
            <div className="relative group">
              {/* Aplica o 'group' aqui para que o hover funcione no container */}

              {/* Efeito de brilho que queremos animar: */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl 
                    transition-all duration-300 transform 
                    group-hover:scale-110"
              ></div>

              <div className="relative p-0 rounded-3xl shadow-3xl">
                <div className="aspect-square flex items-center justify-center">
                  <img
                    src="https://res.cloudinary.com/dvadwwvub/image/upload/v1759514467/banner-user-donate_ljjxvh.png"
                    alt="Exemplo de mensagem monetizada na tela"
                    className="rounded-3xl 
                  transition-transform duration-300 ease-in-out 
                  hover:rotate-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-100 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              O que nossos Criadores dizem
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Transformando paixão em profissão com a nossa plataforma.
            </p>
          </div>

          {/* Carrossel de Testemunhos (Simulado) */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: 'A melhor plataforma de doações que já usei! Fácil de configurar e a taxa é imbatível.', name: 'Streamer Alpha', handle: '@AlphaStream' },
              { quote: 'O Pix instantâneo mudou meu jogo. Recebo na hora e o suporte é incrível.', name: 'GamerBeta', handle: '@BetaGamer' },
              { quote: 'Finalmente uma solução que entende o criador brasileiro. Zero problemas!', name: 'Tia do Código', handle: '@TiaDoCodigo' },
            ].map((testimonial, i) => (
              <div key={i} className="p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-2xl transition-shadow">
                <Star size={20} className="text-yellow-500 fill-yellow-500 mb-4" />
                <p className="text-lg italic text-zinc-700 dark:text-zinc-300 mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{testimonial.handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SEPARADOR --- */}

      {/* Recursos */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Tudo que você precisa para crescer como criador
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Comunidade Engajada', desc: 'Conecte-se com sua audiência de forma mais próxima e autêntica' },
              { icon: TrendingUp, title: 'Crescimento Acelerado', desc: 'Aumente sua receita e expanda seu alcance rapidamente' },
              { icon: HandCoins, title: 'Menor Taxa', desc: 'Saque com a menor taxa possível.' },
              { icon: Shield, title: 'Pagamentos Seguros', desc: 'Transações protegidas e saques rápidos via Pix' },
              { icon: Zap, title: 'Integração Fácil', desc: 'Configure em minutos com OBS, Streamlabs e outras plataformas' },
              { icon: ChartBar, title: 'Análise de Desempenho', desc: 'Acompanhe métricas em tempo real para otimizar seus ganhos.' }
            ].map((feature, i) => (
              // === HOVER ADICIONADO AQUI ===
              <div key={i} className="group relative p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-zinc-200 dark:border-zinc-800 hover:border-blue-400/50">
                {/* Pseudo-elemento para brilho no hover (é necessário Tailwind config customizado, mas a classe simula o efeito) */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none bg-gradient-to-tr from-blue-500/50 to-purple-500/50 blur-xl z-[0]"></div>
                
                <div className="relative z-[1]">
                  <feature.icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4 group-hover:text-purple-600 transition-colors" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {feature.desc}
                  </p>
                </div>
              </div>
              // ==============================
            ))}
          </div>
        </div>
      </section>

      {/* --- SEPARADOR --- */}

      {/* Estatísticas */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Ajustado para 4 colunas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Criadores Ativos' },
              { value: 'R$1M+', label: 'Movimentado' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Suporte' }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                {/* === EFEITO RAINBOW REMOVIDO/AJUSTADO PARA GRADIENTE SUTIL === */}
                <div className="
                    text-4xl sm:text-5xl font-bold
                    bg-clip-text text-transparent
                    bg-gradient-to-r 
                    from-blue-600 to-purple-600
                    dark:from-violet-400 dark:to-fuchsia-400
                ">
                  {stat.value}
                </div>
                {/* =================================================== */}
                <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SEPARADOR --- */}

      {/* --- NOVA SEÇÃO: FAQ (Perguntas Frequentes) --- */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Respostas rápidas para as suas dúvidas mais comuns.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { question: 'Qual a taxa cobrada pela plataforma?', answer: 'Cobramos a menor taxa do mercado, apenas 2,9% por transação, garantindo mais lucro para você.' },
              { question: 'Quanto tempo leva para sacar o dinheiro?', answer: 'Os saques são instantâneos via Pix, disponíveis a partir de R$ ,00.' },
              { question: 'A plataforma é segura?', answer: 'Sim. Utilizamos criptografia de ponta e gateways de pagamento seguros para proteger todas as transações e dados.' }
            ].map((faq, i) => (
              <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                {/* Acordeão (simplesmente exibe, sem lógica de clique) */}
                <details className="p-4">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-zinc-900 dark:text-white">
                    {faq.question}
                    {/* Ícone de expansão (simulado) */}
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      <ChevronDown size={20} className="transform details-open:rotate-180 transition-transform duration-300" />
                    </span>
                  </summary>
                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700/50">
                    <p className="text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SEPARADOR --- */}

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para monetizar seu conteúdo?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a milhares de criadores que já estão transformando sua paixão em receita
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/streamer/dashboard/login")}
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-zinc-100 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Começar Agora
            </button>
            <button
              onClick={() => navigate("/streamer/dashboard/login")}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/30"
            >
              Ver Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-zinc-900 dark:bg-black text-center">
        <p className="text-zinc-400">
          © 2025 StreamPix. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;