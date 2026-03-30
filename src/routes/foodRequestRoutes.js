import express from "express";
import { createRequest,
         updateRequest,
        deleteRequest,
        getAllRequests,
        getRequestsByUsername
 } from "../controllers/foodRequestController.js";

const router = express.Router();

//to create requests
router.post("/create", createRequest);

//to update requesitngs
router.put("/update/:id",updateRequest);

//to delete requestings
router.delete("/delete/:id",deleteRequest);

//to display all the requestings
router.get("/all",getAllRequests);


//display requests based on username
router.get("/user/:username", getRequestsByUsername);



export default router;
