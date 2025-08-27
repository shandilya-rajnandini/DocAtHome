import React, { useState } from 'react';
import DropzoneComponent from '../components/DropzoneComponent';
import { IconFileText, IconUpload, IconShield, IconHistory } from '@tabler/icons-react';

const MyHealthRecordsPage = () => {
  const [uploadHistory] = useState([
    // Mock data - replace with actual data from backend
    {
      id: 1,
      name: 'Blood_Test_Report.pdf',
      type: 'application/pdf',
      size: '2.4 MB',
      uploadedAt: '2024-01-15',
      status: 'uploaded'
    },
    {
      id: 2,
      name: 'Prescription_Image.jpg',
      type: 'image/jpeg',
      size: '1.8 MB',
      uploadedAt: '2024-01-10',
      status: 'uploaded'
    },
    {
      id: 3,
      name: 'Lab_Results.txt',
      type: 'text/plain',
      size: '45 KB',
      uploadedAt: '2024-01-08',
      status: 'uploaded'
    }
  ]);





  const getFileTypeIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.startsWith('text/')) return '📝';
    return '📁';
  };

  const getFileTypeColor = (fileType) => {
    if (fileType.startsWith('image/')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (fileType === 'application/pdf') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (fileType.startsWith('text/')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
  <div className="bg-[#857e7b] dark:bg-primary-dark min-h-full pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
            My Health Records
          </h1>
          <p className="text-lg text-gray-800 dark:text-secondary-text">
            Securely store and manage your medical documents, lab reports, and prescriptions.
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <IconShield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Your Health Records Are Secure
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                All files are encrypted and stored securely. Only you and authorized healthcare providers can access your records.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-6">
                <IconUpload className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upload New Records
                </h2>
              </div>
              
              <DropzoneComponent 
                maxFiles={20}
                acceptedFileTypes={[
                  'image/*', 
                  'application/pdf', 
                  'text/plain',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ]}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Records Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Records</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {uploadHistory.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">This Month</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {uploadHistory.filter(record => {
                      const recordDate = new Date(record.uploadedAt);
                      const currentDate = new Date();
                      return recordDate.getMonth() === currentDate.getMonth() && 
                             recordDate.getFullYear() === currentDate.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">File Types</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Set(uploadHistory.map(record => record.type.split('/')[0])).size}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {uploadHistory.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileTypeIcon(record.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {record.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {record.uploadedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upload History */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <IconHistory className="w-6 h-6 text-gray-600 dark:text-gray-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upload History
                </h2>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {uploadHistory.length} records
              </div>
            </div>

            {uploadHistory.length === 0 ? (
              <div className="text-center py-12">
                <IconFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No health records uploaded yet. Start by uploading your first document above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        File
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Size
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Uploaded
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadHistory.map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getFileTypeIcon(record.type)}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {record.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(record.type)}`}>
                            {record.type.split('/')[1] || record.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {record.size}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {record.uploadedAt}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyHealthRecordsPage;
