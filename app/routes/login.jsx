import LoginPage from '@/pages/LoginPage';

export const meta = () => {
    return [
        { title: 'Login - identitywear' },
        { name: 'description', content: 'Sign in to your identitywear account.' },
    ];
};

export default function LoginRoute() {
    return <LoginPage />;
}
