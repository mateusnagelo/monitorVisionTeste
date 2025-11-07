import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Linkedin, Mail, Lock, Facebook } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input type="email" id="email" placeholder="seu@email.com" className="pl-10" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input type="password" id="password" placeholder="Sua senha" className="pl-10" />
            </div>
          </div>
          <Button className="w-full mb-4">Entrar</Button>
        </form>
        <div className="text-center text-gray-500 my-4">ou entre com</div>
        <div className="flex justify-center space-x-4">
          <Button variant="outline" size="icon">
            <Github size={20} />
          </Button>
          <Button variant="outline" size="icon">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.08 18.1,6.88L20.27,4.71C18.45,2.91 15.71,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.2 6.42,22 12.19,22C17.6,22 21.54,18.33 21.54,12.25C21.54,11.85 21.48,11.47 21.35,11.1Z"
              />
            </svg>
          </Button>
          <Button variant="outline" size="icon">
            <Facebook size={20} />
          </Button>
          <Button variant="outline" size="icon">
            <Linkedin size={20} />
          </Button>
          <Button variant="outline" size="icon">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21,5H3A2,2 0 0,0 1,7V17A2,2 0 0,0 3,19H21A2,2 0 0,0 23,17V7A2,2 0 0,0 21,5M19.5,7L12,11.5L4.5,7H19.5M3,17V7.31L12,12.5L21,7.31V17H3Z"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;