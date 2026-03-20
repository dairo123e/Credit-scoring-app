import { useState } from 'react';

const initialForm = {
  Age: 42,
  Sex: 'male',
  Job: 3,
  Housing: 'own',
  'Saving accounts': 'rich',
  'Checking account': 'rich',
  'Credit amount': 5000,
  Duration: 12,
  Purpose: 'car'
};

function Formulario({ onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validar = () => {
    if (Number(form.Age) <= 0) return 'Age must be greater than 0';
    if (Number(form.Job) < 0 || Number(form.Job) > 3) return 'Job must be between 0 and 3';
    if (Number(form['Credit amount']) <= 0) return 'Credit amount must be greater than 0';
    if (Number(form.Duration) <= 0) return 'Duration must be greater than 0';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validar();

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setError('');
    await onSubmit({
      ...form,
      Age: Number(form.Age),
      Job: Number(form.Job),
      'Credit amount': Number(form['Credit amount']),
      Duration: Number(form.Duration)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 md:grid-cols-2 md:p-7">
      <h2 className="md:col-span-2 text-xl font-bold text-slate-900 md:text-2xl">Applicant Data</h2>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Age
        <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" type="number" value={form.Age} onChange={(e) => handleChange('Age', e.target.value)} />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Sex
        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" value={form.Sex} onChange={(e) => handleChange('Sex', e.target.value)}>
          <option value="male">male</option>
          <option value="female">female</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Job
        <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" type="number" min="0" max="3" value={form.Job} onChange={(e) => handleChange('Job', e.target.value)} />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Housing
        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" value={form.Housing} onChange={(e) => handleChange('Housing', e.target.value)}>
          <option value="own">own</option>
          <option value="rent">rent</option>
          <option value="free">free</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Saving accounts
        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" value={form['Saving accounts']} onChange={(e) => handleChange('Saving accounts', e.target.value)}>
          <option value="NA">NA</option>
          <option value="little">little</option>
          <option value="moderate">moderate</option>
          <option value="quite rich">quite rich</option>
          <option value="rich">rich</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Checking account
        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" value={form['Checking account']} onChange={(e) => handleChange('Checking account', e.target.value)}>
          <option value="NA">NA</option>
          <option value="little">little</option>
          <option value="moderate">moderate</option>
          <option value="rich">rich</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Credit amount
        <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" type="number" value={form['Credit amount']} onChange={(e) => handleChange('Credit amount', e.target.value)} />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Duration
        <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" type="number" value={form.Duration} onChange={(e) => handleChange('Duration', e.target.value)} />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
        Purpose
        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" value={form.Purpose} onChange={(e) => handleChange('Purpose', e.target.value)}>
          <option value="car">car</option>
          <option value="furniture/equipment">furniture/equipment</option>
          <option value="radio/TV">radio/TV</option>
          <option value="domestic appliances">domestic appliances</option>
          <option value="repairs">repairs</option>
          <option value="education">education</option>
          <option value="business">business</option>
          <option value="vacation/others">vacation/others</option>
        </select>
      </label>

      {error && (
        <p className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 animate-fade-in">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="md:col-span-2 group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition duration-300 hover:-translate-y-0.5 hover:from-sky-700 hover:to-cyan-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
        )}
        {loading ? 'Predicting risk...' : 'Predict risk'}
      </button>
    </form>
  );
}

export default Formulario;
