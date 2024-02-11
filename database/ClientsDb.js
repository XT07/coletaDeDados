const sequelize = require("sequelize");
const connection = require("./connection");
const months = require("./Months");

const cadastro = connection.define("clientes", {
    name: {
        type: sequelize.STRING,
        allowNull: false
    },
    email: {
        type: sequelize.TEXT,
        allowNull: true
    },
    tel: {
        type: sequelize.STRING,
        allowNull: false
    },
    obs: {
        type: sequelize.TEXT,
        allowNull: true
    },
    birth: {
        type: sequelize.DATE,
        allowNull: false
    },
    meseId: {
        type: sequelize.INTEGER,
        allowNull: false
    }
});

cadastro.sync({force: false}).then( () => {
    console.log("Tabela atualizada")
});

module.exports = cadastro;