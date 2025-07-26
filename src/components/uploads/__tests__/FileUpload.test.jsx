import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('../../../services/publitio', () => ({
  uploadFile: vi.fn()
}));

import { uploadFile } from '../../../services/publitio';
import FileUpload from '../FileUpload';

function createFile(name = 'test.txt', size = 100, type = 'text/plain') {
  const file = new File(['a'.repeat(size)], name, { type });
  return file;
}

describe('FileUpload', () => {
  beforeEach(() => {
    uploadFile.mockReset();
  });

  it('shows progress while uploading and calls onComplete', async () => {
    let resolve;
    uploadFile.mockReturnValue(new Promise(r => { resolve = r; }));
    const handleComplete = vi.fn();
    render(<FileUpload onComplete={handleComplete} />);

    const input = screen.getByText('Upload').parentElement.querySelector('input');
    fireEvent.change(input, { target: { files: [createFile()] } });

    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    resolve({ public_id: 'id1', url: 'url' });

    await waitFor(() => expect(handleComplete).toHaveBeenCalled());
    expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
  });
});
