# SitoPalestra - Backend

## Descrizione

Backend per la gestione di una palestra, sviluppato con Node.js, Express e MySQL.  
Permette la gestione di utenti, amministratori, autenticazione, registrazione, gestione delle schede di allenamento e reset password.

---

## Librerie utilizzate

- **express**: framework per la creazione di API REST.
- **mysql2**: connessione e gestione del database MySQL.
- **dotenv**: gestione delle variabili d’ambiente.
- **bcrypt**: hashing sicuro delle password.
- **jsonwebtoken**: generazione e verifica dei token JWT.
- **cors**: gestione delle richieste cross-origin.
- **multer**: gestione dell’upload dei file.
- **@sendgrid/mail**: invio email per il reset password.
- **crypto-js**: funzioni di crittografia aggiuntive.
- **buffer**: gestione dei buffer per i file.

---

## Avvio del progetto

1. Clona la repository.
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Crea un file `.env` con le variabili per la connessione al database:
   ```
   DB_HOST=...
   DB_USER=...
   DB_PW=...
   DB_NAME=...
   DB_PORT=3306
   JWT_SECRET=...
   ```
4. Avvia il server:
   ```bash
   npm start
   ```

---

## Autenticazione e Token

- **Login:**  
  Quando un utente o admin effettua il login, il backend verifica la password (hashata con bcrypt) e genera un token JWT.  
  Il token contiene informazioni sull’utente e scade dopo 1 ora.  
  Va inviato dal frontend nell’header `Authorization` per accedere alle rotte protette.

- **Registrazione:**  
  La password viene sempre hashata con bcrypt prima di essere salvata nel database, così non è mai visibile in chiaro.

- **Reset password:**  
  L’utente può richiedere il reset della password. Riceve un token via email, che usa per impostare una nuova password (anch’essa hashata).

---

## Gestione password

- **Hashing:**  
  Le password non vengono mai salvate in chiaro.  
  Viene usato bcrypt per creare un hash sicuro.

- **Verifica:**  
  Al login, bcrypt confronta la password inserita con l’hash salvato nel database.

---

## Gestione delle schede di allenamento

- **Salvataggio scheda:**  
  Puoi caricare una scheda di allenamento (ad esempio un PDF) tramite la rotta:

  ```
  POST /gym/updatedaScheda/:id
  ```

  Usa form-data in Postman e inserisci il file nel campo `file`.  
  Il file viene salvato sul server e associato all’utente tramite l’ID.

- **Recupero scheda:**  
  Puoi ottenere la scheda di un utente tramite:
  ```
  GET /gym/schede/:id_iscritto
  ```
  (Questa rotta è protetta da autenticazione JWT.)

---

## Middleware utilizzati

- **verifyToken:**  
  Verifica che la richiesta abbia un token JWT valido.  
  Serve per proteggere le rotte che richiedono autenticazione.

- **verifyAdmin:**  
  Controlla che l’utente autenticato sia un amministratore.  
  Serve per proteggere le rotte riservate agli admin.

- **verifyUser:**  
  Controlla che l’utente autenticato sia autorizzato a vedere/modificare i propri dati.

- **uploadSchedaBuffer:**  
  Gestisce l’upload dei file (schede di allenamento) tramite multer.

---

## Rotte principali

### Autenticazione & Utenti

- **POST** `/gym/login`  
  Login utente

  ```json
  { "email": "utente@example.com", "password": "passwordUtente" }
  ```

- **POST** `/gym/login/admin`  
  Login amministratore

  ```json
  { "email": "admin@example.com", "password": "passwordAdmin" }
  ```

- **POST** `/gym/register`  
  Registrazione nuovo utente

  ```json
  {
    "email": "nuovo@example.com",
    "password": "passwordNuovo",
    "nome": "Mario",
    "cognome": "Rossi"
  }
  ```

- **GET** `/gym/user/:email`  
  Visualizza dati utente (protetta, JWT)

- **GET** `/gym/profile`  
  Visualizza profilo utente (protetta, JWT)

- **DELETE** `/gym/deleteUser/:id`  
  Elimina utente

### Gestione amministratore

- **GET** `/gym/admin_showProfileUser/:id`  
  Visualizza profilo utente come admin

- **GET** `/gym/`  
  Visualizza tutti gli iscritti (protetta, JWT admin)

### Gestione dati e schede

- **POST** `/gym/insert/:id`  
  Inserisci dati utente

  ```json
  { "campo1": "valore1", "campo2": "valore2" }
  ```

- **PUT** `/gym/updateMisure/:id`  
  Aggiorna misure utente

  ```json
  { "peso": 70, "altezza": 180 }
  ```

- **GET** `/gym/schede/:id_iscritto`  
  Ottieni schede utente (protetta, JWT)

- **POST/PUT** `/gym/updatedaScheda/:id`  
  Upload scheda (form-data, campo `file`)

### Password e sicurezza

- **POST** `/gym/request-reset`  
  Richiesta reset password

  ```json
  { "email": "utente@example.com" }
  ```

- **POST** `/gym/reset-password`  
  Reset password
  ```json
  { "token": "tokenRicevutoViaEmail", "newPassword": "nuovaPassword" }
  ```

### Test e debug

- **GET** `/gym/test-server`  
  Verifica che il backend sia attivo

- **GET** `/test-db`  
  Verifica connessione al database

---
