/**
 * Módulo de conexão com o banco de dados
 * Uso do framework mongoose
 */

// importação do mongoose
// Não esquecer de instalar o módulo (npm i mongoose)
const mongoose = require('mongoose')

// configuração do banco de dados
// ip/link do servidor, autenticação 
// ao final da url definir o nome do banco de dados
// exemplo: /dbnotes
const url = 'mongodb+srv://admin:123Senac@cluster01.xdmri.mongodb.net/dbnotas'

// validação (evitar a abertura de várias conexões)
let connected = false

// método para conectar com o banco de dados
const connectDB = async () => {
    // se não estiver conectado
    if (!connected) {
        //conectar com o banco de dados
        try {
            await mongoose.connect(url) //conectar
            connected = true //setar a variável
            console.log("MongoDB conectado")
            return true //verificação para o main
        } catch (error) {
            console.log(error)
            return false           
        }
    }
}

// método para desconectar do banco de dados
const disconnectDB = async () => {
    // se estiver conectado
    if (connected) {
        // desconectar
        try {
            await mongoose.disconnect(url) //desconectar
            connected = false //setar a variável
            console.log("MongoDB desconectado")
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}

//exportar para o main os métodos conectar e desconectar
module.exports = { connectDB, disconnectDB }