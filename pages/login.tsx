import { FormEvent } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      router.push("/dashboard");
    } else {
      // Handle errors
      toast((await response.json())?.error);
    }
  }

  return (
    <div className="bg-blue-300 w-screen h-screen flex flex-row items-center justify-center">
      <div className="w-80 bg-white p-4 rounded-md shadow">
        <h1 className="text-bold text-lg">Certbot Viewer</h1>
        <div className="text-slate-300">Login</div>
        <form onSubmit={handleSubmit} className="flex flex-col mt-4 gap-y-2">
          <input
            name="username"
            placeholder="Username"
            required
            className="border p-2 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="border p-2 rounded"
          />
          <div className="text-right">
            <button
              type="submit"
              className="bg-green-300 text-white py-1 px-2 rounded"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
