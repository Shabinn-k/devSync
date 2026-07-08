import { Logo } from './Logo';

export const ForgotPasswordHero = () => {
  return (
    <div className="flex h-full w-full flex-col justify-between px-4 py-4 lg:px-6 lg:py-6">
      <Logo />

      <div className="flex flex-1 flex-col justify-center -mt-2">
        <h1 className="text-[40px] font-extrabold uppercase leading-[0.85] tracking-tight text-white sm:text-[56px] lg:text-[72px] xl:text-[100px] 2xl:text-[110px] text-center lg:text-right">
          Reset.
          <br />
          Recover.
          <br />
          Restore.
        </h1>
        <p className="mt-1 text-[10px] text-white/50 sm:text-xs lg:text-sm text-center lg:text-right">
          Secure your account access.
        </p>
      </div>

      <div>
        <div className="mb-3 h-px w-full bg-white/10" />
      </div>
    </div>
  );
};