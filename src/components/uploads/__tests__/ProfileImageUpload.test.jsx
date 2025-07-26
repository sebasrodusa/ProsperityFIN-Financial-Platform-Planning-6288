import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('../FileUpload', () => ({
  default: ({ onComplete }) => (
    <button onClick={() => onComplete({ url: 'new.jpg', public_id: 'id1' })}>Upload</button>
  )
}));

import ProfileImageUpload from '../ProfileImageUpload';

describe('ProfileImageUpload', () => {
  it('updates preview after upload', () => {
    render(<ProfileImageUpload initialUrl="start.jpg" />);
    const img = screen.getByAltText('Profile');
    expect(img.src).toContain('start.jpg');

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    expect(img.src).toContain('new.jpg');
  });
});
