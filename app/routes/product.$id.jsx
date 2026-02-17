import ProductDetailPage from '@/pages/ProductDetailPage';

export const meta = () => {
    return [
        { title: 'Product Details - identitywear' },
    ];
};

export default function ProductRoute() {
    return <ProductDetailPage />;
}
