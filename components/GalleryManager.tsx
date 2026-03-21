import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Loader2, Upload } from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../src/firebase';
import { APP_ID } from '../constants';
import { GalleryImage } from '../types';

interface GalleryManagerProps {
  productId: string;
  productName: string;
}

const GalleryManager: React.FC<GalleryManagerProps> = ({ productId, productName }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    const q = query(collection(db, `gallery_${productId}`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: GalleryImage[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as GalleryImage);
      });
      setImages(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching gallery images:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("檔案大小不能超過 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileId = Date.now().toString();
      const storageRef = ref(storage, `gallery/${productId}/${fileId}_${file.name}`);
      
      const uploadTask = await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      const newImage: GalleryImage = {
        id: fileId,
        url: downloadURL,
        caption: caption,
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, `gallery_${productId}`, fileId), newImage);
      
      setCaption('');
    } catch (error) {
      console.error("Upload failed:", error);
      alert("上傳失敗，請稍後再試");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm("確定要刪除這張圖片嗎？")) return;

    try {
      // Try to delete from storage if it's a firebase storage URL
      if (image.url.includes('firebasestorage')) {
        const urlRef = ref(storage, image.url);
        await deleteObject(urlRef).catch(e => console.warn("Storage object not found", e));
      }
      
      await deleteDoc(doc(db, `gallery_${productId}`, image.id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("刪除失敗");
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#E6DCC3] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#E6DCC3] text-[#8B5E3C] p-2 rounded-xl">
          <ImageIcon size={20} />
        </div>
        <h3 className="text-lg font-bold text-[#5C4033]">{productName}</h3>
      </div>

      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-[#A67C52] mb-2">圖片說明 (選填)</label>
          <input 
            type="text" 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="例如：客製化雙人流麻..."
            className="w-full p-3 rounded-xl border-2 border-[#E6DCC3] focus:border-[#BC4A3C] outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <button 
            disabled={uploading}
            className="flex items-center gap-2 bg-[#BC4A3C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#A33E32] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            上傳圖片
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-[#A67C52]">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-10 text-[#D6C0B3] border-2 border-dashed border-[#E6DCC3] rounded-2xl">
          <p className="font-bold">目前沒有圖片</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden border border-[#E6DCC3] bg-[#F9F5F0] flex flex-col">
              <div className="relative w-full overflow-hidden">
                <img src={img.url} alt={img.caption || ''} className="w-full h-auto max-h-[200px] object-contain mx-auto" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <button 
                    onClick={() => handleDelete(img)}
                    className="self-end p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {img.caption && (
                <div className="p-2 bg-white border-t border-[#E6DCC3]">
                  <p className="text-[#5C4033] text-[10px] truncate">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
