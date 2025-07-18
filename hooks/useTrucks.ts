import { db } from "@/services/Firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from 'react';
import AsyncStorageService from '../services/AsyncStorageService';
import { CreateTruckData, Truck, UpdateTruckData } from '../types/Truck';

const TRUCKS_STORAGE_KEY = 'trucks';

const truckService = new AsyncStorageService<Truck[]>();

export const useTrucks = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load trucks from storage
  const loadTrucks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const storedTrucks = await truckService.load(TRUCKS_STORAGE_KEY);
      const firebaseTrucks = (await getDocs(collection(db, TRUCKS_STORAGE_KEY))).docs.map(doc => doc.data() as Truck);
      
      // Migrate old truck data to new format
      const migratedTrucks = (firebaseTrucks || storedTrucks || []).map(truck => {
        // Convert old deadline fields to custom fields if they exist
        const customFields = truck.customFields || [];
        truck.createdAt = new Date((truck.createdAt as { seconds: number }).seconds * 1000);
        truck.updatedAt = new Date((truck.updatedAt as { seconds: number }).seconds * 1000);
        truck.customFields = truck.customFields.map(field => {
          if (field.type === 'DATE' && field.value) {
            field.value = new Date((field.value as { seconds: number }).seconds * 1000);
          }
          return field;
        });
        
        // // Add insurance deadline if it exists and not already in custom fields
        // if ('insuranceDeadline' in truck && truck.insuranceDeadline && typeof truck.insuranceDeadline === 'string') {
        //   const hasInsuranceField = customFields.some(field => 
        //     field.label === 'Insurance Deadline'
        //   );
        //   if (!hasInsuranceField) {
        //     customFields.push({
        //       id: `migrated_insurance_${truck.id}`,
        //       type: CustomFieldType.DATE,
        //       label: 'Insurance Deadline',
        //       value: new Date(truck.insuranceDeadline),
        //     });
        //   }
        // }
        
        // // Add tech inspection deadline if it exists and not already in custom fields
        // if ('techInspectionDeadline' in truck && truck.techInspectionDeadline && typeof truck.techInspectionDeadline === 'string') {
        //   const hasTechField = customFields.some(field => 
        //     field.label === 'Tech Inspection Deadline'
        //   );
        //   if (!hasTechField) {
        //     customFields.push({
        //       id: `migrated_tech_${truck.id}`,
        //       type: CustomFieldType.DATE,
        //       label: 'Tech Inspection Deadline',
        //       value: new Date(truck.techInspectionDeadline),
        //     });
        //   }
        // }
        
        return {
          ...truck,
          // createdAt: typeof truck.createdAt === 'string' ? new Date(truck.createdAt) : truck.createdAt,
          // updatedAt: typeof truck.updatedAt === 'string' ? new Date(truck.updatedAt) : truck.updatedAt,
          customFields,
        };
      });
      
      setTrucks(migratedTrucks);
    } catch (err) {
      setError('Failed to load trucks');
      console.error('Error loading trucks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save trucks to storage
  const saveTrucks = useCallback(async (trucksData: Truck[]) => {
    try {
      await truckService.save(TRUCKS_STORAGE_KEY, trucksData);
      setTrucks(trucksData);
    } catch (err) {
      setError('Failed to save trucks');
      console.error('Error saving trucks:', err);
      throw err;
    }
  }, []);

  // Add a new truck
  const addTruck = useCallback(async (truckData: CreateTruckData) => {
    try {
      const newTruck: Truck = {
        id: Date.now().toString(), // Simple ID generation
        ...truckData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTrucks = [...trucks, newTruck];
      await saveTrucks(updatedTrucks);
      await addDoc(collection(db, TRUCKS_STORAGE_KEY), newTruck);
      return newTruck;
    } catch (err) {
      setError('Failed to add truck');
      console.error('Error adding truck:', err);
      throw err;
    }
  }, [trucks, saveTrucks]);

  // Update an existing truck
  const updateTruck = useCallback(async (id: string, updates: UpdateTruckData) => {
    try {
      const updatedTrucks = trucks.map(truck => 
        truck.id === id 
          ? { 
              ...truck, 
              ...updates, 
              updatedAt: new Date() 
            }
          : truck
      );
      
      await saveTrucks(updatedTrucks);
      return updatedTrucks.find(truck => truck.id === id);
    } catch (err) {
      setError('Failed to update truck');
      console.error('Error updating truck:', err);
      throw err;
    }
  }, [trucks, saveTrucks]);

  // Delete a truck
  const deleteTruck = useCallback(async (id: string) => {
    try {
      const updatedTrucks = trucks.filter(truck => truck.id !== id);
      await saveTrucks(updatedTrucks);
    } catch (err) {
      setError('Failed to delete truck');
      console.error('Error deleting truck:', err);
      throw err;
    }
  }, [trucks, saveTrucks]);

  // Clear all trucks
  const clearTrucks = useCallback(async () => {
    try {
      await truckService.remove(TRUCKS_STORAGE_KEY);
      setTrucks([]);
    } catch (err) {
      setError('Failed to clear trucks');
      console.error('Error clearing trucks:', err);
      throw err;
    }
  }, []);

  // Get truck by ID
  const getTruckById = useCallback((id: string) => {
    return trucks.find(truck => truck.id === id) || null;
  }, [trucks]);

  // Load trucks on component mount
  useEffect(() => {
    loadTrucks();
  }, [loadTrucks]);

  return {
    trucks,
    loading,
    error,
    addTruck,
    updateTruck,
    deleteTruck,
    clearTrucks,
    getTruckById,
    refreshTrucks: loadTrucks,
  };
}; 