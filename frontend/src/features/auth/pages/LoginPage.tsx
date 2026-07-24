import { AuthLayout } from '../../../layouts/AuthLayout';
import { LeftHero } from '../components/LeftHero';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <AuthLayout
      leftContent={<LeftHero />}
      rightContent={<LoginForm />}
    />
  );
};

export default LoginPage;