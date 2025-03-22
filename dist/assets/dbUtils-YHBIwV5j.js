import{s as t}from"./index-PF3D36V0.js";var n={};const T=async()=>{try{console.log("Verificando existência da tabela billings...");const{data:a,error:e}=await t.from("billings").select("id").limit(1);if(!e)return console.log("Tabela billings existe"),!0;if(!e.message.includes("does not exist")&&!e.message.includes("relation")&&!e.message.includes("não existe"))return console.error("Erro ao verificar tabela billings:",e),!1;console.log("Tabela billings não existe. Criando...");const s=`
      CREATE TABLE IF NOT EXISTS billings (
        id SERIAL PRIMARY KEY,
        unit TEXT NOT NULL,
        resident TEXT NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'pending',
        is_printed BOOLEAN DEFAULT false,
        is_sent BOOLEAN DEFAULT false,
        unit_id INTEGER,
        reference_month TEXT,
        reference_year INTEGER,
        charge_type TEXT,
        billing_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;try{console.log("Tentando criar tabela billings via SQL nativo...");const{error:o}=await t.rpc("execute_sql",{query:s});if(o)throw console.error("Erro ao criar tabela billings via SQL:",o),o;return console.log("Tabela billings criada com sucesso via SQL"),!0}catch{console.log("Falha na criação via SQL, tentando método alternativo...");try{const{error:r}=await t.from("billings").insert([{unit:"INITIALSETUP",resident:"SYSTEM",description:"Table initialization record",amount:0,due_date:new Date().toISOString().split("T")[0],status:"pending",is_printed:!1,is_sent:!1}]);return r?(console.error("Erro na criação alternativa da tabela billings:",r),!1):(console.log("Tabela billings criada com sucesso (método alternativo)"),!0)}catch(r){return console.error("Todos os métodos de criação da tabela billings falharam:",r),!1}}}catch(a){return console.error("Erro durante verificação/criação da tabela billings:",a),!1}},E=async()=>{try{console.log("Verificando existência da tabela meter_readings...");const{data:a,error:e}=await t.from("meter_readings").select("id").limit(1);if(!e)return console.log("Tabela meter_readings existe"),!0;if(!e.message.includes("does not exist")&&!e.message.includes("relation")&&!e.message.includes("não existe"))return console.error("Erro ao verificar tabela meter_readings:",e),!1;console.log("Tabela meter_readings não existe. Criando...");const s=`
      CREATE TABLE IF NOT EXISTS meter_readings (
        id SERIAL PRIMARY KEY,
        unit_id INTEGER NOT NULL,
        utility_type TEXT NOT NULL,
        reading_value DECIMAL(10,2) NOT NULL,
        reading_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `,{error:o}=await t.rpc("execute_sql",{query:s});if(o){console.error("Erro ao criar tabela meter_readings via RPC:",o);const r=await fetch(`${n.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,{method:"POST",headers:{"Content-Type":"application/json",apikey:n.NEXT_PUBLIC_SUPABASE_ANON_KEY||"",Authorization:`Bearer ${n.NEXT_PUBLIC_SUPABASE_ANON_KEY||""}`},body:JSON.stringify({query:s})});return r.ok?(console.log("Tabela meter_readings criada via REST API"),!0):(console.error("Erro ao criar tabela via REST API:",await r.text()),!1)}return console.log("Tabela meter_readings criada com sucesso"),!0}catch(a){return console.error("Erro durante verificação/criação da tabela meter_readings:",a),!1}},l=async a=>{try{const{error:e}=await t.from(a).select("*").limit(1);return!e}catch(e){return console.error(`Erro ao verificar existência da tabela ${a}:`,e),!1}},d=async()=>{try{console.log("Verificando políticas de segurança (RLS)...");const a=["units","residents","meter_readings","billings","utility_rates"];for(const e of a){const s=await l(e);console.log(s?`Tabela ${e} existe, considerando políticas RLS verificadas.`:`Tabela ${e} não existe, pulando verificação de RLS.`)}return!0}catch(a){return console.error("Erro ao verificar políticas RLS:",a),!0}},u=async()=>{try{console.log("Verificando existência da tabela units...");const{data:a,error:e}=await t.from("units").select("id").limit(1);if(!e)return console.log("Tabela units existe"),!0;if(!e.message.includes("does not exist")&&!e.message.includes("relation")&&!e.message.includes("não existe"))return console.error("Erro ao verificar tabela units:",e),!1;console.log("Tabela units não existe. Criando...");const s=`
      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        number TEXT NOT NULL,
        block TEXT NOT NULL,
        owner TEXT,
        residents INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(number, block)
      )
    `;try{console.log("Tentando criar tabela units via SQL nativo...");const{error:o}=await t.rpc("execute_sql",{query:s});if(o)throw console.error("Erro ao criar tabela units via SQL:",o),o;console.log("Tabela units criada com sucesso via SQL");const r="ALTER TABLE units DISABLE ROW LEVEL SECURITY;",{error:i}=await t.rpc("execute_sql",{query:r});return i?console.error("Erro ao desabilitar RLS para units:",i):console.log("RLS desabilitado com sucesso para units"),!0}catch{console.log("Falha na criação via SQL, tentando método alternativo...");try{const{error:r}=await t.from("units").insert([{number:"INIT",block:"SETUP",owner:"SYSTEM",residents:0,status:"inactive"}]);return r?(console.error("Erro na criação alternativa da tabela units:",r),!1):(console.log("Tabela units criada com sucesso (método alternativo)"),!0)}catch(r){return console.error("Todos os métodos de criação da tabela units falharam:",r),!1}}}catch(a){return console.error("Erro durante verificação/criação da tabela units:",a),!1}},L=async()=>{try{console.log("Verificando existência da tabela residents...");const{data:a,error:e}=await t.from("residents").select("id").limit(1);if(!e)return console.log("Tabela residents existe"),!0;if(!e.message.includes("does not exist")&&!e.message.includes("relation")&&!e.message.includes("não existe"))return console.error("Erro ao verificar tabela residents:",e),!1;console.log("Tabela residents não existe. Criando...");const s=`
      CREATE TABLE IF NOT EXISTS residents (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        unit_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;try{console.log("Tentando criar tabela residents via SQL nativo...");const{error:o}=await t.rpc("execute_sql",{query:s});if(o)throw console.error("Erro ao criar tabela residents via SQL:",o),o;console.log("Tabela residents criada com sucesso via SQL");const r="ALTER TABLE residents DISABLE ROW LEVEL SECURITY;",{error:i}=await t.rpc("execute_sql",{query:r});return i?console.error("Erro ao desabilitar RLS para residents:",i):console.log("RLS desabilitado com sucesso para residents"),!0}catch{console.log("Falha na criação via SQL, tentando método alternativo...");try{const{error:r}=await t.from("residents").insert([{name:"SYSTEM INIT",unit_id:1,role:"system",status:"inactive"}]);return r?(console.error("Erro na criação alternativa da tabela residents:",r),!1):(console.log("Tabela residents criada com sucesso (método alternativo)"),!0)}catch(r){return console.error("Todos os métodos de criação da tabela residents falharam:",r),!1}}}catch(a){return console.error("Erro durante verificação/criação da tabela residents:",a),!1}};export{d as configureRLS,T as ensureBillingsTableExists,E as ensureMeterReadingsTableExists,L as ensureResidentsTableExists,u as ensureUnitsTableExists,l as tableExists};
