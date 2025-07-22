import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/services/Firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from 'react';
import AsyncStorageService from '../services/AsyncStorageService';
import { CreateTruckData, Truck, UpdateTruckData } from '../types/Truck';

const TRUCKS_STORAGE_KEY = 'trucks';

const truckService = new AsyncStorageService<Truck[]>();

export const useTrucks = () => {
  const { user } = useAuth();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load trucks from storage and Firestore for the current user
  const loadTrucks = useCallback(async () => {
    if (!user) {
      setTrucks([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Clear local storage before loading new user's data
      await truckService.remove(TRUCKS_STORAGE_KEY);
      // Load from Firestore: users/{uid}/trucks
      const trucksCol = collection(db, "users", user.uid, "trucks");
      const firebaseTrucks = (await getDocs(trucksCol)).docs.map(doc => doc.data() as Truck);
      // Save to local storage for offline use
      await truckService.save(TRUCKS_STORAGE_KEY, firebaseTrucks);
      setTrucks(firebaseTrucks);
    } catch (err) {
      setError('Failed to load trucks');
      console.error('Error loading trucks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save trucks to storage (and optionally Firestore)
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
    if (!user) throw new Error('Not logged in');
    try {
      const newTruck: Truck = {
        id: Date.now().toString(),
        ...truckData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // Add to Firestore under users/{uid}/trucks
      const trucksCol = collection(db, "users", user.uid, "trucks");
      await addDoc(trucksCol, newTruck);
      const updatedTrucks = [...trucks, newTruck];
      await saveTrucks(updatedTrucks);
      return newTruck;
    } catch (err) {
      setError('Failed to add truck');
      console.error('Error adding truck:', err);
      throw err;
    }
  }, [trucks, saveTrucks, user]);

  // Update an existing truck (local only, for now)
  const updateTruck = useCallback(async (id: string, updates: UpdateTruckData) => {
    try {
      const updatedTrucks = trucks.map(truck =>
        truck.id === id
          ? {
              ...truck,
              ...updates,
              updatedAt: new Date(),
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

  // Delete a truck (local only, for now)
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

  // Load trucks on user change
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