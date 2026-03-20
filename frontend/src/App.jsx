import { useState } from 'react';
import Formulario from './components/Formulario';
import Resultado from './components/Resultado';
import { predecirRiesgo } from './services/api';

function App() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (payload) => {
    setLoading(true);
    setError('');

    try {
      const data = await predecirRiesgo(payload);
      setResultado(data);
    } catch (err) {
      setResultado(null);
      setError(err.message || 'Error al conectar con la API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-4 py-10 md:py-14">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/95 p-5 shadow-2xl shadow-slate-900/30 backdrop-blur md:p-8">
        <div className="mb-8 text-center md:mb-10">
          <p className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
            Inteligencia de Riesgo Crediticio
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">Predictor de riesgo Crediticio</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
            Evalua el riesgo del solicitante en segundos.
          </p>
        </div>

        <Formulario onSubmit={handlePredict} loading={loading} />

        {error && (
          <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm animate-fade-in">
            {error}
          </p>
        )}

        <Resultado data={resultado} />
      </div>
    </main>
  );
}

export default App;
