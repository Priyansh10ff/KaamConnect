// app/client-login/page.js
import ClientLogin from '../../components/ClientLogin';

export default function ClientLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <ClientLogin />
    </main>
  );
}