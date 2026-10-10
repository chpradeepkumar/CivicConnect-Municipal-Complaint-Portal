import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

const MAX_FILES = 5;

export function ImageUploader({ files, onChange, max = MAX_FILES }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFiles = (selected) => {
    setError('');
    const incoming = Array.from(selected);
    const images = incoming.filter((f) => f.type.startsWith('image/'));
    if (images.length !== incoming.length) setError('Only image files are allowed');
    const oversized = images.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) setError('Each image must be 5 MB or smaller');

    const next = [...files, ...images.filter((f) => f.size <= 5 * 1024 * 1024)].slice(0, max);
    onChange(next);
  };

  const remove = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div>
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50/40 px-4 py-6 text-center transition hover:border-civic-400 hover:bg-civic-50/40"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <ImagePlus className="h-6 w-6 text-civic-600" />
        <p className="text-sm font-medium text-navy-700">Click to upload or drag and drop</p>
        <p className="text-xs text-navy-400">PNG, JPG, WEBP or GIF · up to 5 MB each · max {max} images</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error ? <p className="field-error">{error}</p> : null}
      {files.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((file, idx) => (
            <li key={`${file.name}-${idx}`} className="group relative overflow-hidden rounded-lg border border-navy-100">
              <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute right-1 top-1 rounded-full bg-navy-900/70 p-1 text-white opacity-90 hover:bg-red-600"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default ImageUploader;
