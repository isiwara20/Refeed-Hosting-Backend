//Sewni

import express from 'express';
import {
  getAdminProfile,
  updateAdminProfile
} from '../controllers/adminProfileController.js';

const router = express.Router();

router.get('/:username', getAdminProfile);
router.put('/:username', updateAdminProfile);

export default router;
