function Resultado({ data }) {
  if (!data) return null;

  const esGood = data.prediction === 'good';
  const probabilityPercent = (Number(data.probability) * 100).toFixed(2);

  return (
    <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 animate-fade-in md:p-7">
      <h2 className="mb-5 text-xl font-bold text-slate-900 md:text-2xl">Resultado de la evaluacion</h2>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 ${esGood ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <span className={`text-lg ${esGood ? 'text-emerald-600' : 'text-rose-600'}`}>
            {esGood ? '✔' : '❌'}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prediccion</p>
            <p className={`text-lg font-bold ${esGood ? 'text-emerald-700' : 'text-rose-700'}`}>{data.prediction}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Probabilidad</p>
          <p className="text-2xl font-extrabold text-slate-900">{probabilityPercent}%</p>
        </div>
      </div>
    </div>
  );
}

export default Resultado;
