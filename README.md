# Solução para Promotor / Equipe de vendas — App Mobile

Aplicativo mobile desenvolvido como uma solução interna para otimização de operações de campo, com foco em centralizar atividades, melhorar a coleta de informações, reduzir processos manuais e aumentar a eficiência operacional.

O projeto foi concebido para atender profissionais que realizam visitas externas a clientes, permitindo controlar todo o ciclo operacional diretamente pelo dispositivo móvel, desde o planejamento da visita até o registro das atividades e sincronização das informações.

🎯 Objetivo do Projeto

A solução nasceu a partir da identificação de oportunidades de melhoria em processos operacionais realizados em campo.

Entre os principais objetivos estavam:

📉 Reduzir custos operacionais;
⚡ Diminuir atividades manuais e retrabalho;
📊 Melhorar a qualidade e padronização dos dados coletados;
📍 Garantir maior controle sobre visitas realizadas;
📱 Centralizar informações em um único aplicativo;
🔄 Permitir operação mesmo em ambientes com conexão instável;
🗺️ Utilizar geolocalização para validação das visitas;
📈 Criar uma base estruturada para futuras análises e indicadores;
🔐 Garantir controle de acesso e segurança das informações.

O projeto também foi pensado considerando a realidade de operações de campo, nas quais conectividade, usabilidade e velocidade de registro são fatores críticos.

🚀 Principais Funcionalidades
🔐 Autenticação
Login por e-mail e senha;
Suporte à autenticação biométrica;
Recuperação de senha;
Controle de sessão;
Estrutura preparada para autenticação baseada em Supabase.
📊 Dashboard

A tela inicial apresenta uma visão consolidada da operação:

Próxima visita;
Indicadores de desempenho;
Roteiro do dia;
Resumo das atividades;
Notificações;
Status de sincronização.

O objetivo é transformar os dados operacionais em informações rápidas para tomada de decisão.

👥 Gestão de Clientes

O aplicativo permite consultar e gerenciar a carteira de clientes:

Pesquisa por nome;
Pesquisa por código;
Pesquisa por documento;
Filtros por situação;
Identificação de clientes do roteiro;
Visualização de informações cadastrais;
Endereço;
Informações financeiras;
Acesso ao histórico de visitas;
Integração com mapas.
📍 Gestão de Visitas

Um dos principais módulos da solução.

O fluxo foi estruturado para acompanhar toda a jornada da visita:

Planejamento
     ↓
Cliente
     ↓
Check-in
     ↓
Atividades
     ↓
Coleta de informações
     ↓
Check-out
     ↓
Sincronização
     ↓
Histórico
Check-in

O início da visita possui:

Registro de horário;
Geolocalização;
Validação de proximidade;
Indicador de localização em tempo real.
Atividades

Durante a visita podem ser realizadas diferentes atividades, como:

Questionários;
Registro fotográfico;
Verificação de preços;
Identificação de rupturas;
Coleta de informações do ponto de atendimento.
Check-out

Ao finalizar a visita, o aplicativo registra:

Horário de saída;
Localização;
Resultado;
Motivo;
Resumo das atividades realizadas.
📷 Coleta de Dados em Campo

A solução permite transformar informações coletadas durante as visitas em dados estruturados.

Entre os recursos estão:

Questionários

Assistente de preenchimento com perguntas de múltipla escolha e validações.

Registro fotográfico

Captura e organização de imagens relacionadas às atividades realizadas.

Rupturas

Registro de produtos ausentes, incluindo:

Código EAN;
Grau de severidade;
Evidência fotográfica.

Esses dados podem posteriormente alimentar processos analíticos e indicadores operacionais.

🔄 Funcionamento Offline

Um dos pontos mais importantes da arquitetura é a capacidade de trabalhar mesmo com conectividade limitada.

As operações realizadas durante uma visita podem ser armazenadas localmente e posteriormente sincronizadas.

Usuário
   ↓
Aplicativo
   ↓
Banco local
   ↓
Fila de sincronização
   ↓
Conexão disponível
   ↓
Backend

A fila de sincronização foi projetada para evitar perda de informações durante atividades em campo.

São consideradas operações como:

Check-in;
Check-out;
Atividades;
Questionários;
Registros de ruptura.

Quando a conexão é restabelecida, os dados pendentes podem ser enviados automaticamente.
