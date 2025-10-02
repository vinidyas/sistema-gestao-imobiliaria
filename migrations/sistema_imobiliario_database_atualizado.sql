-- Sistema de Gestão Imobiliária - Database Schema
-- Versão: 1.0.0
-- Data: 2024-10-02

BEGIN;

-- Configurações iniciais
SET client_encoding = 'UTF8';
SET timezone = 'America/Sao_Paulo';

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) DEFAULT 'funcionario' CHECK (tipo_usuario IN ('admin', 'corretor', 'funcionario')),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pessoas (proprietários, inquilinos, etc.)
CREATE TABLE IF NOT EXISTS pessoas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    tipo_pessoa VARCHAR(10) DEFAULT 'fisica' CHECK (tipo_pessoa IN ('fisica', 'juridica')),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de imóveis
CREATE TABLE IF NOT EXISTS imoveis (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome_imovel VARCHAR(255),
    tipo_imovel VARCHAR(100),
    finalidade VARCHAR(50) CHECK (finalidade IN ('venda', 'locacao', 'temporada', 'venda_locacao')),
    disponibilidade VARCHAR(50) DEFAULT 'disponivel' CHECK (disponibilidade IN ('disponivel', 'locado', 'vendido', 'indisponivel')),
    ocupacao VARCHAR(50) DEFAULT 'vago' CHECK (ocupacao IN ('vago', 'locado', 'vendido')),

    -- Localização
    cidade VARCHAR(100),
    estado VARCHAR(50),
    nome_condominio VARCHAR(255),
    cep VARCHAR(10),
    bairro VARCHAR(100),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(255),

    -- Características
    dormitorios INTEGER DEFAULT 0,
    banheiros INTEGER DEFAULT 0,
    vagas_garagem INTEGER DEFAULT 0,
    area_construida_total DECIMAL(10,2),
    area_terreno DECIMAL(10,2),

    -- Valores
    valor_locacao DECIMAL(12,2),
    valor_venda DECIMAL(12,2),
    valor_iptu DECIMAL(10,2),
    valor_condominio DECIMAL(10,2),
    outros_valores DECIMAL(10,2),

    -- Observações
    observacoes_internas TEXT,
    observacoes_publicas TEXT,

    -- Controle
    ativo BOOLEAN DEFAULT true,
    criado_por INTEGER REFERENCES usuarios(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contratos
CREATE TABLE IF NOT EXISTS contratos (
    id SERIAL PRIMARY KEY,
    codigo_contrato VARCHAR(20) UNIQUE NOT NULL,
    imovel_id INTEGER NOT NULL REFERENCES imoveis(id),

    -- Datas e prazos
    data_inicio DATE NOT NULL,
    duracao_meses INTEGER NOT NULL,
    data_fim DATE GENERATED ALWAYS AS (data_inicio + INTERVAL '1 month' * duracao_meses) STORED,

    -- Valores
    valor_aluguel DECIMAL(12,2) NOT NULL,
    taxa_administracao_percentual DECIMAL(5,2) DEFAULT 0,
    dia_vencimento_aluguel INTEGER CHECK (dia_vencimento_aluguel >= 1 AND dia_vencimento_aluguel <= 31),

    -- Status e tipo
    status_contrato VARCHAR(50) DEFAULT 'ativo' CHECK (status_contrato IN ('ativo', 'vencido', 'suspenso', 'rescindido')),
    finalidade_locacao VARCHAR(50) DEFAULT 'residencial' CHECK (finalidade_locacao IN ('residencial', 'comercial')),

    -- Controle
    responsavel_contrato INTEGER REFERENCES usuarios(id),
    ativo BOOLEAN DEFAULT true,
    criado_por INTEGER REFERENCES usuarios(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de faturas
CREATE TABLE IF NOT EXISTS faturas (
    id SERIAL PRIMARY KEY,
    contrato_id INTEGER REFERENCES contratos(id),
    numero_fatura VARCHAR(50),
    competencia VARCHAR(7), -- YYYY-MM

    -- Datas
    data_emissao DATE DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,

    -- Valores
    valor_total DECIMAL(12,2) NOT NULL,
    valor_pago DECIMAL(12,2) DEFAULT 0,

    -- Status
    status_fatura VARCHAR(50) DEFAULT 'em_aberto' CHECK (status_fatura IN ('em_aberto', 'pago', 'vencido', 'cancelado')),

    -- Observações
    observacoes TEXT,

    -- Controle
    ativo BOOLEAN DEFAULT true,
    criado_por INTEGER REFERENCES usuarios(id),
    atualizado_por INTEGER REFERENCES usuarios(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_imoveis_codigo ON imoveis(codigo);
CREATE INDEX IF NOT EXISTS idx_imoveis_cidade ON imoveis(cidade);
CREATE INDEX IF NOT EXISTS idx_imoveis_disponibilidade ON imoveis(disponibilidade);
CREATE INDEX IF NOT EXISTS idx_contratos_codigo ON contratos(codigo_contrato);
CREATE INDEX IF NOT EXISTS idx_contratos_imovel ON contratos(imovel_id);
CREATE INDEX IF NOT EXISTS idx_faturas_contrato ON faturas(contrato_id);
CREATE INDEX IF NOT EXISTS idx_faturas_vencimento ON faturas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status_fatura);

-- Inserir usuário administrador padrão
INSERT INTO usuarios (nome, email, senha, tipo_usuario) 
VALUES ('Administrador', 'admin@imobiliaria.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZJGlrC1QjGO/K2e', 'admin')
ON CONFLICT (email) DO NOTHING;
-- Senha padrão: 123456

-- Inserir pessoas de exemplo
INSERT INTO pessoas (nome, cpf_cnpj, email, telefone, tipo_pessoa) VALUES
('João Silva Santos', '123.456.789-01', 'joao@email.com', '(11) 99999-9999', 'fisica'),
('Maria Oliveira Costa', '987.654.321-02', 'maria@email.com', '(11) 88888-8888', 'fisica'),
('Construtora ABC Ltda', '12.345.678/0001-90', 'contato@abcconstrutora.com', '(11) 3333-3333', 'juridica')
ON CONFLICT DO NOTHING;

COMMIT;
