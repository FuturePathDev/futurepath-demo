import React from "react";

function SignInPage() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <form className="mt-6">
        <input
          type="email"
          placeholder="Email"
          className="block w-full max-w-sm mx-auto mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="block w-full max-w-sm mx-auto mb-4 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          Sign In
        </button>
      </form>
    </div>
  );
}

export default SignInPage;
