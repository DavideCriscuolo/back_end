import connection from "./../db/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Importa il modulo 'crypto' di Node.js per generare token univoci per il reset password
import sendgrid from "@sendgrid/mail"; // Importa il modulo '@sendgrid/mail' per inviare email tramite SendGrid

// Importa il modulo 'fs' di Node.js (File System) per leggere, scrivere e controllare file sul server
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Importa il modulo 'path' di Node.js per creare percorsi compatibili su tutti i sistemi operativi
import path from "path";
import e from "express";

// Test temporaneo di bcrypt
const testPassword = "test123";
bcrypt.hash(testPassword, 10, (err, hash) => {
  if (err) {
    console.error("Errore bcrypt hash:", err);
  } else {
    console.log("Hash generato:", hash);
    bcrypt.compare(testPassword, hash, (err, result) => {
      if (err) {
        console.error("Errore bcrypt compare:", err);
      } else {
        console.log("Risultato compare:", result); // Deve essere true
      }
    });
  }
});

export const index = (req, res) => {
  const sql = "SELECT * FROM iscritti;";

  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        err: err.message,
      });
    }
    console.log(results);
    res.json(results);
  });
};
export const showProfileUser = (req, res) => {
  const id_iscritto = req.params.id;
  console.log("req.params.id:", req.params.id);

  const sql =
    "SELECT * FROM iscritti LEFT JOIN `info_iscritti` ON `info_iscritti`.`id_iscritto` = `iscritti`.`id` WHERE `id_iscritto` = ? ";
  connection.query(sql, [id_iscritto], (err, results) => {
    if (err) {
      return res.status(500).json({
        err: err.message,
      });
    }
    console.log(results);

    if (results.length === 0) {
      return res.status(404).json({
        err: "Iscritto non trovato",
      });
    }
    console.log(results[0]);
    return res.json(results[0]);
  });
};
export const show = (req, res) => {
  const id = Number(req.params.id);
  console.log("req.params.id:", req.params.id);

  const sql = "SELECT * FROM iscritti WHERE `id` = ?;";
  connection.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        err: err.message,
      });
    }
    console.log(results);

    if (results.length === 0) {
      return res.status(404).json({
        err: "Iscritto non trovato",
      });
    }
    console.log(results[0]);
    return res.json(results[0]);
  });
};
export const showEmail = (req, res) => {
  const email = req.params.email;
  console.log("req.params.email:", req.params.email);

  const sql =
    "SELECT * FROM iscritti LEFT JOIN `info_iscritti` ON `info_iscritti`.`id_iscritto` = `iscritti`.`id` WHERE `email` = ? ";
  connection.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({
        err: err.message,
      });
    }
    console.log(results);

    if (results.length === 0) {
      return res.status(404).json({
        err: "Iscritto non trovato",
      });
    }
    console.log(results[0]);
    return res.json(results[0]);
  });
};
export const loginAdmin = (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM admin_gym WHERE `email` = ?;";

  connection.query(sql, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({
        message: "Credenziali errate",
        err: err ? err.message : undefined,
        // password: password, // NON RESTITUIRE LA PASSWORD
      });
    }

    const user = results[0];
    if (typeof user.password !== "string" || !user.password) {
      return res
        .status(500)
        .json({ message: "Password non valida nel database" });
    }
    console.log(password, "password inserita");
    console.log(user.password, "password nel db");
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Errore server", err: err.message });
      }
      if (!isMatch) {
        return res.status(401).json({ message: "Password errata" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token });
    });
  });
};
export const login = (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM iscritti WHERE `email` = ?;";

  connection.query(sql, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: "Credenziali errate" });
    }

    const user = results[0];
    if (typeof user.password !== "string" || !user.password) {
      return res
        .status(500)
        .json({ message: "Password non valida nel database" });
    }
    console.log(password, "password inserita");
    console.log(user.password, "password nel db");
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: "Errore server" });
      }
      if (!isMatch) {
        return res.status(401).json({ message: "Password errata" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token });
    });
  });
};

export const register = (req, res) => {
  const { nome, cognome, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e password richieste" });
  }

  const sqlCheck = "SELECT * FROM iscritti WHERE email = ?";
  connection.query(sqlCheck, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Errore DB" });

    if (results.length > 0) {
      return res.status(409).json({ message: "Utente già registrato" });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: "Errore hashing" });

      const sqlInsert =
        "INSERT INTO iscritti (nome, cognome, email, password) VALUES (?, ?, ?, ?)";
      connection.query(
        sqlInsert,
        [nome, cognome, email, hash],
        (err2, result) => {
          if (err2) {
            console.error("Errore inserimento:", err2);
            return res.status(500).json({ message: "Errore inserimento" });
          }

          const newUserId = result.insertId;

          // Creazione automatica della riga in info_iscritti
          const sqlInsertInfo =
            "INSERT INTO info_iscritti (id_iscritto) VALUES (?)";
          connection.query(sqlInsertInfo, [newUserId], (err3) => {
            if (err3) {
              console.error("Errore creazione info_iscritti:", err3);
              return res
                .status(500)
                .json({ message: "Errore creazione info_iscritti" });
            }

            res.json({ message: "Registrazione completata", id: newUserId });
          });
        }
      );
    });
  });
};

export const profile = (req, res) => {
  res.json({ message: "Acesso autorizzato", user: req.user }); //
};

export const update = (req, res) => {
  const id_iscritto = Number(req.params.id);
  console.log("BODY RICEVUTO:", req.body);
  console.log("ID ISCRITTO:", id_iscritto);

  const spalle = Number(req.body.spalle);
  const petto = Number(req.body.petto);
  const vita = Number(req.body.vita);
  const gambaSinistra = Number(req.body.gambaSinistra);
  const gambaDestra = Number(req.body.gambaDestra);
  const peso = Number(req.body.peso);
  const bicipiteDestro = Number(req.body.bicipiteDestro);
  const bicipiteSinistro = Number(req.body.bicipiteSinistro);
  const polpaccioDestro = Number(req.body.polpaccioDestro);
  const polpaccioSinistro = Number(req.body.polpaccioSinistro);
  const plica = Number(req.body.plica);
  const data = req.body.data;

  if (
    [
      spalle,
      petto,
      vita,
      gambaSinistra,
      gambaDestra,
      peso,
      bicipiteDestro,
      bicipiteSinistro,
      polpaccioDestro,
      polpaccioSinistro,
      plica,
    ].some(isNaN)
  ) {
    return res
      .status(400)
      .json({ err: "Alcuni campi obbligatori sono mancanti o non numerici" });
  }

  const sql =
    "UPDATE `info_iscritti` SET `spalle` = ?, `petto` = ?, `vita` = ?, `gambaSinistra` = ?, `gambaDestra` = ?, `peso` = ?, `bicipiteDestro` = ?, `bicipiteSinistro` = ?, `polpaccioDestro` = ?, `polpaccioSinistro` = ?, `plica` = ?, `data`= ? WHERE `id_iscritto` = ?;";

  connection.query(
    sql,
    [
      spalle,
      petto,
      vita,
      gambaSinistra,
      gambaDestra,
      peso,
      bicipiteDestro,
      bicipiteSinistro,
      polpaccioDestro,
      polpaccioSinistro,
      plica,
      data,
      id_iscritto,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          err: err.message,
          message: "Non è stato possibile aggiornare le misure",
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ err: "Iscritto non trovato" });
      }

      return res.json({
        message: "Misure aggiornate con successo",
        results,
      });
    }
  );
};
export const store = (req, res) => {
  const id_iscritto = Number(req.params.id);
  console.log("BODY RICEVUTO:", req.body);
  console.log("ID ISCRITTO:", id_iscritto);

  const spalle = req.body.spalle !== "" ? Number(req.body.spalle) : null;
  const petto = req.body.petto !== "" ? Number(req.body.petto) : null;
  const vita = req.body.vita !== "" ? Number(req.body.vita) : null;
  const gambaSinistra =
    req.body.gambaSinistra !== "" ? Number(req.body.gambaSinistra) : null;
  const gambaDestra =
    req.body.gambaDestra !== "" ? Number(req.body.gambaDestra) : null;
  const peso = req.body.peso !== "" ? Number(req.body.peso) : null;
  const bicipiteDestro =
    req.body.bicipiteDestro !== "" ? Number(req.body.bicipiteDestro) : null;
  const bicipiteSinistro =
    req.body.bicipiteSinistro !== "" ? Number(req.body.bicipiteSinistro) : null;
  const polpaccioDestro =
    req.body.polpaccioDestro !== "" ? Number(req.body.polpaccioDestro) : null;
  const polpaccioSinistro =
    req.body.polpaccioSinistro !== ""
      ? Number(req.body.polpaccioSinistro)
      : null;
  const plica = req.body.plica !== "" ? Number(req.body.plica) : null;
  const data = req.body.data || null; // se vuoi consentire NULL

  if (
    [
      spalle,
      petto,
      vita,
      gambaSinistra,
      gambaDestra,
      peso,
      bicipiteDestro,
      bicipiteSinistro,
      polpaccioDestro,
      polpaccioSinistro,
      plica,
    ].some(isNaN)
  ) {
    return res
      .status(400)
      .json({ err: "Alcuni campi obbligatori sono mancanti o non numerici" });
  }

  const sql = `
    INSERT INTO info_iscritti 
    (id_iscritto, spalle, petto, vita, gambaSinistra, gambaDestra, peso, bicipiteDestro, bicipiteSinistro, polpaccioDestro, polpaccioSinistro, plica, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [
      id_iscritto,
      spalle,
      petto,
      vita,
      gambaSinistra,
      gambaDestra,
      peso,
      bicipiteDestro,
      bicipiteSinistro,
      polpaccioDestro,
      polpaccioSinistro,
      plica,
      data,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          err: err.message,
          message: "Non è stato possibile aggiornare le misure",
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ err: "Iscritto non trovato" });
      }

      return res.json({
        message: "Misure Inserite con successo",
        results,
      });
    }
  );
};

export const scheda = (req, res) => {
  // Crea il percorso completo del file sul disco
  // process.cwd() = cartella in cui sta girando il server
  // path.join(...) concatena i pezzi del percorso in modo sicuro
  const filePath = path.join(
    process.cwd(),
    "uploads",
    "schede",
    req.params.fileName
  );

  // Controlla se il file esiste davvero nella cartella
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File non trovato" });
  }

  // Se esiste, invia il file al client
  // res.sendFile legge il file e lo spedisce come risposta HTTP
  res.sendFile(filePath);
};
export const uploadaScheda = (req, res) => {
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);
  // Controllo file
  if (!req.file) {
    return res.status(400).json({ error: "Nessun file caricato" });
  }

  const filename = req.file.filename;
  const id = req.params.id;

  // Aggiorna il DB
  connection.query(
    "UPDATE info_iscritti SET scheda = ? WHERE id_iscritto = ?",
    [filename, id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Errore salvataggio DB" });
      }

      res.json({
        message: "File caricato e salvato in DB!",
        filename,
      });
    }
  );
};

// Funzione per inviare email di reset password
export const requestReset = async (req, res) => {
  try {
    // Imposta la chiave API di SendGrid
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    console.log(process.env.SENDGRID_API_KEY);

    const { email } = req.body;

    // Genera un token univoco per il reset della password
    const token = crypto.randomBytes(20).toString("hex");

    // Imposta la scadenza del token (es. 1 ora)
    const scadenzaToken = Date.now() + 3600000;

    // Query SQL per salvare token e scadenza nel database
    const sql = `
      UPDATE iscritti
      SET reset_token = ?, scadenza_token = ?
      WHERE email = ?;
    `;

    // Esegui la query
    connection.query(sql, [token, scadenzaToken, email], (err, results) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Errore durante il salvataggio del token" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Utente non trovato" });
      }

      // Prepara il link per il reset
      const resetLink = `http://localhost:5173/reset-password/${token}`;

      // Prepara l'email
      const msg = {
        to: email,
        from: "davide.alcatel@gmail.com",
        subject: "Reset Password",
        text: `Clicca sul link per reimpostare la tua password: ${resetLink}`,
        html: `<p>Clicca sul link per reimpostare la tua password:</p>
               <a href="${resetLink}">${resetLink}</a>`,
      };

      // Invia l'email
      sendgrid
        .send(msg)
        .then(() => res.json({ message: "Email di reset inviata" }))
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: "Errore durante l'invio della email" });
        });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore server" });
  }
};
// Funzione per aggiornare la password
//asyc  per indicare che la funzione sia asincrona
//await per indicare che la funzione asincrona deve attendere il risultato
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Recupera dal DB l’utente corrispondente al token e verifica scadenza
    const sqlFind = `
      SELECT email, scadenza_token
      FROM iscritti
      WHERE reset_token = ?;
    `;
    connection.query(sqlFind, [token], async (err, results) => {
      if (err) return res.status(500).json({ error: "Errore server" });
      if (results.length === 0)
        return res.status(400).json({ error: "Token non valido" });

      const user = results[0];
      if (user.scadenza_token < Date.now())
        return res.status(400).json({ error: "Token scaduto" });

      // 2. Hash della nuova password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 3. Aggiorna la password, resetta token e scadenza
      const sqlUpdate = `
        UPDATE iscritti
        SET password = ?, reset_token = NULL, scadenza_token = NULL
        WHERE email = ?;
      `;
      connection.query(
        sqlUpdate,
        [hashedPassword, user.email],
        (err, results) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Errore durante l'aggiornamento password" });

          if (results.affectedRows === 0)
            return res.status(404).json({ error: "Utente non trovato" });

          // 4. Risposta positiva
          res.json({ message: "Password aggiornata con successo" });
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore generico server" });
  }
};

export const deleteUser = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM iscritti WHERE id = ?"; //
  //cancelli in automatico i record figli quando elimini il genitore
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Errore server" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    return res.json({ message: "Utente eliminato con successo" });
  });
};
