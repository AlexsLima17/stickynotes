/**
 * preload.js - Usado no framework electron 
 * 
 */
// Importação dos recursos do framework electron 
// IpcRenderer permite estabelecer uma comunição entre processos (IPC) main.js <=>

const { ipcRenderer } = require('electron')

//Enviar uma mensagem para o main.js estabeleecer uma conexão com o banco de dados quando iniciar a aplicação 
//send (enviar)
//db-connect (rótulo para identificar a mensagem)
ipcRenderer.send('db-connect')

// Permissões para estabelecer a comunicação entre processos
contextBridge.exposedInIsolatedWorld('api', {
    dbstatus: (message) => ipcRenderer.on('db-status', message)
})

