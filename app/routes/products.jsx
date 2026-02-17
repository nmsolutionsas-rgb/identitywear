import ProductsList from '@/components/ProductsList';

export const meta = () => {
    return [
        { title: 'Shop All - identitywear' },
        { name: 'description', content: 'Browse our complete collection of premium hoodies and streetwear.' },
    ];
};

export default function ProductsRoute() {
    return <ProductsList />;
}
