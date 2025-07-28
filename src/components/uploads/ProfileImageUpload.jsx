import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { getProfileImageUrl } from '../../utils/profileImage';

const ProfileImageUpload = ({ initialUrl, folder = 'avatars', onChange }) => {
  const [preview, setPreview] = useState(initialUrl || '');

  const handleComplete = (file) => {
    setPreview(file.url);
    onChange && onChange(file);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <img
        src={getProfileImageUrl({ profileImageUrl: preview })}
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover"
      />
      <FileUpload accept="image/*" folder={folder} onComplete={handleComplete} />
    </div>
  );
};

export default ProfileImageUpload;
