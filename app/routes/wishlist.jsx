import ProtectedRoute from '@/components/ProtectedRoute';
import WishlistPage from '@/pages/WishlistPage';

export const meta = () => {
    return [
        { title: 'My Wishlist - identitywear' },
    ];
};

export default function WishlistRoute() {
    return (
        <ProtectedRoute>
            <WishlistPage />
        </ProtectedRoute>
    );
}
