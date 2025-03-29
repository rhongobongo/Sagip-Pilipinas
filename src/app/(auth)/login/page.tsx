import LoginForm from '@/components/(page)/AuthPage/LoginForm'; // Ensure correct path

// This page component itself doesn't need 'use client'
const LoginPage: React.FC = () => {
    return (
        <LoginForm /> // Render the client component
    );
};

export default LoginPage;