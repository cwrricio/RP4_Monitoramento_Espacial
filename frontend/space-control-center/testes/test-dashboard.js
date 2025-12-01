const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function testMissionsDashboard() {
  // Configuração do Driver (Chrome)
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    // 1. Acessar a aplicação (Ajuste a porta se necessário)
    await driver.get('http:/localhost:3000');

    // --- TESTE 1: CARREGAMENTO INICIAL ---
    console.log('Iniciando Teste 1: Verificação de Título e Carregamento...');
    
    // Esperar o título aparecer (timeout de 10s)
    let titleElement = await driver.wait(
      until.elementLocated(By.css('[data-testid="dashboard-title"]')), 
      10000
    );
    
    let titleText = await titleElement.getText();
    if (titleText === "Dashboard de Missões") {
      console.log('✅ Título verificado com sucesso.');
    } else {
      console.error('❌ Título incorreto:', titleText);
    }

    try {
        await driver.wait(until.elementLocated(By.css('[data-testid="loading-state"]')), 2000);
        let loading = await driver.findElement(By.css('[data-testid="loading-state"]'));
        await driver.wait(until.stalenessOf(loading), 5000);
        console.log('✅ Loading desapareceu.');
    } catch (e) {
        console.log('ℹ️ Loading foi muito rápido ou não apareceu.');
    }

    console.log('\nIniciando Teste 2: Abrir Modal de Criação...');
    
    let btnNewMission = await driver.findElement(By.css('[data-testid="btn-new-mission"]'));
    await btnNewMission.click();


    let dialog = await driver.wait(
        until.elementLocated(By.xpath("//div[@role='dialog']")), 
        3000
    );

    if (await dialog.isDisplayed()) {
        console.log('✅ Modal de Nova Missão aberto.');
        

        await driver.actions().sendKeys('\uE00C').perform(); // Código para tecla ESCAPE
        await driver.sleep(500); // Pequena pausa para animação de fechar
    } else {
        console.error('❌ Modal não abriu.');
    }

    // --- TESTE 3: NAVEGAÇÃO DE ABAS ---
    console.log('\nIniciando Teste 3: Navegação de Abas...');
    
    let tabPlanejada = await driver.findElement(By.css('[data-testid="tab-planejada"]'));
    await tabPlanejada.click();

    // Verificamos se o atributo 'data-state' mudou para 'active' (comum no Radix UI/Shadcn)
    let state = await tabPlanejada.getAttribute('data-state');
    
    if (state === 'active') {
        console.log('✅ Aba "Planejadas" ativada com sucesso.');
    } else {
        console.error('❌ Falha ao ativar a aba.');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    // Fechar o navegador
    await driver.quit();
  }
})();