export declare const sendRegistrationEmail: (email: string, name: string) => Promise<void>;
export declare const sendOtpEmail: (email: string, otp: string) => Promise<void>;
export declare const sendBookingConfirmationEmail: (email: string, name: string, bookingDetails: {
    cameraName: string;
    bookingDate: string;
    duration: string;
    totalPrice: string;
    paymentCode?: string;
    paymentMethod: string;
}) => Promise<void>;
export declare const sendPaymentSuccessEmail: (email: string, name: string, bookingDetails: {
    cameraName: string;
    bookingDate: string;
    totalPrice: string;
    paymentMethod: string;
}) => Promise<void>;
export declare const sendReturnConfirmationEmail: (email: string, name: string, returnDetails: {
    cameraName: string;
    startDate: string;
    endDate: string;
    returnDate: string;
}) => Promise<void>;
