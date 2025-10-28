// app/signup/page.js
import Onboarding from '../../components/Onboarding'; // Import the component

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <Onboarding />
    </main>
  );
}