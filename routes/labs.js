const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Funzione per caricare i laboratori da un file JSON
const loadLabs = () => {
    const data = fs.readFileSync(path.join(__dirname, 'labs.json'), 'utf-8');
    return JSON.parse(data);
};

// Funzione per salvare i laboratori in un file JSON
const saveLabs = (labs) => {
    fs.writeFileSync(path.join(__dirname, 'labs.json'), JSON.stringify(labs, null, 2), 'utf-8');
};

let labs = loadLabs(); // Carica i laboratori all'avvio

module.exports = (io) => {
    router.get('/', (req, res) => {
        res.json(labs);
    });

    router.post('/occupy', (req, res) => {
        const { nome, utente } = req.body;
        const lab = labs.find(l => l.nome === nome);

        if (lab && !lab.stato) {
            lab.stato = true;
            lab.utente = utente;
            lab.ora = new Date().toISOString();
            saveLabs(labs); // Salva i dati aggiornati
            io.emit('lab_status', lab);
            res.status(200).send(lab);
        } else {
            res.status(400).send({ error: 'Laboratorio non disponibile' });
        }
    });

    router.post('/release', (req, res) => {
        const { nome, utente } = req.body;
        const lab = labs.find(l => l.nome === nome);

        if (!lab) {
            return res.status(404).send('Laboratorio non trovato');
        }

        if (lab.utente !== utente) {
            return res.status(403).send('Non sei autorizzato a liberare questo laboratorio');
        }

        // Libera il laboratorio
        lab.utente = null;
        lab.stato = false; // Imposta lo stato su "disponibile"
        lab.ora = new Date().toISOString(); // Aggiorna l'orario
        saveLabs(labs); // Salva i dati aggiornati

        // Invia l'aggiornamento a tutti i client
        io.emit('lab_status', lab);
        res.send(lab);
    });

    return router;
};
