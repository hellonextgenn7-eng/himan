import React, { useState, useRef } from 'react';
import { uploadProductImage } from '../../services/imageUploadService';
import {
  Upload,
  Link as LinkIcon,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { handleImageError } from '../../utils/imageFallback';

interface MultiImageUploaderProps {
  images: string[];
  primaryImage?: string;
  productId?: string;
  onChange: (images: string[], primaryImage: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  primaryImage,
  productId,
  onChange,
  showToast
}) => {
  // Slots: exactly 5 slots (1 to 5)
  const MAX_SLOTS = 5;
  const currentImages = Array.isArray(images) ? [...images] : [];
  const currentPrimary = primaryImage || currentImages[0] || '';

  // Track per-slot upload state: { slotIndex: { uploading: boolean, progress: number, error?: string } }
  const [uploadStates, setUploadStates] = useState<
    Record<number, { uploading: boolean; progress: number; error?: string }>
  >({});

  // Active method toggle per slot: 'url' | 'gallery'
  const [inputModes, setInputModes] = useState<Record<number, 'url' | 'gallery'>>({
    0: 'gallery',
    1: 'gallery',
    2: 'gallery',
    3: 'gallery',
    4: 'gallery'
  });

  // URL inputs state per slot
  const [urlInputs, setUrlInputs] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    for (let i = 0; i < MAX_SLOTS; i++) {
      map[i] = currentImages[i] || '';
    }
    return map;
  });

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update image in a slot
  const handleSetSlotImage = (slotIndex: number, newUrl: string) => {
    const updated = [...currentImages];
    if (newUrl.trim()) {
      updated[slotIndex] = newUrl.trim();
    } else {
      updated.splice(slotIndex, 1);
    }
    // Clean up empty gaps
    const filtered = updated.filter((u) => u && u.trim().length > 0).slice(0, MAX_SLOTS);
    const newPrimary = filtered.includes(currentPrimary) ? currentPrimary : filtered[0] || '';
    onChange(filtered, newPrimary);
  };

  // Remove image from slot
  const handleRemoveSlot = (slotIndex: number) => {
    const removedUrl = currentImages[slotIndex];
    const updated = currentImages.filter((_, idx) => idx !== slotIndex);
    const newPrimary = currentPrimary === removedUrl ? updated[0] || '' : currentPrimary;
    onChange(updated, newPrimary);

    setUrlInputs((prev) => {
      const next = { ...prev };
      delete next[slotIndex];
      return next;
    });
    showToast(`Image ${slotIndex + 1} removed.`, 'info');
  };

  // Set as Primary Image
  const handleSetPrimary = (url: string, slotIndex: number) => {
    if (!url) return;
    onChange(currentImages, url);
    showToast(`Image ${slotIndex + 1} set as Primary showcase image.`);
  };

  // Move image left (reorder)
  const handleMoveLeft = (slotIndex: number) => {
    if (slotIndex <= 0) return;
    const updated = [...currentImages];
    const temp = updated[slotIndex];
    updated[slotIndex] = updated[slotIndex - 1];
    updated[slotIndex - 1] = temp;
    onChange(updated, currentPrimary);
  };

  // Move image right (reorder)
  const handleMoveRight = (slotIndex: number) => {
    if (slotIndex >= currentImages.length - 1) return;
    const updated = [...currentImages];
    const temp = updated[slotIndex];
    updated[slotIndex] = updated[slotIndex + 1];
    updated[slotIndex + 1] = temp;
    onChange(updated, currentPrimary);
  };

  // Direct Gallery File Upload
  const handleFileSelected = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStates((prev) => ({
      ...prev,
      [slotIndex]: { uploading: true, progress: 10 }
    }));

    try {
      const downloadUrl = await uploadProductImage(
        file,
        productId || 'phone_listing',
        slotIndex,
        (progress) => {
          setUploadStates((prev) => ({
            ...prev,
            [slotIndex]: { uploading: true, progress }
          }));
        }
      );

      handleSetSlotImage(slotIndex, downloadUrl);
      setUploadStates((prev) => ({
        ...prev,
        [slotIndex]: { uploading: false, progress: 100 }
      }));
      showToast(`Slot ${slotIndex + 1}: Image uploaded from device successfully!`, 'success');
    } catch (err: any) {
      console.error('Gallery image upload failed:', err);
      setUploadStates((prev) => ({
        ...prev,
        [slotIndex]: { uploading: false, progress: 0, error: err.message || 'Upload failed' }
      }));
      showToast(err.message || 'Failed to upload image.', 'error');
    } finally {
      // Clear file input value so re-selecting same file triggers change
      if (fileInputRefs.current[slotIndex]) {
        fileInputRefs.current[slotIndex]!.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#FF6A00]" />
            <span>Product Images (1 to 5 Images Allowed)</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Upload from device gallery or paste image URLs. Complete mobile phone will display uncropped.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
          {currentImages.length} / {MAX_SLOTS} Configured
        </span>
      </div>

      {/* 5 Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {Array.from({ length: MAX_SLOTS }).map((_, slotIdx) => {
          const imageUrl = currentImages[slotIdx] || '';
          const isPrimary = Boolean(imageUrl && (imageUrl === currentPrimary || (!currentPrimary && slotIdx === 0)));
          const uploadState = uploadStates[slotIdx] || { uploading: false, progress: 0 };
          const mode = inputModes[slotIdx] || 'gallery';

          return (
            <div
              key={slotIdx}
              className={`flex flex-col justify-between bg-slate-950/90 border-2 rounded-2xl p-2.5 transition-all relative ${
                isPrimary
                  ? 'border-[#FF6A00] ring-2 ring-[#FF6A00]/20 shadow-md'
                  : imageUrl
                  ? 'border-slate-700 hover:border-slate-600'
                  : 'border-dashed border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Slot Header Badge */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px]">
                <span className="font-bold text-slate-300">Image {slotIdx + 1}</span>
                {isPrimary ? (
                  <span className="bg-[#FF6A00] text-white font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" /> Primary
                  </span>
                ) : slotIdx === 0 && !imageUrl ? (
                  <span className="text-slate-500 text-[9px]">Main Slot *</span>
                ) : null}
              </div>

              {/* Image Preview Area (Uncropped, aspect-square, object-contain on neutral backdrop) */}
              <div className="my-2 aspect-square rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-2 relative group">
                {uploadState.uploading ? (
                  <div className="text-center space-y-1.5 p-2">
                    <Loader2 className="w-6 h-6 text-[#FF6A00] animate-spin mx-auto" />
                    <span className="text-[10px] text-slate-300 font-bold block">
                      Uploading {uploadState.progress}%
                    </span>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FF6A00] h-full transition-all duration-200"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                  </div>
                ) : imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={`Product slot ${slotIdx + 1}`}
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                      className="w-full h-full object-contain filter drop-shadow-md"
                    />

                    {/* Quick overlay actions on hover */}
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1.5">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(imageUrl, slotIdx)}
                          className="px-2 py-1 bg-[#FF6A00] hover:bg-[#E55F00] text-white text-[10px] font-bold rounded-lg shadow-sm w-full flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Star className="w-3 h-3 fill-current" /> Make Primary
                        </button>
                      )}

                      <div className="flex items-center gap-1 w-full justify-center">
                        {slotIdx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveLeft(slotIdx)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
                            title="Move Left"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {slotIdx < currentImages.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveRight(slotIdx)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
                            title="Move Right"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slotIdx)}
                          className="p-1 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded text-xs"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-2 text-slate-500">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                    <span className="text-[10px] block font-medium">Slot Empty</span>
                  </div>
                )}
              </div>

              {/* Slot Input Controls: Tabs (Gallery vs URL) */}
              <div className="space-y-2 pt-1 border-t border-slate-900">
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setInputModes((prev) => ({ ...prev, [slotIdx]: 'gallery' }))}
                    className={`flex-1 py-1 rounded font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      mode === 'gallery' ? 'bg-[#FF6A00] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-2.5 h-2.5" /> Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputModes((prev) => ({ ...prev, [slotIdx]: 'url' }))}
                    className={`flex-1 py-1 rounded font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      mode === 'url' ? 'bg-[#FF6A00] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-2.5 h-2.5" /> URL
                  </button>
                </div>

                {/* Option A: Gallery File Input */}
                {mode === 'gallery' && (
                  <div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      ref={(el) => {
                        fileInputRefs.current[slotIdx] = el;
                      }}
                      onChange={(e) => handleFileSelected(slotIdx, e)}
                      className="hidden"
                      id={`file-slot-${slotIdx}`}
                    />
                    <label
                      htmlFor={`file-slot-${slotIdx}`}
                      className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-center truncate"
                    >
                      <Upload className="w-3 h-3 text-[#FF6A00]" />
                      <span>{imageUrl ? 'Replace File' : 'Upload File'}</span>
                    </label>
                  </div>
                )}

                {/* Option B: Image URL Input */}
                {mode === 'url' && (
                  <div className="flex gap-1">
                    <input
                      type="url"
                      value={urlInputs[slotIdx] !== undefined ? urlInputs[slotIdx] : imageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUrlInputs((prev) => ({ ...prev, [slotIdx]: val }));
                      }}
                      onBlur={(e) => {
                        if (e.target.value.trim() !== imageUrl) {
                          handleSetSlotImage(slotIdx, e.target.value.trim());
                        }
                      }}
                      placeholder="https://..."
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-white focus:outline-none focus:border-[#FF6A00]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = urlInputs[slotIdx] || '';
                        handleSetSlotImage(slotIdx, val);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg"
                      title="Apply URL"
                    >
                      ✓
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
