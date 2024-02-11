const express = require("express");
const ex = express();
const bodyParser = require("body-parser");
const connection = require("./database/connection");
const register = require("./database/ClientsDb");
const monthsTable = require("./database/Months");
const path = require('path');


ex.set("view engine", "ejs");
ex.use(express.static(path.join(__dirname, 'public')));
ex.use(bodyParser.urlencoded({ extended: false }));
ex.use(bodyParser.json());

connection
    .authenticate()
    .then(() => {
        console.log("Conectado ao banco de dados");
    })
    .catch((err) => {
        console.log(err)
    })

ex.get("/", (req, res) => {
    res.render("home");
})

ex.post("/savedata", async (req, res) => {
    try {
        const { name, email, tel, birth, obs } = req.body;
        const [day, month, year] = birth.split("/");
        const formattedBirth = new Date(year, month - 1, day);

        await register.create({
            name: name,
            email: email,
            tel: tel,
            birth: formattedBirth,
            obs: obs,
            meseId: month
        });

        res.redirect("/clients");
    } catch (error) {
        console.error('Erro ao salvar os dados:', error);
        res.status(500).send('Ocorreu um erro ao salvar os dados.');
    }
});


ex.get("/clients", (req, res) => {
    register.findAll({ raw: true }).then((clients) => {
        monthsTable.findAll({ raw: true }).then(months => {
            const formattedClients = clients.map(client => {
                const formattedBirth = new Date(client.birth).toLocaleDateString('pt-BR');
                const [ day, month, year ] = formattedBirth.split("/");
    
                return {
                    ...client,
                    birth: formattedBirth
                };
            });
            res.render("clients", {
                clients: formattedClients,
                months: months
            })
        })
    });
})


ex.post("/clients/delet", (req, res) => {
    let id = req.body.id;
    register.destroy({ where: { id: id } }).then(() => {
        res.redirect("/clients")
    })
})

ex.post("/clients/edit", (req, res) => {
    let id = req.body.id;
    register.findOne({ where: { id: id }, raw: true }).then((client) => {
        if (client) {
            const formattedBirth = new Date(client.birth).toLocaleDateString('pt-BR');
            client.birth = formattedBirth;
            res.render("edit", { client: client });
        } else {
            res.status(404).send("Cliente não encontrado");
        }
    })
});

ex.post("/clients/edit/save", (req, res) => {
    const { id, name, email, tel, birth, obs } = req.body;
    const [day, month, year] = birth.split("/");
    const formattedBirth = new Date(year, month - 1, day);
    register.update(
        { name: name, email: email, tel: tel, birth: formattedBirth, obs: obs },
        { where: { id: id } }
    ).then(() => {
        res.redirect("../../clients")
    })
})

ex.get("/admin/months", (req, res) => {
    res.render("months");
})

ex.post("/admin/months/save", (req, res) => {
    let name = req.body.name;
    let position = req.body.position;
    monthsTable.create({
        name: name,
        position: position
    }).then(() => {
        res.redirect("/admin/months")
    })
})

ex.post("/clients/filter", (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Expires', '0');
    res.setHeader('Pragma', 'no-cache');
    let monthSelected = req.body.selectMonth;
    register.findAll({ raw: true, where: { meseId: monthSelected } }).then((clients) => {
        monthsTable.findAll({ raw: true }).then(months => {
            const formattedClients = clients.map(client => {
                const formattedBirth = new Date(client.birth).toLocaleDateString('pt-BR');
                const [ day, month, year ] = formattedBirth.split("/");
    
                return {
                    ...client,
                    birth: formattedBirth
                };
            });
            res.render("filter", {
                client: formattedClients,
                months: months,
                monthSelected: monthSelected
            })
        })
    });
})

ex.listen(5050, () => {
    console.log("Server on")
});