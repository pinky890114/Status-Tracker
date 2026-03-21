import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../src/firebase';
import { APP_ID } from '../constants';
import { GalleryImage } from '../types';

interface GalleryViewerProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

const GalleryViewer: React.FC<GalleryViewerProps> = ({ productId, productName, onClose }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F9F5F0] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-[#E6DCC3] bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6DCC3] text-[#8B5E3C] p-2 rounded-xl">
              <ImageIcon size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#5C4033]">{productName} 作品集</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#A67C52] hover:bg-[#E6DCC3] rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#A67C52]">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-bold">載入中...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 text-[#D6C0B3] border-4 border-dashed border-[#E6DCC3] bg-white rounded-[2.5rem] flex flex-col items-center justify-center gap-2">
              <ImageIcon size={48} className="text-[#E6DCC3]" />
              <p className="font-bold text-lg">目前還沒有作品喔</p>
              <p className="text-sm">敬請期待老師更新</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((img) => (
                <div key={img.id} className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-[#E6DCC3] flex flex-col">
                  <div className="relative w-full overflow-hidden bg-[#F2EFE9]">
                    <img 
                      src={img.url} 
                      alt={img.caption || productName} 
                      className="w-full h-auto max-h-[400px] object-contain transition-transform duration-500 group-hover:scale-105 mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {img.caption && (
                    <div className="p-4 bg-white border-t border-[#E6DCC3]">
                      <p className="text-[#5C4033] text-sm font-medium">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryViewer;
