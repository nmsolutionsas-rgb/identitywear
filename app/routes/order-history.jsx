import ProtectedRoute from '@/components/ProtectedRoute';
import OrderHistoryPage from '@/pages/OrderHistoryPage';

export const meta = () => {
    return [
        { title: 'Order History - identitywear' },
    ];
};

export default function OrderHistoryRoute() {
    return (
        <ProtectedRoute>
            <OrderHistoryPage />
        </ProtectedRoute>
    );
}
