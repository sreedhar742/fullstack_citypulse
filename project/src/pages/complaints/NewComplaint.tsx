import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image, MapPin, Upload } from "lucide-react";
import { toast } from "sonner";
import complaintsService from "../../api/complaintsService";
import { ComplaintCategory, NewComplaintData } from "../../types/complaints";

function NewComplaint() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewComplaintData>();
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === files.length) {
            setPreviewImages(newPreviews);
          }
        }
      };
      reader.readAsDataURL(files[i]);
    }
  };

  const onSubmit = async (data: NewComplaintData) => {
    try {
      setLoading(true);

      // Get files from the input
      const fileInput = document.getElementById("images") as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        data.images = Array.from(fileInput.files);
      }

      await complaintsService.createComplaint(data);
      toast.success("Complaint submitted successfully!");
      navigate("/complaints");
    } catch (error) {
      console.error("Failed to submit complaint:", error);
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Submit New Complaint
        </h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                className={`input w-full ${errors.title ? "border-red-500 dark:border-red-500" : ""}`}
                placeholder="Brief title of your complaint"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                className={`input w-full ${errors.category ? "border-red-500 dark:border-red-500" : ""}`}
                {...register("category", { required: "Category is required" })}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value={ComplaintCategory.ROAD}>Road</option>
                <option value={ComplaintCategory.WATER}>Water</option>
                <option value={ComplaintCategory.ELECTRICITY}>
                  Electricity
                </option>
                <option value={ComplaintCategory.SANITATION}>Sanitation</option>
                <option value={ComplaintCategory.PUBLIC_PROPERTY}>
                  Public Property
                </option>
                <option value={ComplaintCategory.OTHERS}>Others</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="location"
                  type="text"
                  className={`input pl-10 w-full ${errors.location ? "border-red-500 dark:border-red-500" : ""}`}
                  placeholder="Address or location description"
                  {...register("location", {
                    required: "Location is required",
                  })}
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={6}
                className={`input w-full ${errors.description ? "border-red-500 dark:border-red-500" : ""}`}
                placeholder="Detailed description of the issue"
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 20,
                    message: "Description should be at least 20 characters",
                  },
                })}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="images"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Images (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer rounded-md font-medium text-teal-600 dark:text-teal-500 hover:text-teal-500 dark:hover:text-teal-400 focus-within:outline-none"
                    >
                      <div className="flex flex-col items-center">
                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2">Upload images</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </div>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewImages.map((src, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-md overflow-hidden"
                    >
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Complaint
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewComplaint;
