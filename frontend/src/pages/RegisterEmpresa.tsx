import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { validateCNPJ } from '../utils/cnpj-validation';

export default function RegisterEmpresa() {
  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cnpjInvalido, setCnpjInvalido] = useState(false);
  const navigate = useNavigate();

  const buscarCep = async () => {
    if (cep.length < 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setUf(data.uf || '');
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCnpjInvalido(false);
    if (!validateCNPJ(cnpj)) {
      setCnpjInvalido(true);
      setLoading(false);
      return;
    }
    try {
      await api.post('/tenants/register', {
        nome,
        cnpj,
        razao_social: razaoSocial,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        uf,
        email,
        senha
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg grid grid-cols-1 gap-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center col-span-1">Cadastrar Empresa</h2>
        {error && <div className="mb-2 text-red-600 col-span-1">{error}</div>}
        {success && <div className="mb-2 text-green-600 col-span-1">Empresa cadastrada com sucesso! Redirecionando...</div>}
        <div>
          <label className="block mb-1 font-semibold">Nome fantasia</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Razão social</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">CNPJ</label>
          <input type="text" className={`w-full border rounded px-3 py-2 ${cnpjInvalido ? 'border-red-500' : ''}`} value={cnpj} onChange={e => setCnpj(e.target.value)} required maxLength={18} />
          {cnpjInvalido && <span className="text-red-500 text-xs">CNPJ inválido</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="block mb-1 font-semibold">CEP</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={cep} onChange={e => setCep(e.target.value)} onBlur={buscarCep} required maxLength={9} />
          </div>
          <div className="col-span-2">
            <label className="block mb-1 font-semibold">Endereço</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={endereco} onChange={e => setEndereco(e.target.value)} required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block mb-1 font-semibold">Número</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={numero} onChange={e => setNumero(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Bairro</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={bairro} onChange={e => setBairro(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Cidade</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={cidade} onChange={e => setCidade(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-semibold">UF</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={uf} onChange={e => setUf(e.target.value)} required maxLength={2} />
        </div>
        <div>
          <label className="block mb-1 font-semibold">E-mail</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Senha</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={senha} onChange={e => setSenha(e.target.value)} required />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar empresa'}
        </button>
      </form>
    </div>
  );
} 