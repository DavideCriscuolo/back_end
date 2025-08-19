import express from "express";
import * as gymController from "./../controller/controller.js";
import verifyToken from "./../middleware/verifyToken.js";
import verifyAdmin from "./../middleware/verifyAdmin.js";
import verifyUser from "./../middleware/verifyUser.js";
import { uploadSchedaBuffer } from "../middleware/configMulter.js";

const router = express.Router();
router.get("/test-server", (req, res) => {
  res.send("Backend attivo 🚀");
});

router.get("/user/:email", verifyToken, verifyUser, gymController.showEmail);
router.get("/admin_showProfileUser/:id", gymController.showProfileUser);
router.get("/:id", gymController.show);

router.get("/", verifyToken, verifyAdmin, gymController.index);
router.put("/updateMisure/:id", gymController.update);
router.post("/insert/:id", gymController.store);
router.post("/login", gymController.login);
router.post("/login/admin", gymController.loginAdmin);
router.get("/profile", verifyToken, gymController.profile);
router.post("/register", gymController.register);
router.get("/schede/:id_iscritto", gymController.scheda);
router.post("/reset-password", gymController.resetPassword);
router.post("/request-reset", gymController.requestReset);
router.delete("/deleteUser/:id", gymController.deleteUser);
router.put(
  "/updatedaScheda/:id",
  uploadSchedaBuffer,
  gymController.uploadaSchedaDB
);

export default router;
