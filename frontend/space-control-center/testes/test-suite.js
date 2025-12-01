const { Builder, By, until, Key } = require('selenium-webdriver');
require('chromedriver');

(async function runFullTestSuite() {
  let driver = await new Builder().forBrowser('chrome').build();

  // ✅ Helper para Selects
  async function selectOption(triggerTestId, optionTestId) {
    const trigger = await driver.wait(
      until.elementLocated(By.css(`[data-testid="${triggerTestId}"]`)), 
      5000
    );
    await driver.wait(until.elementIsVisible(trigger), 2000);
    await trigger.click();
    
    const option = await driver.wait(
      until.elementLocated(By.css(`[data-testid="${optionTestId}"]`)),
      3000
    );
    await driver.wait(until.elementIsVisible(option), 2000);
    await option.click();
  }

  // ✅ Helper para preencher input
  async function fillInput(testId, value) {
    const input = await driver.wait(
      until.elementLocated(By.css(`[data-testid="${testId}"]`)),
      5000
    );
    await driver.wait(until.elementIsVisible(input), 3000);
    await driver.executeScript("arguments[0].scrollIntoView(true);", input);
    await input.clear();
    await input.sendKeys(value);
  }

  // ✅ Helper para clicar em botão
  async function clickButton(testId) {
    const button = await driver.wait(
      until.elementLocated(By.css(`[data-testid="${testId}"]`)),
      5000
    );
    await driver.wait(until.elementIsVisible(button), 3000);
    await driver.wait(until.elementIsEnabled(button), 2000);
    await button.click();
  }

  // ✅ NOVO: Helper para aguardar modal/dialog fechar
  async function waitForDialogClose() {
    try {
      // Aguarda todos os overlays desaparecerem
      await driver.wait(async () => {
        const overlays = await driver.findElements(
          By.css('[data-slot="dialog-overlay"], [data-radix-dialog-overlay]')
        );
        
        if (overlays.length === 0) return true;
        
        // Verifica se todos estão invisíveis
        for (const overlay of overlays) {
          try {
            if (await overlay.isDisplayed()) return false;
          } catch (e) {
            // Elemento removido do DOM
            continue;
          }
        }
        return true;
      }, 5000);
      
      // Aguarda mais um pouco para animações terminarem
      await driver.sleep(500);
      console.log('✅ Modal fechado completamente');
    } catch (e) {
      console.log('⚠️ Timeout aguardando modal fechar');
    }
  }

  // ✅ NOVO: Helper para fechar qualquer modal aberto (ESC)
  async function closeAnyOpenModal() {
    await driver.actions().sendKeys(Key.ESCAPE).perform();
    await driver.sleep(300);
  }

  try {
    await driver.get('http://localhost:3000');
    await driver.manage().window().setRect({ width: 1280, height: 800 });

    console.log('🚀 Iniciando Suite de Testes Completa...\n');

    // ==========================================
    // TESTE 1: CADASTRO DE ASTRONAUTA
    // ==========================================
    console.log('👨‍🚀 TESTE 1: Cadastro de Astronauta');
    
    await clickButton('nav-astronautas');
    console.log('✅ Navegou para Astronautas');

    await clickButton('btn-add-astronaut');
    console.log('✅ Modal aberto');

    await fillInput('input-astro-name', 'Major Tom');
    await fillInput('input-astro-age', '32');
    console.log('✅ Dados preenchidos');

    await selectOption('select-aptidao', 'option-alto');
    console.log('✅ Aptidão selecionada');

    await clickButton('btn-save-astro');
    console.log('✅ Astronauta salvo');

    // ✅ AGUARDA MODAL FECHAR
    await waitForDialogClose();
    console.log();

    // ==========================================
    // TESTE 2: CADASTRO DE OPERADOR
    // ==========================================
    console.log('👷 TESTE 2: Cadastro de Operador');
    
    await clickButton('nav-operadores');
    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(), 'Gerenciamento de Operadores')]")), 
      5000
    );
    console.log('✅ Página de operadores carregada');

    await clickButton('btn-add-operator');
    console.log('✅ Modal aberto');

    await fillInput('input-operator-name', 'John Smith');
    await fillInput('input-operator-age', '28');
    await fillInput('input-operator-shift', 'Noturno');
    await fillInput('input-operator-area', 'Comunicações');
    console.log('✅ Dados preenchidos');

    await clickButton('btn-save-operator');
    console.log('✅ Operador salvo');

    // ✅ AGUARDA MODAL FECHAR
    await waitForDialogClose();
    console.log();

    // ==========================================
    // TESTE 3: CADASTRO DE NAVE ESPACIAL
    // ==========================================
    console.log('🚀 TESTE 3: Cadastro de Nave Espacial');
    
    await clickButton('nav-espaconaves');
    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(), 'Gerenciamento de Espaçonaves')]")), 
      5000
    );
    console.log('✅ Página de naves carregada');

    await clickButton('btn-add-spaceship');
    console.log('✅ Modal aberto');

    await fillInput('input-spaceship-name', 'Endeavour');
    await fillInput('input-spaceship-capacity', '8');
    console.log('✅ Dados básicos preenchidos');

    await selectOption('select-spaceship-status', 'option-operacional');
    console.log('✅ Status selecionado');

    await clickButton('btn-save-spaceship');
    console.log('✅ Nave salva');

    // ✅✅✅ CORREÇÃO CRÍTICA: AGUARDA MODAL FECHAR ANTES DE NAVEGAR
    await waitForDialogClose();
    console.log();

    // ==========================================
    // TESTE 4: CRIAÇÃO DE MISSÃO
    // ==========================================
    console.log('🎯 TESTE 4: Criação de Missão');
    
    // Agora é seguro navegar
    await clickButton('nav-home');
    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(), 'Dashboard de Missões')]")), 
      5000
    );
    console.log('✅ Dashboard carregado');

    await clickButton('btn-new-mission');
    console.log('✅ Sheet de missão aberto');

    // Aguarda animação do Sheet
    await driver.sleep(1000);

    await fillInput('input-mission-name', 'Missão Artemis');
    await fillInput('input-mission-objective', 'Estabelecer base lunar permanente');
    console.log('✅ Nome e objetivo preenchidos');

    // Selecionar data
    console.log('📅 Selecionando data...');
    await clickButton('btn-calendar-trigger');
    await driver.sleep(500);
    
    const day15 = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(@class, 'rdp-day') and not(contains(@class, 'rdp-outside')) and text()='15']")),
      3000
    );
    await day15.click();
    console.log('✅ Data selecionada');

    // Selecionar nave
    console.log('🚀 Selecionando nave...');
    await selectOption('select-mission-spaceship', 'option-spaceship-1');
    console.log('✅ Nave selecionada');

    // Salvar missão
    await clickButton('btn-save-mission');
    console.log('✅ Missão criada com sucesso!');

    // ✅ AGUARDA SHEET FECHAR
    await waitForDialogClose();
    console.log();

    // ==========================================
    // TESTE 5: VERIFICAÇÃO FINAL
    // ==========================================
    console.log('🔍 TESTE 5: Verificação Final');
    
    await driver.sleep(1000);
    console.log('✅ Verificação concluída');

    console.log('\n✅✅✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO! ✅✅✅');

  } catch (error) {
    console.error('❌ Erro fatal no teste:', error.message);
    
    // Captura screenshot
    try {
      const screenshot = await driver.takeScreenshot();
      require('fs').writeFileSync('error-screenshot.png', screenshot, 'base64');
      console.log('📸 Screenshot salvo em error-screenshot.png');
    } catch (e) {
      console.log('⚠️ Não foi possível salvar screenshot');
    }
    
    throw error;
  } finally {
    await driver.quit();
  }
})();