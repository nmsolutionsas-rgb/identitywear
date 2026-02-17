import ProductCarousel from '~/components/ProductCarousel';
import StorytellingSection from '~/components/StorytellingSection';
import LifestyleCarousel from '~/components/LifestyleCarousel';
import LimitedTimeDeal from '~/components/LimitedTimeDeal';
import ShopCombos from '~/components/ShopCombos';
import BrandValues from '~/components/BrandValues';
import CustomerReviews from '~/components/CustomerReviews';
import EnergyHero from '~/components/EnergyHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
    return [{ title: 'Identitywear | Premium Hoodies & Streetwear' }];
};

export default function Index() {
    return (
        <>
            <EnergyHero />
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
