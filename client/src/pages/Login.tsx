import { Building2, LockKeyhole, Mail, ArrowRight } from "lucide-react";
import { startLogin } from "@/const";

const LOGO = "/manus-storage/ip77-logo_ab23866c.png";

export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7fafc] px-5 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(23,63,107,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#173f6b] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[38px] border-[#0b9da7]/30" />
          <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full border-[30px] border-[#72d6d4]/20" />
          <div className="relative">
            <img src={LOGO} alt="IP77" className="h-16 w-auto brightness-0 invert" />
            <div className="mt-12 max-w-sm">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7bd7d6]">Workspace comercial</div>
              <h1 className="text-4xl font-black leading-tight tracking-[-0.04em]">Orçamentos IP77 para cada vendedor.</h1>
              <p className="mt-5 text-sm leading-6 text-blue-100/75">Entre com seu e-mail corporativo para acessar seu espaço e gerar propostas já preenchidas com seus dados.</p>
            </div>
          </div>
          <div className="relative flex items-center gap-3 text-xs text-blue-100/70"><Building2 size={16} className="text-[#7bd7d6]" /> Acesso exclusivo para a equipe IP77</div>
        </section>
        <section className="p-7 sm:p-12 lg:p-14">
          <img src={LOGO} alt="IP77" className="h-12 w-auto lg:hidden" />
          <div className="mt-8 lg:mt-12">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f7f7] text-[#0b8792]"><LockKeyhole size={20} /></div>
            <h2 className="text-2xl font-black tracking-tight text-[#173f6b]">Entrar no seu workspace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Use o e-mail da empresa para entrar ou fazer seu primeiro cadastro.</p>
            <button onClick={() => startLogin()} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173f6b] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(23,63,107,0.2)] transition hover:bg-[#0f3157] active:scale-[0.98]"><Mail size={17} /> Entrar com e-mail corporativo <ArrowRight size={16} /></button>
            <div className="mt-5 rounded-xl border border-[#d8ecee] bg-[#f5fbfb] p-4 text-xs leading-5 text-slate-500"><b className="text-[#173f6b]">Importante:</b> use seu endereço <span className="font-bold text-[#0b8792]">@ip77.com.br</span>. O cadastro é concluído no primeiro acesso.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
