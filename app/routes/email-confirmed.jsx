import EmailConfirmationPage from '@/pages/EmailConfirmationPage';

export const meta = () => {
    return [
        { title: 'Email Confirmed - identitywear' },
    ];
};

export default function EmailConfirmedRoute() {
    return <EmailConfirmationPage />;
}
