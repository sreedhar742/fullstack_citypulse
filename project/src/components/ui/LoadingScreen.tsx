import { Loader } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <Loader className="w-12 h-12 mx-auto text-teal-600 dark:text-teal-500 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
