import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Report } from '../App';

// Collection name for reports
const REPORTS_COLLECTION = 'traffic_reports';

// Add a new report to Firestore
export const addReport = async (report: Omit<Report, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
      ...report,
      timestamp: Timestamp.fromDate(report.timestamp),
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...report };
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};

// Get all reports from Firestore
export const getReports = async (): Promise<Report[]> => {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as Report[];
  } catch (error) {
    console.error('Error getting reports:', error);
    throw error;
  }
};

// Get reports by mood filter
export const getReportsByMood = async (mood: string): Promise<Report[]> => {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where('sentiment.mood', '==', mood),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as Report[];
  } catch (error) {
    console.error('Error getting reports by mood:', error);
    throw error;
  }
};

// Get recent reports (last 24 hours)
export const getRecentReports = async (hours: number = 24): Promise<Report[]> => {
  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where('timestamp', '>=', Timestamp.fromDate(cutoffTime)),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as Report[];
  } catch (error) {
    console.error('Error getting recent reports:', error);
    throw error;
  }
};

// Update a report
export const updateReport = async (id: string, updates: Partial<Report>) => {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, id);
    await updateDoc(reportRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

// Delete a report
export const deleteReport = async (id: string) => {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, id);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

// Get reports statistics
export const getReportStats = async () => {
  try {
    const reports = await getReports();
    const totalReports = reports.length;
    const todayReports = reports.filter(r => {
      const today = new Date();
      const reportDate = new Date(r.timestamp);
      return today.toDateString() === reportDate.toDateString();
    }).length;
    
    const moodCounts = reports.reduce((acc, report) => {
      if (report.sentiment) {
        acc[report.sentiment.mood] = (acc[report.sentiment.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalReports,
      todayReports,
      moodCounts
    };
  } catch (error) {
    console.error('Error getting report stats:', error);
    throw error;
  }
}; 