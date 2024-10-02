import express from 'express';
import orderController from './order.controller';
import { jwtStrategy , jwtCustomerStrategy} from '../../../middleware/strategy';


import { sanitize } from '../../../middleware/sanitizer';
// import { validateBody, schemas } from '../../../middleware/validator';

export const orderRouter = express.Router();
orderRouter.route('/create').post(sanitize(), jwtCustomerStrategy, orderController.index);
orderRouter.route('/list').post(sanitize(), jwtStrategy, orderController.getAllOrderList);
orderRouter.route('/status/update').post(sanitize(), jwtStrategy, orderController.statusUpdate);
orderRouter.route('/list-by-customer').post(sanitize(),jwtCustomerStrategy, orderController.getAllOrderListById);
orderRouter.route('/status').post(sanitize(),jwtStrategy, orderController.getAllOrderStatus);
orderRouter.route('/count').get(sanitize(), orderController.getAllOrderCount);
orderRouter.route('/notifications').get(sanitize(), jwtStrategy, orderController.getOrderNotifications);
orderRouter.route('/details-by-id').post(sanitize(), jwtCustomerStrategy, orderController.getOrderDetailsById);
orderRouter.route('/delete-by-product').post(sanitize(), jwtCustomerStrategy, orderController.getOrderDeleteByProduct);

orderRouter.route('/delete-list').post(sanitize(), jwtStrategy, orderController.deleteOrderList);
orderRouter.route('/status-issue').post(sanitize(), jwtCustomerStrategy, orderController.orderStatusIssue);
orderRouter.route('/cancel-by-product').post(sanitize(), jwtCustomerStrategy, orderController.getOrderCancel);



















