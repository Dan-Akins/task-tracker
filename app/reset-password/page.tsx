import Link from "next/link";
import AuthFormError from "@/app/components/auth/AuthFormError";
import ResetPasswordForm from "@/app/components/auth/ResetPasswordForm";

type SearchParams = Promise<{ token?: string }>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8 dark:text-gray-50">
          Choose a new password
        </h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-700">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <>
              <AuthFormError message="This reset link is missing its token." />
              <Link
                href="/forgot-password"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Request a new link
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
