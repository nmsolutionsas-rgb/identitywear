import CheckoutSuccessPage from '@/pages/CheckoutSuccessPage';

export const meta = () => {
    return [
        { title: 'Order Confirmed - identitywear' },
    ];
};

export default function CheckoutSuccessRoute() {
    return <CheckoutSuccessPage />;
}
