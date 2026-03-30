import express from "express";
import * as controller from "../controllers/addressController.js";

const router = express.Router();
 // create

router.post("/", controller.createAddress);  
// update

router.put("/:id", controller.updateAddress); 
//  delete
router.delete("/:id", controller.deleteAddress);
          
router.get("/", controller.getAllAddresses);              // get all

router.get("/:username", controller.getAddressesByUsername); // get by username

export default router;
