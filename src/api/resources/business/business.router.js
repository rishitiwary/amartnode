import express from 'express';
import businessController from './business.controller';
import { sanitize } from '../../../middleware/sanitizer';
import {  jwtStrategy, } from '../../../middleware/strategy';

export const businessRouter = express.Router();
businessRouter.route('/getAllProductProfit').get(sanitize(),jwtStrategy, businessController.getAllBill);
