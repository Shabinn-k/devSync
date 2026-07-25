import { AuthLayout } from '../../../layouts/AuthLayout';
import { RegisterHero } from '../components/RegisterHero';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  return (
    <AuthLayout
      leftContent={<RegisterHero />}
      rightContent={<RegisterForm />}
    />
  );
};

export default RegisterPage;