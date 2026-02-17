import ProductCarousel from '@/components/ProductCarousel';
import StorytellingSection from '@/components/StorytellingSection';
import LifestyleCarousel from '@/components/LifestyleCarousel';
import LimitedTimeDeal from '@/components/LimitedTimeDeal';
import ShopCombos from '@/components/ShopCombos';
import BrandValues from '@/components/BrandValues';
import CustomerReviews from '@/components/CustomerReviews';

export const meta = () => {
    return [
        { title: 'identitywear - Premium Hoodies & Streetwear' },
        { name: 'description', content: 'Discover identitywear - where performance meets identity. Shop premium hoodies and streetwear designed for comfort, quality, and style.' },
    ];
};

export default function Index() {
    return (
        <>
            <ProductCarousel />
            <StorytellingSection />
            <LifestyleCarousel />
            <LimitedTimeDeal />
            <ShopCombos />
            <BrandValues />
            <CustomerReviews />
        </>
    );
}
