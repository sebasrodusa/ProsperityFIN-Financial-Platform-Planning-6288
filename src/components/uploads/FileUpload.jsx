import React, { useRef, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { uploadFile } from '../../services/publitio';
import LoadingSpinner from '../ui/LoadingSpinner';

const { FiUpload } = FiIcons;

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const FileUpload = ({ accept = '*/*', folder = '', onComplete }) => {
  const inputRef = useRef();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setProgress(0);

    if (file.size > MAX_SIZE) {
      setError('File is too large');
      return;
    }
    if (accept !== '*/*' && !file.type.match(accept.replace('*', '.*'))) {
      setError('Invalid file type');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadFile(file, folder);
      setProgress(100);
      onComplete && onComplete(result);
      inputRef.current.value = '';
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="btn-secondary inline-flex items-center space-x-2 cursor-pointer">
        <SafeIcon icon={FiUpload} className="w-4 h-4" />
        <span>Upload</span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </label>
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {uploading && progress < 100 && (
        <p className="text-xs text-gray-500">Uploading...</p>
      )}
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
