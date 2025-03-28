console.log("Electron - Processo principal")
 
// importação dos recursos do framework
// app (aplicação)
// BrowserWindow (criação da janela)
// nativeTheme (definir tema claro ou escuro)
// Menu (definir um menu personalizado)
// shell (acessar links externos no navegador padrão)
// ipcMain permite estabelecer uma comucação entre os processos (IPC) main.js <-> renderer.js
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain } = require('electron/main')
 
// ativação do preload.js (importação do path)
const path = require('node:path')
 
//importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')
 
//importar o modelo de dados (Nodes.js)
const noteModel = require('./src/models/Nodes.js')
 
//Janela principal
let win
const createWindow = () => {
  // definindo o tema claro ou escuroda janela claro ou escuro
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1080,
    height: 900,
    //frame: false,
    //resizable: false,
    //minimizable: false,
    //closable: false,
    //autoHideMenuBar: true,
    //movable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
 
  // carregar o menu personalizado
  // Atenção! antes importar o recurso Menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  // Carregar o documento html na janela
  win.loadFile('./src/views/index.html')
}
 
// Janela sobre
let about
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  // obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // validação (se existir a janela principal)
  if (mainWindow) {
    about = new BrowserWindow({
      width: 320,
      height: 230,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      //estabelecer uma relação hierarquica entre janelas
      parent: mainWindow,
      // criar uma janela modal (só retorna a principal quando encerrada)
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }
 
  about.loadFile('./src/views/sobre.html')
 
  //recebimento da mensagem de renderização da tela sobre sobre para fechar a janela usando o botão 'OK'
  ipcMain.on('about-exit', () => {
    //validação (se existir a janela e ela não estiver destruida, fechada)
    if (about && !about.isDestroyed()) {
      about.close() //fechar a janela
    }
  })
}
 
// Janela nota
let note
function noteWindow() {
  nativeTheme.themeSource = 'light'
  // obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // validação (se existir a janela principal)
  if (mainWindow) {
    note = new BrowserWindow({
      width: 500,
      height: 400,
      autoHideMenuBar: true,
      //resizable: false,
      //minimizable: false,
      //estabelecer uma relação hierarquica entre janelas
      parent: mainWindow,
      // criar uma janela modal (só retorna a principal quando encerrada)
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }
 
  note.loadFile('./src/views/nota.html')
}
 
 
 
// inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
  createWindow()
 
  // melhor local para estabeler a conexão com o banco de dados
  // No MongoDB é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e encerrar a conexão quando o aplicativo for finalizado
  // ipcMain.on (receber mensagem)
  // db-connect (rótulo da mensagem)
  ipcMain.on('db-connect', async (event) => {
    //alinha abaixo estabelece a conexão com o banco de dados
    // e verifica se foi conectado com sucesso (return true)
    const conectado = await conectar()
    if (conectado) {
      // enviar ao renderizador uma mensagem para trocar a imagem do ícone ícone do status do banco dados(Criar um delay 0.5 ou 1s para sincronização com a nuvem)
      setTimeout(() => {
        //enviar ao renderizador a mensagem "conectado"
        // db-status (IPC - comunicação entre processos - proload.js)
        event.reply('db-status', "conectado")
      }, 500) //500ms = 0.5s
    }
  })
 
  // só ativar a janela principal se nenhuma outra estiver ativa
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})
 
// se o sistema não MAC encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
 
// IMPORTANTE! Desconectar a conexão com o banco dados quando a aplicação for finalizada
app.on('before-quit', async () => {
  await desconectar()
})
 
//Reduzir o verbozidade de tops não criticos (devtools)
app.commandLine.appendSwitch('log-level', '3')
 
//template do meni
const template = [
  {
    label: 'Notas',
    submenu: [
      {
        label: 'Criar nota',
        accelerator: 'Ctrl+N',
        click: () => noteWindow()
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
        label: 'Aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir zoom',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar Zoom padrão',
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
        label: 'Repositorio',
        click: () => shell.openExternal('https://github.com/AlexsLima17/stickynotes')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]
 
// =================================================================
// == CRUD Create ==================================================
 
 
// Recebimento do objeto que contem os dados da nota
ipcMain.on('create-note', async(event, stickyNote) => {
  //IMPORTANTE! Teste de recebimento do objeto - Passo 2
  console.log(stickyNote)
  //Criar uma nova estrutura de dados para salvar no banco
  //ATENÇÃO!!! Os atributos da estrutura precisam ser identicos ao modelo e os valores são obtidos através do objeto StickNotes
  const newNote = noteModel({
    texto: stickyNote.textNote,
    cor: stickyNote.colorNote
  })
  // Salvar a nota no bancod e dados (Passo 3 - fluxo)
  newNote.save()
  // enviar ao renderizador um pedido para limpar os campos e setar o formulário para os padrões originais(foco no texto) usando o preload.js
  event.reply('reset-form')
 })
 
 
// == Fim - CRUD Create ============================================
// =================================================================
 