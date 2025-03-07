console.log("Electron - Processo Principal")
// Importação dos recursos do framework
// app (aplicação)
// BrowserWindow (Criação da janela)
// nativeTheme (está relacionado ao tema (claro ou escuro))
// Menu (definir um menu personalizado)
// Shell  ( acessar links no navegador padrão)
const { app, BrowserWindow, nativeTheme, Menu } = require('electron/main')

// Janela principal
let win
const createWindow = () => {
  //  definido o tema da janela claro ou escuro 
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1010,
    height: 720,
    //frame: false,
    //resizable: false,
    //minimizable: false,
    //closable: false,
    //autoHideMenuBar: true
  })

  // carregar o menu personalizado 
  // ATENÇÃO: antes de importar o recursos Menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  // carregar o documunte html na janela
  win.loadFile('./src/views/index.html')
}

// Janela sobre
function aboutWindow() {
  nativeTheme.themeSource='light'
  // obter a janela principal 
  const mainWindow = BrowserWindow.getFocusedWindow()
  // validação (se existir a janela principal)
  if (mianWindow){
    about = new BrowserWindow({
      width: 320,
      height: 260,
      autoHideMenuBar: true,
      resizable: false,
      minmizable: false,
      // estabelecer uma relação hierárquica entre janelas
      parent: mainWindow,
      // criar uma janela modal ( se retornar a principal quando encerrada)
      modal: true
    })

  }
 
  about.loadFile ('./src/views/sobre.html')
}
// inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
  createWindow()

  // só ativar a janela principal se nenhuma outra estiver ativa
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// se o sistema não for MAC encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//Reduzir a verbozidade de logs não críticos (devtools)
app.commandLine.appendSwitch('log-level', '3')

// template do menu 
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
      },
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label:'Aplicar Zoom',
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
        click: () => aboutWindow ()
      }
    ]
  }
]