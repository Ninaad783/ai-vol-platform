import { SignUp } from "@clerk/clerk-react";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <SignUp />
    </div>
  );
}

export default Register;