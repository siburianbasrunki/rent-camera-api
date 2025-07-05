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
export declare const createVAPayment: (orderId: string, amount: number, items: PaymentItem[], customer: CustomerDetails, bank?: string) => Promise<any>;
export declare const createQRISPayment: (orderId: string, amount: number, items: PaymentItem[], customer: CustomerDetails) => Promise<any>;
export declare const checkPaymentStatus: (orderId: string) => Promise<any>;
export declare const getMidtransClientKey: () => string;
export {};
