"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMidtransClientKey = exports.checkPaymentStatus = exports.createQRISPayment = exports.createVAPayment = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';
const MIDTRANS_IS_PRODUCTION = process.env.NODE_ENV === 'production';
// Create Core API instance
const coreApi = new midtrans_client_1.default.CoreApi({
    isProduction: MIDTRANS_IS_PRODUCTION,
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY
});
// Create Snap API instance (for redirect payments)
const snapApi = new midtrans_client_1.default.Snap({
    isProduction: MIDTRANS_IS_PRODUCTION,
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY
});
const createVAPayment = async (orderId, amount, items, customer, bank) => {
    try {
        const parameter = {
            payment_type: "bank_transfer",
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            item_details: items,
            customer_details: customer,
            bank_transfer: {
                bank: bank || "bca" // Default to BCA if not specified
            }
        };
        const response = await coreApi.charge(parameter);
        return response;
    }
    catch (error) {
        console.error('Error creating VA payment:', error);
        throw error;
    }
};
exports.createVAPayment = createVAPayment;
const createQRISPayment = async (orderId, amount, items, customer) => {
    try {
        const parameter = {
            payment_type: "qris",
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            item_details: items,
            customer_details: customer
        };
        const response = await coreApi.charge(parameter);
        return response;
    }
    catch (error) {
        console.error('Error creating QRIS payment:', error);
        throw error;
    }
};
exports.createQRISPayment = createQRISPayment;
const checkPaymentStatus = async (orderId) => {
    try {
        const response = await coreApi.transaction.status(orderId);
        return response;
    }
    catch (error) {
        console.error('Error checking payment status:', error);
        throw error;
    }
};
exports.checkPaymentStatus = checkPaymentStatus;
const getMidtransClientKey = () => {
    return MIDTRANS_CLIENT_KEY;
};
exports.getMidtransClientKey = getMidtransClientKey;
//# sourceMappingURL=midtrans.js.map