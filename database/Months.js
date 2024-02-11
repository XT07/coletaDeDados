const sequelize = require("sequelize");
const connection = require("./connection");

const months = connection.define("meses", {
    name: {
        type: sequelize.STRING,
        allowNull: false
    },
    position: {
        type: sequelize.INTEGER,
        allowNull: false
    }
});

months.sync({force: false}).then( () => {
    console.log("Tabela atualizada")
});

module.exports = months;