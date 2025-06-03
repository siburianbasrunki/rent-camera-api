import midtransClient from 'midtrans-client';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';
const MIDTRANS_IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Create Core API instance
const coreApi = new midtransClient.CoreApi({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY
});

// Create Snap API instance (for redirect payments)
const snapApi = new midtransClient.Snap({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY
});

interface PaymentItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

interface CustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
}

export const createVAPayment = async (
  orderId: string,
  amount: number,
  items: PaymentItem[],
  customer: CustomerDetails,
  bank?: string
) => {
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
  } catch (error) {
    console.error('Error creating VA payment:', error);
    throw error;
  }
};

export const createQRISPayment = async (
  orderId: string,
  amount: number,
  items: PaymentItem[],
  customer: CustomerDetails
) => {
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
  } catch (error) {
    console.error('Error creating QRIS payment:', error);
    throw error;
  }
};

export const checkPaymentStatus = async (orderId: string) => {
  try {
    const response = await coreApi.transaction.status(orderId);
    return response;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

export const getMidtransClientKey = () => {
  return MIDTRANS_CLIENT_KEY;
};