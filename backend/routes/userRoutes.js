// routes/userRoutes.js
import { Router } from 'express';
const router = Router();
import { registerUser, validateRegistration, canRegister, validateBatchRegistration, getStudentByIdentifier, findDuplicates } from "../controllers/userController.js";

// Main registration endpoint
router.post('/register', registerUser);

// Pre-registration validation endpoints
router.post('/validate', validateRegistration);
router.post('/can-register', canRegister);
router.post('/validate-batch', validateBatchRegistration);

// Student lookup
router.get('/student', getStudentByIdentifier);

// Admin endpoints
router.get('/duplicates', findDuplicates);

export default router;