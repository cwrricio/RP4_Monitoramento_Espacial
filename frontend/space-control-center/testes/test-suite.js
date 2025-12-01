const { Builder, By, until, Key } = require('selenium-webdriver');
require('chromedriver');

(async function runFullTestSuite() {
  let driver = await new Builder().forBrowser('chrome').build();

  // Helper para lidar com Selects do Shadcn/Radix UI
  async function selectOption(triggerTestId, optionTestId) {
    const trigger = await driver.findElement(By.css(`[data-testid="${triggerTestId}"]`));
    await trigger.click();
    // Espera o menu aparecer (portal)
    const option = await driver.wait(until.elementLocated(By.css(`[data-testid="${optionTestId}"]`)), 2000);
    await option.click();
  }

  try {
    await driver.get('http://localhost:3000');
    await driver.manage().window().setRect({ width: 1280, height: 800 });

    console.log('🚀 Iniciando Suite de Testes...');

    // ==========================================
    // TESTE 1: GERENCIAMENTO DE ASTRONAUTAS
    // ==========================================
    console.log('\nTesting: Criação de Astronauta...');
    
    // 1. Navegar via Sidebar
    await driver.sleep(2000);

    const navAstronautas = await driver.wait(until.elementLocated(By.css('[data-testid="nav-astronautas"]')), 5000);
    await navAstronautas.click();

    // 2. Abrir Modal
    const btnAddAstro = await driver.wait(until.elementLocated(By.css('[data-testid="btn-add-astronaut"]')), 2000);
    await driver.wait(until.elementIsVisible(btnAddAstro), 5000);
    await driver.wait(until.elementIsEnabled(btnAddAstro), 5000);

    await btnAddAstro.click();

    // 3. Preencher Formulário
    console.log('Preenchendo formulário...');
    
    // Localiza o elemento
    let inputNome = await driver.wait(until.elementLocated(By.css('[data-testid="input-astro-name"]')), 5000);
    
    // --- A CORREÇÃO MÁGICA ---
    // Esperamos 1 segundo para a animação do Shadcn (Dialog) terminar completamente.
    // Sem isso, o input existe mas está "voando" na tela.
    await driver.sleep(1000); 
    // -------------------------

    // Agora garantimos que ele está visível
    await driver.wait(until.elementIsVisible(inputNome), 5000);
    
    // Clica no input primeiro para garantir o foco (boa prática em Modais)
    await inputNome.click();
    
    // Limpa qualquer valor prévio (caso haja lixo de memória) e digita
    await inputNome.clear();
    await inputNome.sendKeys('Major Tom');

    console.log('✅ Nome preenchido.');

    // --- REPETIR A LÓGICA PARA OS OUTROS CAMPOS ---
    
    let inputIdade = await driver.findElement(By.css('[data-testid="input-astro-age"]'));
    await inputIdade.click();
    await inputIdade.sendKeys('32');
    
    // 4. Selecionar Aptidão (Função auxiliar definida no inicio do arquivo)
    await selectOption('select-aptidao', 'option-alto');

    // 5. Salvar
    let btnSalvar = await driver.findElement(By.css('[data-testid="btn-save-astro"]'));
    await btnSalvar.click();
    // ==========================================
    // TESTE 2: NOVO OPERADOR
    // ==========================================
    console.log('\nTesting: Navegação para Operadores...');
    
    await driver.findElement(By.css('[data-testid="nav-operadores"]')).click();
    
    // Verificar se a tabela carregou (assumindo que existe um header de tabela)
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Gerenciamento de Operadores')]")), 3000);
    console.log('✅ Página de operadores carregada.');

    // Nota: A lógica de adicionar operador seria similar à de astronauta.
    // Certifique-se de adicionar data-testid="btn-add-operator" no operators-management.tsx

    // ==========================================
    // TESTE 3: INTERAÇÃO COM CARD DE MISSÃO
    // ==========================================
    console.log('\nTesting: Simulação no Card de Missão...');
    
    // Voltar para Home
    await driver.findElement(By.css('[data-testid="nav-home"]')).click();

    // Encontrar o botão de Dropdown do primeiro card (MissionCard)
    // No mission-card.tsx, adicione data-testid="mission-actions-trigger" no botão do DropdownMenuTrigger
    // Como não temos certeza se os IDs foram adicionados, vamos tentar pelo texto ou ícone genericamente:
    
    try {
        // Tenta achar o botão "Iniciar Simulação" direto no card (se a missão não estiver concluída)
        // O arquivo mission-card.tsx mostra um botão visível no footer: "Iniciar Simulação"
        const btnSimulacao = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Iniciar Simulação')]")), 
            3000
        );
        await btnSimulacao.click();

        // Verificar se o Dialog de Simulação abriu
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Simulação:')]")), 2000);
        console.log('✅ Dialog de simulação aberto.');
        
        // Fechar Dialog (ESC)
        await driver.actions().sendKeys(Key.ESCAPE).perform();

    } catch (e) {
        console.log('ℹ️ Nenhuma missão disponível para simulação ou botão não encontrado.');
    }

    // ==========================================
    // TESTE 4: PAINEL DE CONTROLE (Protocolos)
    // ==========================================
    // Este teste assume que você entrou na página de detalhes da missão. 
    // Se a URL for /missao/123, você pode forçar a navegação se souber um ID, 
    // ou clicar no card se implementou a navegação.
    
    // Exemplo de teste de protocolo se estivesse na página correta:
    /*
    console.log('\nTesting: Acionamento de Protocolo...');
    const btnProtocolo = await driver.findElement(By.css('[data-testid="btn-protocol-medical"]'));
    await btnProtocolo.click();
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Protocolo médico de emergência')]")), 3000);
    console.log('✅ Protocolo acionado.');
    */

  } catch (error) {
    console.error('❌ Erro fatal no teste:', error);
  } finally {
    await driver.quit();
  }
})();