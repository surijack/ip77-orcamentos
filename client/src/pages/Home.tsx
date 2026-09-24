import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  CloudUpload,
  Download,
  FileCheck2,
  FileText,
  History,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  MoreHorizontal,
  PackageCheck,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const LOGO = "/manus-storage/ip77-logo_ab23866c.png";
const IP77_COMPANY = {
  cnpj: "42.643.561/0002-30",
  address: "TR TRECHO 04 SIA SUL LOTE 42",
  neighborhood: "ZONA INDUSTRIAL (GUARA)",
  state: "DF",
};

const proposalObservations = {
  general: [
    "Essa PROPOSTA tem validade de 5 dias ou enquanto durar o estoque;",
    "Pedidos emitidos possuem o prazo de 5 dias para a efetivação do pagamento, após isso pode ser cancelado;",
  ],
  products: [
    "Realize a conferência dos itens listados neste orçamento antes de formalizar o pedido. Garanta que os produtos, quantidades, especificações técnicas e demais informações estejam em conformidade com as suas necessidades e expectativas, evitando qualquer tipo de erro ou divergência.",
    "A responsabilidade pela configuração dos kits orçados é inteiramente do integrador. Ao confirmar o pedido, o cliente assume que todos os produtos e condições atendem plenamente aos requisitos do projeto. Qualquer modificação ou solicitação de ajustes posteriores poderá acarretar em alterações de prazo e custo.",
  ],
  delivery: [
    "Esteja preparado para o recebimento de seu produto no dia previsto da entrega, a transportadora entrará em contato para alinhar a entrega com antecedência de 24Horas com o integrador ou cliente final (integrador esteja alinhado com seu cliente final, referente ao recebimento do produto e orientações abaixo).",
    "Se a transportadora aparecer com o produto para descarga sem aviso prévio e não tiver como efetuar a descarga, pode solicitar a volta do material e alinhar a entrega para o dia seguinte.",
    "No ato do recebimento conferir a quantidade de volumes físicos X a quantidade de volumes indicadas na NF/CCe.",
    "Para facilitar a conferência, enviamos juntos com a NF a lista dos componentes com a descrição individual de cada item.",
    "É primordial que seja feita a conferência (módulos, inversores, estruturas e etc.) para evitar recebimento de modelos e quantidades erradas.",
    "Verificar se algum volume tem sinais de violação ou varia do produto.",
    "Se for detectado algum tipo de avaria ou problema com seu pedido é fundamental que seja fotografado ou realizar a filmagem dos volumes recebidos com as fotos das etiquetas dos volumes e produtos.",
    "Em casos de qualquer problema (FALTA, SOBRA, AVARIA, etc), informe na frente da CTE (documento de transporte) e envie ao seu vendedor as imagens do documento e do produto danificado.",
    "O prazo para retorno é de 48 horas para avaliar o caso e retornar com a solução.",
    "Em caso de Entrega frete (FOB) por conta do cliente: Responsabilidade 100% do Integrador, sem ação da distribuidora em caso de danos e problemas.",
    "Em caso de Entrega frete (CIF) por conta da ip77 * Sem contratação de descarga, abaixo orientações: ATENÇÃO! A obrigatoriedade da descarga é do Integrador. A descarga do material não está inclusa no valor do frete e todas as descargas que necessitem de equipamentos (exemplo empilhadeira, guindaste, mão de obra, entre outros) ficará sob responsabilidade do integrador.",
  ],
};

type QuoteItem = {
  id: number;
  name: string;
  code: string;
  quantity: string;
};

type CustomerData = {
  name: string;
  document: string;
  address: string;
  cityState: string;
  phone: string;
};

type SellerData = {
  name: string;
  email: string;
  phone: string;
};

type SessionUser = {
  name: string | null;
  email: string | null;
};

const emptyCustomer: CustomerData = { name: "", document: "", address: "", cityState: "", phone: "" };
const emptySeller: SellerData = { name: "", email: "", phone: "" };
const defaultSellers: SellerData[] = [
  { name: "Lucas Souza", email: "lucas.ferreira@ip77.com.br", phone: "(61) 99110-7925" },
  { name: "Nathalia Silva", email: "nathalia.silva@ip77.com.br", phone: "(61) 99438-5688" },
];
const SELLERS_STORAGE_KEY = "ip77-sellers";

const recentQuotes = [
  { name: "Cotação WEB-006817086", client: "Projeto residencial · 24,8 kWp", date: "Hoje, 14:38", status: "Pronta", value: "R$ 61.911,91" },
  { name: "Cotação WEB-006816942", client: "Integração comercial · 48 kWp", date: "Ontem, 17:12", status: "Pronta", value: "R$ 108.450,00" },
  { name: "Cotação WEB-006816511", client: "Usina rural · 72 kWp", date: "22 set, 09:43", status: "Rascunho", value: "R$ 149.860,20" },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

function Sidebar({ active, onNavigate }: { active: string; onNavigate: (label: string) => void }) {
  const links = [
    { label: "Visão geral", icon: LayoutDashboard },
    { label: "Nova proposta", icon: Plus },
    { label: "Histórico", icon: History },
  ];
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col print:hidden">
      <div className="flex h-[86px] items-center border-b border-slate-100 px-7">
        <img src={LOGO} alt="IP77" className="h-[48px] w-auto object-contain" />
        <div className="ml-3 border-l border-slate-200 pl-3">
          <div className="text-sm font-bold tracking-tight text-[#173f6b]">ORÇAMENTOS</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-slate-400">painel interno</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-7">
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</div>
        {links.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onNavigate(label)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all duration-200 ${active === label ? "bg-[#eaf6f7] text-[#0b8792] shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-[#173f6b]"}`}
          >
            <Icon size={18} strokeWidth={active === label ? 2.5 : 2} />
            {label}
            {label === "Nova proposta" && <span className="ml-auto rounded-md bg-[#0b8792] px-1.5 py-0.5 text-[10px] font-bold text-white">+</span>}
          </button>
        ))}
        <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Preferências</div>
        {[
          { label: "Configurações", icon: Settings2 },
          { label: "Ajuda e suporte", icon: LifeBuoy },
        ].map(({ label, icon: Icon }) => (
          <button key={label} onClick={() => onNavigate(label)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-[#173f6b]">
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
      <div className="mx-4 mb-5 rounded-2xl bg-[#f2f8fb] p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#173f6b]"><Sparkles size={14} className="text-[#0b9da7]" /> Automação IP77</div>
        <p className="mt-2 text-[11px] leading-4 text-slate-500">Padronize propostas em poucos minutos e mantenha a sua identidade em cada envio.</p>
      </div>
    </aside>
  );
}

function Topbar({ onHelp, user, onLogout }: { onHelp: () => void; user?: SessionUser; onLogout?: () => Promise<void> }) {
  return (
    <header className="flex h-[86px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 print:hidden">
      <div className="flex items-center gap-3">
        <img src={LOGO} alt="IP77" className="h-10 w-auto" />
        <div className="text-xs font-bold tracking-[0.16em] text-[#173f6b]">ORÇAMENTOS</div>
      </div>
      <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex"><span className="font-semibold text-slate-600">Workspace</span><span>/</span><span>Visão geral</span></div>
      <div className="ml-auto flex items-center gap-3">
        <button onClick={onHelp} className="hidden items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 sm:flex"><CircleHelp size={16} /> Como funciona?</button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dff3f4] text-xs font-black text-[#0b8792]">IP</div>
          <div className="hidden sm:block"><div className="text-xs font-bold text-slate-700">{user?.name || user?.email || "Equipe IP77"}</div><div className="text-[10px] text-slate-400">{user?.email || "Seleção manual de vendedor"}</div></div>
          {onLogout ? <button onClick={() => void onLogout()} title="Sair" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><ChevronDown size={15} className="rotate-180" /></button> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </div>
    </header>
  );
}

function UploadCard({ file, isDragging, onFile, onDrop, onClear, inputRef }: { file: File | null; isDragging: boolean; onFile: (file: File) => void; onDrop: (event: React.DragEvent<HTMLDivElement>) => void; onClear: () => void; inputRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div
      onDragOver={(event) => { event.preventDefault(); }}
      onDragEnter={(event) => { event.preventDefault(); }}
      onDrop={onDrop}
      onClick={() => !file && inputRef.current?.click()}
      className={`group relative cursor-pointer overflow-hidden rounded-[24px] border border-dashed p-7 transition-all duration-200 sm:p-9 ${isDragging ? "border-[#0b9da7] bg-[#eefafa]" : file ? "border-[#99d6da] bg-[#f7fcfc]" : "border-slate-300 bg-white hover:border-[#55bfc5] hover:bg-[#fbffff]"}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) onFile(selected); }} />
      <div className="flex flex-col items-center justify-center text-center">
        {file ? <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dff3f4] text-[#0b8792]"><FileCheck2 size={29} /></div> : <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f8fa] text-[#0b8792] transition-transform duration-200 group-hover:-translate-y-1"><CloudUpload size={29} /></div>}
        {file ? <>
          <div className="max-w-full truncate px-4 text-sm font-bold text-[#173f6b]">{file.name}</div>
          <div className="mt-1 text-xs text-slate-400">{formatFileSize(file.size)} · pronto para análise</div>
          <div className="mt-5 flex items-center gap-2"><button onClick={(event) => { event.stopPropagation(); onClear(); }} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"><X size={14} /> Remover</button><button onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }} className="flex items-center gap-1.5 rounded-lg bg-[#173f6b] px-3 py-2 text-xs font-bold text-white hover:bg-[#0f3157]"><Upload size={14} /> Trocar arquivo</button></div>
        </> : <>
          <div className="text-sm font-bold text-[#173f6b]">Arraste seu orçamento aqui</div>
          <div className="mt-1 text-xs text-slate-400">ou clique para selecionar um arquivo do computador</div>
          <div className="mt-5 flex flex-wrap justify-center gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">PDF somente</span></div>
        </>}
      </div>
    </div>
  );
}

function ItemsEditor({ items, onChange }: { items: QuoteItem[]; onChange: (items: QuoteItem[]) => void }) {
  const update = (id: number, field: keyof QuoteItem, value: string) => onChange(items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  const remove = (id: number) => onChange(items.filter((item) => item.id !== id));
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(28,61,92,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="text-sm font-bold text-[#173f6b]">Itens identificados</div><div className="mt-1 text-xs text-slate-400">Revise os dados antes de montar a proposta final.</div></div>
        <button onClick={() => onChange([...items, { id: Date.now(), name: "Novo item", code: "", quantity: "1 PC" }])} className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-[#173f6b] hover:border-[#8ccdd1] hover:bg-[#f3fbfb]"><Plus size={14} /> Adicionar item</button>
      </div>
      <div className="hidden grid-cols-[minmax(0,1fr)_170px_100px_30px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 md:grid"><div>Descrição do produto</div><div>Código</div><div>Quantidade</div><div /></div>
      <div className="divide-y divide-slate-100">
        {items.map((item, index) => <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_170px_100px_30px] md:items-center md:gap-4">
          <div><div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 md:hidden">Descrição</div><input value={item.name} onChange={(event) => update(item.id, "name", event.target.value)} className="w-full rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#8ccdd1] focus:bg-white" /></div>
          <div><div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 md:hidden">Código</div><input value={item.code} onChange={(event) => update(item.id, "code", event.target.value)} className="w-full rounded-lg border border-transparent bg-slate-50 px-3 py-2 font-mono text-[10px] text-slate-500 outline-none transition focus:border-[#8ccdd1] focus:bg-white" /></div>
          <div><div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 md:hidden">Quantidade</div><input value={item.quantity} onChange={(event) => update(item.id, "quantity", event.target.value)} className="w-full rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs font-bold text-[#173f6b] outline-none transition focus:border-[#8ccdd1] focus:bg-white" /></div>
          <button onClick={() => remove(item.id)} aria-label={`Remover item ${index + 1}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
        </div>)}
      </div>
      {items.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-400">Nenhum item adicionado.</div>}
    </div>
  );
}

function ProposalPreview({ items, quoteNumber, emissionDate, seller, customer, total, onPrint }: { items: QuoteItem[]; quoteNumber: string; emissionDate: string; seller: SellerData; customer: CustomerData; total: string; onPrint: () => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(28,61,92,0.05)] print:shadow-none print:border-0">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 print:hidden"><div><div className="text-sm font-bold text-[#173f6b]">Prévia da proposta</div><div className="mt-1 text-xs text-slate-400">Visualização do documento IP77</div></div><button onClick={onPrint} className="flex items-center gap-2 rounded-lg bg-[#0b8792] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#08717a]"><Download size={14} /> Gerar PDF</button></div>
    <div className="proposal-print-area p-6 sm:p-8">
      <div className="text-center"><div className="flex items-center justify-center gap-3"><img src={LOGO} alt="IP77" className="h-12 w-auto" /><div className="text-left"><div className="text-xl font-black tracking-tight text-[#173f6b]">PROPOSTA COMERCIAL</div><div className="mt-1 text-[9px] text-slate-400">Fornecedor IP77 · energia e soluções fotovoltaicas</div></div></div><div className="mt-4 flex items-center justify-center gap-8 text-[10px] text-slate-600"><span><b className="text-slate-700">Cotação nº</b> {quoteNumber || "—"}</span><span><b className="text-slate-700">Data da emissão</b> {emissionDate || "—"}</span><span><b className="text-slate-700">Validade</b> 5 dias</span></div></div>
      <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2"><div className="rounded-lg border border-slate-300 bg-white p-3 text-[9px] leading-4 text-slate-700"><div className="mb-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700">Dados da IP77 — fornecedor</div><div><b>CNPJ:</b> {IP77_COMPANY.cnpj}</div><div><b>Endereço:</b> {IP77_COMPANY.address}</div><div><b>Bairro/UF:</b> {IP77_COMPANY.neighborhood} / {IP77_COMPANY.state}</div><div><b>Vendedor:</b> {seller.name || "Não informado"}</div><div><b>E-mail:</b> {seller.email || "Não informado"}</div><div><b>Telefone:</b> {seller.phone || "Não informado"}</div></div><div className="rounded-lg border border-slate-300 bg-white p-3 text-[9px] leading-4 text-slate-700"><div className="mb-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700">Dados do cliente comprador</div><div><b>Nome:</b> {customer.name || "Não identificado"}</div><div><b>CPF/CNPJ:</b> {customer.document || "Não identificado"}</div><div><b>Endereço:</b> {customer.address || "Não identificado"}</div><div><b>Cidade/UF:</b> {customer.cityState || "Não identificado"} {customer.phone && <><span className="ml-2"><b>Telefone:</b> {customer.phone}</span></>}</div></div></div>
      <div className="mt-6"><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Itens da proposta</div><table className="w-full border-collapse text-left"><thead><tr className="bg-[#173f6b] text-[10px] uppercase tracking-wider text-white"><th className="rounded-l-md px-3 py-2.5">Item</th><th className="px-3 py-2.5">Código</th><th className="rounded-r-md px-3 py-2.5 text-right">Qtd.</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-slate-100 text-[11px]"><td className="px-3 py-2.5 font-semibold text-slate-700">{item.name}</td><td className="px-3 py-2.5 font-mono text-[10px] text-slate-400">{item.code}</td><td className="px-3 py-2.5 text-right font-bold text-[#173f6b]">{item.quantity}</td></tr>)}</tbody></table></div>
      <div className="mt-6 flex items-center justify-between rounded-xl bg-[#f1f7fa] px-5 py-4"><div className="text-xs font-bold uppercase tracking-wider text-slate-500">Valor total</div><div className="text-2xl font-black text-[#173f6b]">{total}</div></div>
      <div className="mt-7 border-t-2 border-[#12a3a5] pt-5 text-[9px] leading-[1.45] text-slate-600">
        <div className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#173f6b]">Observações</div>
        <div className="space-y-1.5">{proposalObservations.general.map((text) => <p key={text} className="m-0">{text}</p>)}</div>
        <div className="mt-4 mb-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0b8792]">Produtos</div>
        <div className="space-y-1.5">{proposalObservations.products.map((text) => <p key={text} className="m-0">{text}</p>)}</div>
        <div className="mt-4 mb-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0b8792]">Orientações</div>
        <div className="space-y-1.5">{proposalObservations.delivery.map((text) => <p key={text} className="m-0">{text}</p>)}</div>
      </div>
    </div>
  </div>;
}

export default function Home({ user, onLogout }: { user?: SessionUser; onLogout?: () => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState("Visão geral");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [total, setTotal] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [emissionDate, setEmissionDate] = useState("");
  const [seller, setSeller] = useState<SellerData>(emptySeller);
  const [sellers, setSellers] = useState<SellerData[]>(defaultSellers);
  const [customer, setCustomer] = useState<CustomerData>(emptyCustomer);
  const analyzeQuote = trpc.quote.analyze.useMutation();
  const accountSeller = useMemo(() => {
    const email = user?.email?.toLowerCase() ?? "";
    const saved = defaultSellers.find((entry) => entry.email.toLowerCase() === email);
    return saved ?? { name: user?.name || "", email: user?.email || "", phone: "" };
  }, [user?.email, user?.name]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SELLERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SellerData[];
        if (Array.isArray(parsed) && parsed.length > 0) setSellers(parsed);
      }
    } catch {
      // Mantém os vendedores padrão caso o armazenamento local não esteja disponível.
    }
  }, []);

  useEffect(() => {
    setSeller(accountSeller);
  }, [accountSeller]);

  const itemCount = useMemo(() => items.length, [items]);
  const updateSeller = (field: keyof SellerData, value: string) => setSeller((current) => ({ ...current, [field]: value }));
  const selectSeller = (name: string) => {
    const selected = sellers.find((entry) => entry.name === name);
    if (selected) setSeller(selected);
  };
  const saveSeller = () => {
    if (!seller.name.trim()) {
      toast.error("Informe o nome do vendedor antes de salvar.");
      return;
    }
    const updated = [...sellers.filter((entry) => entry.name !== seller.name), { ...seller, name: seller.name.trim() }];
    setSellers(updated);
    window.localStorage.setItem(SELLERS_STORAGE_KEY, JSON.stringify(updated));
    toast.success("Vendedor salvo", { description: "Os dados estarão disponíveis nos próximos orçamentos." });
  };
  const updateCustomer = (field: keyof CustomerData, value: string) => setCustomer((current) => ({ ...current, [field]: value }));
  const acceptFile = (selected: File) => {
    setFile(selected);
    setShowEditor(false);
    toast.success("Arquivo carregado", { description: "Clique em analisar para identificar os itens." });
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) acceptFile(dropped);
  };
  const analyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const extracted = await analyzeQuote.mutateAsync({
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        fileBase64: await fileToBase64(file),
      });
      setItems(extracted.items.map((item) => ({ ...item, id: item.id })));
      setQuoteNumber(extracted.quoteNumber || "");
      setEmissionDate(extracted.issueDate || "");
      setSeller(accountSeller);
      setCustomer(extracted.customer || emptyCustomer);
      setTotal(extracted.total || "");
      setIsAnalyzing(false);
      setShowEditor(true);
      toast.success("Análise concluída", { description: `${extracted.items.length} itens foram extraídos do orçamento anexado.` });
    } catch (error) {
      setIsAnalyzing(false);
      toast.error("Não foi possível analisar o orçamento", { description: error instanceof Error ? error.message : "Tente novamente com um arquivo PDF legível." });
    }
  };
  const clearUpload = () => { setFile(null); setItems([]); setShowEditor(false); if (inputRef.current) inputRef.current.value = ""; };
  const navigate = (label: string) => {
    if (label === "Nova proposta") { clearUpload(); setActive(label); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (label === "Visão geral") { setActive(label); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    toast.info(label, { description: "Esta área está preparada para a próxima etapa do produto." });
  };
  const printProposal = () => {
    const proposal = document.querySelector<HTMLElement>(".proposal-print-area");
    if (!proposal) {
      toast.error("Não foi possível preparar a proposta para impressão.");
      return;
    }
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      toast.error("A impressão foi bloqueada pelo navegador.", { description: "Permita pop-ups para gerar o PDF." });
      return;
    }
    const styles = Array.from(document.head.querySelectorAll("link[rel='stylesheet'], style"))
      .map((element) => element.outerHTML)
      .join("\n");
    printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Proposta IP77</title>${styles}</head><body class="print-only-proposal">${proposal.outerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.addEventListener("load", () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, { once: true });
  };

  return <div className="min-h-screen bg-[#f7fafc] text-slate-700">
    <div className="flex min-h-screen">
      <div className="min-w-0 flex-1"><Topbar onHelp={() => setShowHelp(true)} user={user} onLogout={onLogout} />
        <main className="mx-auto max-w-[1480px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0b9da7]"><span className="h-1.5 w-1.5 rounded-full bg-[#0b9da7]" /> Operação comercial</div><h1 className="text-3xl font-black tracking-[-0.03em] text-[#173f6b] sm:text-4xl">Transforme orçamentos<br className="hidden sm:block" /> em propostas IP77.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Suba um orçamento recebido, revise os itens identificados e gere um documento profissional com a identidade da sua empresa.</p></div><div className="hidden items-center gap-2 rounded-xl border border-[#d8ecee] bg-white px-3 py-2.5 text-xs font-semibold text-[#0b8792] shadow-sm sm:flex"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e6f7f7]"><Sparkles size={13} /></span> Fluxo inteligente IP77</div></div>
          {!showEditor ? <>
            <section className="mx-auto max-w-4xl">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(28,61,92,0.06)] sm:p-7"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-base font-bold text-[#173f6b]">Comece por um orçamento</h2><p className="mt-1 text-xs text-slate-400">A plataforma identifica produtos, códigos e quantidades.</p></div><div className="hidden rounded-lg bg-[#edf8f8] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0b8792] sm:block">Etapa 01 / 03</div></div><UploadCard file={file} isDragging={isDragging} onFile={acceptFile} onDrop={handleDrop} onClear={clearUpload} inputRef={inputRef} /><div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row"><div className="flex items-center gap-2 text-xs text-slate-400"><FileText size={15} className="text-slate-300" /> Arquivos de até 20 MB</div><button disabled={!file || isAnalyzing} onClick={analyze} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173f6b] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(23,63,107,0.2)] transition hover:bg-[#0f3157] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">{isAnalyzing ? <><Loader2 size={16} className="animate-spin" /> Analisando arquivo...</> : <>Analisar orçamento <ArrowRight size={16} /></>}</button></div></section>
            </section>
          </> : <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><button onClick={() => setShowEditor(false)} className="mb-3 flex items-center gap-1 text-xs font-bold text-[#0b8792] hover:underline"><ArrowRight size={14} className="rotate-180" /> Voltar para o upload</button><h2 className="text-2xl font-black tracking-tight text-[#173f6b]">Revise sua proposta</h2><p className="mt-1 text-sm text-slate-500">{file?.name} · {itemCount} itens identificados</p></div><div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-lg bg-[#e7f7ee] px-3 py-2 text-xs font-bold text-[#2d8a5b] sm:flex"><Check size={14} /> Análise concluída</div><button onClick={clearUpload} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"><Trash2 size={14} /> Limpar</button></div></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(390px,0.85fr)]"><div className="space-y-5"><ItemsEditor items={items} onChange={setItems} /><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(28,61,92,0.04)]"><div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#173f6b]"><Settings2 size={17} className="text-[#0b9da7]" /> Ajustes do documento</div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Número da proposta</span><input value={quoteNumber} onChange={(event) => setQuoteNumber(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#8ccdd1]" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Valor total</span><input value={total} onChange={(event) => setTotal(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#8ccdd1]" /></label></div><div className="mt-5 border-t border-slate-100 pt-5"><div className="mb-3 flex items-center justify-between"><div><div className="text-sm font-bold text-[#173f6b]">Dados do vendedor IP77</div><div className="mt-1 text-xs text-slate-400">Selecione um vendedor cadastrado ou preencha os dados manualmente.</div></div><div className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">Salvo no navegador</div></div><select value={sellers.some((entry) => entry.name === seller.name) ? seller.name : ""} onChange={(event) => selectSeller(event.target.value)} className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400"><option value="">Selecionar vendedor cadastrado</option>{sellers.map((entry) => <option key={entry.name} value={entry.name}>{entry.name} · {entry.email}</option>)}</select><div className="grid gap-3 sm:grid-cols-3"><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome do vendedor</span><input value={seller.name} onChange={(event) => updateSeller("name", event.target.value)} placeholder="Nome do vendedor" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">E-mail</span><input type="email" value={seller.email} onChange={(event) => updateSeller("email", event.target.value)} placeholder="vendedor@ip77.com.br" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Telefone</span><input value={seller.phone} onChange={(event) => updateSeller("phone", event.target.value)} placeholder="(00) 00000-0000" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400" /></label></div><div className="mt-3 flex justify-end"><button onClick={saveSeller} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-500 hover:bg-slate-50">Salvar vendedor</button></div></div><div className="mt-5 border-t border-slate-100 pt-5"><div className="mb-3 flex items-center justify-between"><div><div className="text-sm font-bold text-[#173f6b]">Dados do cliente comprador</div><div className="mt-1 text-xs text-slate-400">Revise ou corrija os dados identificados no PDF antes de gerar a proposta.</div></div><div className="rounded-full bg-[#eaf8ef] px-2.5 py-1 text-[10px] font-bold text-[#2b8050]">Editável</div></div><div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome / Razão social</span><input value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} placeholder="Nome do cliente" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#46a56b]" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">CPF / CNPJ</span><input value={customer.document} onChange={(event) => updateCustomer("document", event.target.value)} placeholder="Documento" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#46a56b]" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Endereço</span><input value={customer.address} onChange={(event) => updateCustomer("address", event.target.value)} placeholder="Endereço completo" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#46a56b]" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Cidade / UF</span><input value={customer.cityState} onChange={(event) => updateCustomer("cityState", event.target.value)} placeholder="Cidade / UF" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#46a56b]" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Telefone</span><input value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} placeholder="Telefone do cliente" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#46a56b]" /></label></div></div><div className="mt-4 flex items-center gap-2 rounded-lg bg-[#f5fafb] p-3 text-xs text-slate-500"><Sparkles size={14} className="shrink-0 text-[#0b9da7]" /> A identidade visual IP77 será aplicada automaticamente ao gerar o documento.</div></div></div><ProposalPreview items={items} quoteNumber={quoteNumber} emissionDate={emissionDate} seller={seller} customer={customer} total={total} onPrint={printProposal} /></div></div>}
        </main>
      </div>
    </div>
    {showHelp && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2944]/30 p-5 backdrop-blur-sm" onClick={() => setShowHelp(false)}><div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f7f7] text-[#0b8792]"><CircleHelp size={21} /></div><button onClick={() => setShowHelp(false)} className="text-slate-300 hover:text-slate-500"><X size={18} /></button></div><h3 className="mt-5 text-lg font-black text-[#173f6b]">Como funciona?</h3><p className="mt-2 text-sm leading-6 text-slate-500">Envie um orçamento em PDF, revise os produtos identificados e gere uma proposta com a identidade IP77.</p><div className="mt-5 space-y-3">{["Envie um orçamento em PDF", "Revise itens, códigos e quantidades", "Gere o PDF pronto para compartilhar"].map((text, index) => <div key={text} className="flex items-center gap-3 text-xs font-semibold text-slate-600"><div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e7f7f7] text-[10px] font-black text-[#0b8792]">{index + 1}</div>{text}</div>)}</div><button onClick={() => setShowHelp(false)} className="mt-7 w-full rounded-xl bg-[#173f6b] py-3 text-sm font-bold text-white hover:bg-[#0f3157]">Entendi</button></div></div>}
  </div>;
}
