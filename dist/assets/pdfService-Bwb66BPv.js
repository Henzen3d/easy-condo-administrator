const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/pixUtils-mCfSFajD.js","assets/index-PF3D36V0.js","assets/index-BhASDYTj.css","assets/addDays-Db2LM6jR.js"])))=>i.map(i=>d[i]);
import{c as F,_ as C}from"./index-PF3D36V0.js";import{E as h}from"./invoiceService-_JBDSHYM.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=F("EllipsisVertical",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}]]);function _(o,t,n,r){const e=new h;e.setFontSize(20),e.setTextColor(0,102,204),e.text("EasyCondo",105,20,{align:"center"}),e.setFontSize(16),e.setTextColor(0,0,0),e.text("Resumo de Cobranças",105,30,{align:"center"}),e.setFontSize(12),e.text(`Unidade: ${o}`,20,45),e.text(`Morador: ${t}`,20,52),e.text(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`,20,59),e.setFillColor(240,240,240),e.rect(20,65,170,15,"F"),e.setFontSize(12),e.text("Total a pagar:",25,75),e.setFontSize(14),e.setFont("helvetica","bold"),e.text(m(r),160,75,{align:"right"}),e.setFont("helvetica","normal");const c=["ID","Descrição","Vencimento","Status","Valor"],d=n.map(a=>[a.id,a.description,f(a.due_date),E(a.status),m(a.amount)]);e.autoTable({startY:90,head:[c],body:d,headStyles:{fillColor:[0,102,204],textColor:255,fontStyle:"bold"},alternateRowStyles:{fillColor:[240,240,240]},columnStyles:{0:{cellWidth:25},1:{cellWidth:60},2:{cellWidth:30},3:{cellWidth:25},4:{cellWidth:30,halign:"right"}},margin:{top:90}});const s=e.getNumberOfPages();for(let a=1;a<=s;a++)e.setPage(a),e.setFontSize(10),e.setTextColor(100),e.text("EasyCondo - Sistema de Gestão de Condomínios",105,e.internal.pageSize.height-10,{align:"center"}),e.text(`Página ${a} de ${s}`,e.internal.pageSize.width-20,e.internal.pageSize.height-10,{align:"right"});const i=e.lastAutoTable.finalY||120;e.setFontSize(12),e.setTextColor(0),e.text("Instruções de Pagamento:",20,i+20),e.setFontSize(10),e.text("1. O pagamento pode ser realizado via PIX ou boleto bancário.",20,i+30),e.text("2. Após o vencimento, serão cobrados juros de 1% ao mês e multa de 2%.",20,i+37),e.text("3. Em caso de dúvidas, entre em contato com a administração do condomínio.",20,i+44);try{const a=e.output("arraybuffer"),p=new Blob([a],{type:"application/pdf"}),x=URL.createObjectURL(p);return console.log("Summary PDF blob URL created:",x.substring(0,50)+"..."),x}catch(a){return console.error("Error creating summary PDF blob URL:",a),e.output("dataurlstring")}}function I(o){const t=new h;t.setFontSize(16),t.setTextColor(0,0,0),t.text("Boleto de Cobrança",105,20,{align:"center"}),t.setFontSize(12),t.text(`Código de Referência: ${o.id}`,20,40),t.text(`Unidade: ${o.unit}`,20,50),t.text(`Morador: ${o.resident}`,20,60),t.text(`Descrição: ${o.description}`,20,70),t.text(`Valor: ${m(o.amount)}`,20,80),t.text(`Vencimento: ${f(o.due_date)}`,20,90);const n=w(o);t.setFontSize(10),t.text(`Código de barras: ${n}`,20,100),R(t,n,20,110,170,20),t.setDrawColor(0),t.setLineDashPattern([3,3],0),t.line(10,150,200,150),t.text("Recibo do Pagador",105,160,{align:"center"}),t.text(`Código de Referência: ${o.id}`,20,170),t.text(`Valor: ${m(o.amount)}`,20,180),t.text(`Vencimento: ${f(o.due_date)}`,20,190),t.setFontSize(10),t.text("Instruções:",20,210),t.text("1. Pagável em qualquer banco até o vencimento",20,220),t.text("2. Após o vencimento, juros de 1% ao mês + multa de 2%",20,230),t.text("3. Em caso de dúvidas, entre em contato com a administração",20,240),t.setFontSize(10),t.setTextColor(100),t.text("EasyCondo - Sistema de Gestão de Condomínios",105,t.internal.pageSize.height-10,{align:"center"});try{const r=t.output("arraybuffer"),e=new Blob([r],{type:"application/pdf"}),c=URL.createObjectURL(e);return console.log("Boleto PDF blob URL created:",c.substring(0,50)+"..."),c}catch(r){return console.error("Error creating boleto PDF blob URL:",r),t.output("dataurlstring")}}function w(o){const t="341",n="9",r="8",e=new Date("1997-10-07"),c=new Date(o.due_date),d=Math.abs(c.getTime()-e.getTime()),i=Math.ceil(d/(1e3*60*60*24)).toString().padStart(4,"0"),a=Math.floor(o.amount*100).toString().padStart(10,"0"),p=`${o.id.toString().padStart(10,"0")}${Date.now().toString().substring(0,15).padStart(15,"0")}`;return`${t}${n}${r}${i}${a}${p}`}function R(o,t,n,r,e,c){const d=e/t.length;o.setFillColor(0);for(let s=0;s<t.length;s++){const a=(parseInt(t[s],10)+1)*.3;s%2===0&&o.rect(n+s*d,r,a,c,"F")}o.setFontSize(8),o.text(t,n,r+c+10,{align:"left"})}async function L(o){const t=new h;t.setFontSize(16),t.setTextColor(0,0,0),t.text("Pagamento via PIX",105,20,{align:"center"}),t.setFontSize(12),t.text(`Código de Referência: ${o.id}`,20,40),t.text(`Unidade: ${o.unit}`,20,50),t.text(`Morador: ${o.resident}`,20,60),t.text(`Descrição: ${o.description}`,20,70),t.text(`Valor: ${m(o.amount)}`,20,80);try{const{generatePixQRCode:n}=await C(async()=>{const{generatePixQRCode:u}=await import("./pixUtils-mCfSFajD.js");return{generatePixQRCode:u}},__vite__mapDeps([0,1,2,3])),{identifyPixKeyType:r,formatPixKey:e}=await C(async()=>{const{identifyPixKeyType:u,formatPixKey:g}=await import("./pixUtils-mCfSFajD.js");return{identifyPixKeyType:u,formatPixKey:g}},__vite__mapDeps([0,1,2,3])),{supabase:c}=await C(async()=>{const{supabase:u}=await import("./index-PF3D36V0.js").then(g=>g.aB);return{supabase:u}},__vite__mapDeps([1,2])),{data:d,error:s}=await c.from("bank_accounts").select("*").not("pix_key","is",null).order("name").limit(1);if(s)throw new Error(`Erro ao buscar conta bancária: ${s.message}`);if(!d||d.length===0)throw new Error("Nenhuma conta bancária com chave PIX encontrada");const i=d[0],a=i.pix_key,p=i.pix_key_type||"cpf",x=i.name||"Condomínio";if(!a)throw new Error("A conta bancária não possui chave PIX configurada");console.log(`Usando chave PIX da conta "${i.name}": ${a} do tipo ${p}`);const y=new Date;let l=new Date;y.getDate()<=10||l.setMonth(l.getMonth()+1),l.setDate(10),l<=y&&l.setMonth(l.getMonth()+1);const S=f(l.toISOString());t.setFontSize(12),t.setTextColor(255,0,0),t.text(`Vencimento PIX: ${S}`,20,90),console.log(`Data de vencimento do PIX definida para: ${S}`);const P=`${o.id}${Date.now().toString().substring(0,5)}`,b=`Cond ${o.id}`,D=i.city||"SAO PAULO";console.log(`Gerando QR Code PIX para transação: ${P}`);const $=await n(a,o.amount,P,x,D,b,l.toISOString().split("T")[0]);if($){t.addImage($,"PNG",75,110,60,60),t.setDrawColor(200,200,200),t.setLineWidth(.5),t.rect(74.5,109.5,61,61);const u={cpf:"Chave Pix CPF",cnpj:"Chave Pix CNPJ",email:"Chave Pix E-mail",phone:"Chave Pix Telefone",random:"Chave Pix Aleatória"}[p.toLowerCase()]||"Chave PIX",g=e(a);t.setFontSize(10),t.setTextColor(0,0,0),t.text(`Tipo: ${u}`,65,180),t.text(`Chave PIX: ${g}`,65,190),t.text(`Beneficiário: ${x}`,65,200)}}catch(n){console.error("Error generating QR code:",n),t.setFontSize(12),t.setTextColor(255,0,0),t.text("Erro ao gerar QR Code PIX",105,140,{align:"center"}),t.setFontSize(10),t.text(`Detalhes: ${n instanceof Error?n.message:"Erro desconhecido"}`,105,150,{align:"center"})}t.setFontSize(11),t.setTextColor(0,0,0),t.text("1. Abra o app do seu banco",20,200),t.text("2. Escolha pagar via PIX",20,210),t.text("3. Escaneie o QR code acima",20,220),t.text("4. Confirme o pagamento",20,230),t.setFontSize(10),t.setTextColor(100,100,100),t.text("EasyCondo - Sistema de Gestão de Condomínios",105,290,{align:"center"}),console.log("PDF with PIX QR code generated successfully");try{const n=t.output("arraybuffer"),r=new Blob([n],{type:"application/pdf"}),e=URL.createObjectURL(r);return console.log("PDF blob URL created:",e.substring(0,50)+"..."),e}catch(n){return console.error("Error creating blob URL:",n),t.output("dataurlstring")}}function m(o){return`R$ ${o.toFixed(2).replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g,".")}`}function f(o){const t=new Date(o);return`${t.getDate().toString().padStart(2,"0")}/${(t.getMonth()+1).toString().padStart(2,"0")}/${t.getFullYear()}`}function E(o){return{pending:"Pendente",paid:"Pago",overdue:"Atrasado",cancelled:"Cancelado"}[o]||o}export{z as E,I as a,L as b,_ as g};
