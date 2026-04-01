import express from 'express';
import { sendSupportEmail } from '../controller/supportController.js';

const supportRouter = express.Router();

supportRouter.post('/contact', sendSupportEmail);

export default supportRouter;