import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";

function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="card max-w-lg mx-auto p-8">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>
          <div className="flex space-x-4">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </button>
            <Link to="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
