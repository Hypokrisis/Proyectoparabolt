import UserRegistrationForm from './components/UserRegistrationForm';
import LoginForm from './components/LoginForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 space-y-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Panel de Administrador</h1>
        <LoginForm />
      </div>

      <div className="max-w-xl mx-auto">
        <UserRegistrationForm />
      </div>
    </div>
  );
}

export default App;
