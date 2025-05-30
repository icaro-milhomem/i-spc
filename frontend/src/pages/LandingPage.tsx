import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Grátis',
    price: 'R$0',
    features: [
      'Cadastro de até 10 clientes',
      'Consulta de CPF ilimitada',
      'Dashboard básico',
      'Suporte por e-mail'
    ],
    highlight: false
  },
  {
    name: 'Pro',
    price: 'R$49/mês',
    features: [
      'Clientes ilimitados',
      'Consulta de CPF ilimitada',
      'Dashboard avançado',
      'Suporte prioritário',
      'Exportação de relatórios'
    ],
    highlight: true
  },
  {
    name: 'Empresarial',
    price: 'Sob consulta',
    features: [
      'Tudo do Pro',
      'Integração API',
      'Onboarding personalizado',
      'Suporte dedicado'
    ],
    highlight: false
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <header className="w-full py-8 bg-white shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="P-SPC Logo" className="w-14 h-14" />
            <span className="text-3xl font-bold text-blue-700">P-SPC</span>
          </div>
          <Link to="/register">
            <button className="mt-4 md:mt-0 px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition">Cadastrar empresa</button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <section className="max-w-3xl text-center mt-12 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4">Proteja seu provedor, registre devedores, previna inadimplência</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            O <span className="font-bold text-blue-700">P-SPC</span> é a solução SaaS para provedores de internet e empresas que desejam registrar dívidas, consultar CPFs e compartilhar informações de inadimplência de forma segura, colaborativa e eficiente.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {plans.map(plan => (
              <div key={plan.name} className={`flex-1 bg-white rounded-xl shadow-lg p-6 border-2 ${plan.highlight ? 'border-blue-700 scale-105' : 'border-gray-200'} transition`}> 
                <h2 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-blue-700' : 'text-gray-800'}`}>{plan.name}</h2>
                <div className="text-3xl font-extrabold mb-4">{plan.price}</div>
                <ul className="text-left mb-6 space-y-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-gray-700">
                      <span className="text-blue-600">•</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <button className={`w-full py-2 rounded-lg font-semibold ${plan.highlight ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} transition`}>
                    {plan.name === 'Grátis' ? 'Começar grátis' : 'Quero este plano'}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-white border-t text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} P-SPC - Todos os direitos reservados
      </footer>
    </div>
  );
} 