// app/client-signup/page.js
import ClientSignup from '../../components/ClientSignup'; // Import the new component

export default function ClientSignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <ClientSignup />
    </main>
  );
}