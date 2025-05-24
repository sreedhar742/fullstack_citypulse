import { Link } from "react-router-dom";
import { Home } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-teal-600 dark:text-teal-500">
          404
        </h1>
        <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link to="/" className="btn btn-primary inline-flex items-center">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
