import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from '../config/firebase';

// Upload image to Firebase Storage
export const uploadImage = async (file: File, reportId: string): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${reportId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `report-images/${fileName}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Get all images for a report
export const getReportImages = async (reportId: string): Promise<string[]> => {
  try {
    const listRef = ref(storage, `report-images/`);
    const res = await listAll(listRef);
    
    const reportImages = res.items.filter(item => 
      item.name.startsWith(reportId)
    );
    
    const urls = await Promise.all(
      reportImages.map(item => getDownloadURL(item))
    );
    
    return urls;
  } catch (error) {
    console.error('Error getting report images:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files: File[], reportId: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, reportId));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}; 