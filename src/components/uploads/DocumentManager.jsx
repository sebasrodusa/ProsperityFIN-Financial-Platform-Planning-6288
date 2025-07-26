import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import FileUpload from './FileUpload';
import { deleteFile } from '../../services/publitio';

const { FiTrash2, FiFileText } = FiIcons;

const DocumentManager = ({ initialFiles = [], folder = 'documents', onChange }) => {
  const [files, setFiles] = useState(initialFiles);
  const [error, setError] = useState('');

  const handleUpload = (file) => {
    const updated = [...files, file];
    setFiles(updated);
    onChange && onChange(updated);
  };

  const handleDelete = async (file) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await deleteFile(file.public_id);
      const updated = files.filter(f => f.public_id !== file.public_id);
      setFiles(updated);
      onChange && onChange(updated);
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload folder={folder} onComplete={handleUpload} />
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <ul className="space-y-2">
        {files.map(file => (
          <li key={file.public_id} className="flex items-center justify-between">
            <a href={file.url} target="_blank" rel="noopener" className="flex items-center space-x-2 text-primary-600 hover:underline">
              <SafeIcon icon={FiFileText} className="w-4 h-4" />
              <span>{file.url.split('/').pop()}</span>
            </a>
            <button
              type="button"
              onClick={() => handleDelete(file)}
              className="p-1 rounded hover:bg-gray-100 text-danger-600"
            >
              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentManager;
