import OrderConfirmation from '@/pages/OrderConfirmation';

export const meta = () => {
    return [
        { title: 'Order Confirmed - identitywear' },
    ];
};

export default function OrderConfirmationRoute() {
    return <OrderConfirmation />;
}
