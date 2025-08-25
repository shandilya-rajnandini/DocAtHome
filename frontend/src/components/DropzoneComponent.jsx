import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IconUpload, IconX, IconFile, IconCheck } from "@tabler/icons-react";

const DropzoneComponent = ({
  onFilesSelected,
  maxFiles = 10,
  acceptedFileTypes = ["image/*", "application/pdf", "text/plain"],
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      if (onFilesSelected) {
        onFilesSelected([...files, ...newFiles]);
      }
    },
    [files, onFilesSelected],
  );

  const removeFile = (fileId) => {
    setFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId);
      if (onFilesSelected) {
        onFilesSelected(updatedFiles);
      }
      return updatedFiles;
    });
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Simulate upload - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would typically send files to your backend
      console.log("Uploading files:", files);

      // Clear files after successful upload
      setFiles([]);
      if (onFilesSelected) {
        onFilesSelected([]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: acceptedFileTypes.reduce((acc, type) => {
        acc[type] = [];
        return acc;
      }, {}),
      maxFiles,
      multiple: true,
    });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType === "application/pdf") return "📄";
    if (fileType.startsWith("text/")) return "📝";
    return "📁";
  };

  return (
    <div className="w-full">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${
            isDragActive && !isDragReject
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : isDragReject
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
          }
          hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20
        `}
      >
        <input {...getInputProps()} />
        <IconUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

        {isDragActive ? (
          <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
            {isDragReject ? "Invalid file type!" : "Drop the files here..."}
          </p>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports: Images, PDFs, Text files (Max: {maxFiles} files)
            </p>
          </div>
        )}
      </div>

      {/* File Preview Section */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={uploadAllFiles}
              disabled={uploading}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              `}
            >
              {uploading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center">
                  <IconCheck className="w-4 h-4 mr-2" />
                  Upload All
                </span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
              >
                {/* File Preview */}
                {file.preview ? (
                  <div className="relative mb-3">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <IconX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative mb-3">
                    <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">{getFileIcon(file.type)}</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <IconX className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* File Info */}
                <div className="space-y-1">
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-white truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                    {file.type.split("/")[1] || file.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropzoneComponent;
