console.log("Electron - Processo Principal");

// Importação dos recursos do framework
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain } = require('electron');

// Ativação do preload.js (importação do path)
const path = require('node:path');

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js');

// Janela principal
let win;
const createWindow = () => {
  // Definido o tema da janela claro ou escuro 
  nativeTheme.themeSource = 'light';
  
  win = new BrowserWindow({
    width: 1010,
    height: 720,
    //frame: false,
    //resizable: false,
    //minimizable: false,
    //closable: false,
    //autoHideMenuBar: true
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') // Corrigido __dirname
    }
  });
  
  // Carregar o menu personalizado 
  // ATENÇÃO: antes de importar o recurso Menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // Carregar o documento HTML na janela
  win.loadFile('./src/views/index.html');
};

// Janela sobre
function aboutWindow() {
  nativeTheme.themeSource = 'light';
  
  // Obter a janela principal 
  const mainWindow = BrowserWindow.getFocusedWindow();
  
  // Validação (se existir a janela principal)
  if (mainWindow) {
    about = new BrowserWindow({
      width: 320,
      height: 260,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false, // Corrigido erro de digitação
      // Estabelecer uma relação hierárquica entre janelas
      parent: mainWindow,
      // Criar uma janela modal (se retornar à principal quando encerrada)
      modal: true
    });
    
    about.loadFile('./src/views/sobre.html');
  }
}

// Inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
  createWindow();
  
  // Melhor local para estabelecer a conexão com o banco de dados
  // No MongoDB é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e encerrar a conexão quando o aplicativo for finalizado
  // ipcMain.on (receber mensagem)
  // db-connect (rótulo da mensagem)
  
  ipcMain.on('dbconnect', async (event) => {
    // A linha abaixo estabelece conexão ao banco de dados
    await conectar();
    
    // Enviar ao renderizador uma mensagem para trocar a imagem do ícone do status do banco de dados (criar um delay de 0.5 ou 1s para sincronização com a nuvem)
    setTimeout(() => {
      // Enviar ao renderizador a mensagem "conectado"
      // db-status (IPC)
      event.reply('db-status', 'conectado');
    }, 1000);
  });
  
  // Só ativar a janela principal se nenhuma outra estiver ativa
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Se o sistema não for MAC, encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IMPORTANTE! Desconectar do banco de dados quando a aplicação for finalizada
app.on('before-quit', async () => {
  await desconectar();
});

// Reduzir a verbosidade de logs não críticos (devtools)
app.commandLine.appendSwitch('log-level', '3');

// Template do menu
const template = [
  {
    label: 'Notas',
    submenu: [
      {
        label: 'Criar nota',
        accelerator: 'Ctrl+N'
      },
      {
        type: 'separator'
      },
      {
        label: 'Sair',
        accelerator: 'Alt+F4',
        click: () => app.quit()
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Aplicar Zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar o Zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'DevTools',
        role: 'toggleDevTools'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('https://github.com/AlexsLima17/stickynotes')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
];
