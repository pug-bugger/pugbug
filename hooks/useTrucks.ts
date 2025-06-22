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
      setTrucks(storedTrucks || []);
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedTrucks = [...trucks, newTruck];
      await saveTrucks(updatedTrucks);
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
              updatedAt: new Date().toISOString() 
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