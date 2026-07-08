import { AuthLayout } from '../../../layouts/AuthLayout';
import { ForgotPasswordHero } from '../components/ForgotPasswordHero';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export const ForgotPasswordPage = () => {
  return (
    <AuthLayout
      leftContent={<ForgotPasswordForm />}
      rightContent={<ForgotPasswordHero />}
    />
  );
};

export default ForgotPasswordPage;