import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

export type Role = 'passenger' | 'driver';
export type RideStatus =
  | 'requested'
  | 'accepted'
  | 'arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  rating: string;
  vehicle?: string;
  plate?: string;
}

export interface Ride {
  id: string;
  passengerName: string;
  passengerPhone: string;
  driverName: string;
  driverPhone: string;
  vehicle: string;
  plate: string;
  pickup: string;
  destination: string;
  fare: number;
  distance: string;
  eta: string;
  status: RideStatus;
  requestedAt: string;
}

interface TransportContextValue {
  user: DemoUser | null;
  ride: Ride | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  requestRide: (destination: string, vehicle: string, fare: number) => void;
  updateRideStatus: (status: RideStatus) => void;
  cancelRide: () => void;
}

const USER_KEY = '@smart-transport/user';
const RIDE_KEY = '@smart-transport/ride';

const DEMO_USERS: Array<DemoUser & { password: string }> = [
  {
    id: 'passenger-ama',
    name: 'Ama Mensah',
    email: 'passenger@demo.com',
    password: 'Pass1234!',
    role: 'passenger',
    phone: '+233 24 555 0182',
    rating: '4.9',
  },
  {
    id: 'driver-kojo',
    name: 'Kojo Asante',
    email: 'driver@demo.com',
    password: 'Drive1234!',
    role: 'driver',
    phone: '+233 20 555 0197',
    rating: '4.8',
    vehicle: 'Toyota Corolla · White',
    plate: 'GR 4821-24',
  },
];

const TransportContext = createContext<TransportContextValue | null>(null);

export function TransportProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to safely parse JSON from AsyncStorage
  const safeParse = useCallback(<T,>(value: string | null, fallback: T): T => {
    if (!value) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }, []);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(USER_KEY), AsyncStorage.getItem(RIDE_KEY)])
      .then(([storedUser, storedRide]) => {
        if (storedUser) {
          setUser(safeParse(storedUser, null));
        }
        if (storedRide) {
          setRide(safeParse(storedRide, null));
        }
      })
      .catch(() => {
        // The app remains usable with a clean local session if storage is unavailable.
      })
      .finally(() => setIsLoading(false));
  }, [safeParse]);

  const persist = useCallback(
    (nextUser: DemoUser | null, nextRide: Ride | null) => {
      const writes = [
        nextUser
          ? AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser))
          : AsyncStorage.removeItem(USER_KEY),
        nextRide
          ? AsyncStorage.setItem(RIDE_KEY, JSON.stringify(nextRide))
          : AsyncStorage.removeItem(RIDE_KEY),
      ];
      void Promise.all(writes);
    },
    [],
  );

  const login = async (email: string, password: string) => {
    const match = DEMO_USERS.find(
      (candidate) =>
        candidate.email === email.trim().toLowerCase() &&
        candidate.password === password,
    );
    if (!match) {
      return {
        ok: false,
        message: 'That demo login did not match. Check the details below.',
      };
    }
    const nextUser: DemoUser = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role,
      phone: match.phone,
      rating: match.rating,
      vehicle: match.vehicle,
      plate: match.plate,
    };
    setUser(nextUser);
    // Use functional update to get current ride state
    setRide((currentRide) => {
      persist(nextUser, currentRide);
      return currentRide;
    });
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    persist(null, ride);
  };

  const requestRide = (destination: string, vehicle: string, fare: number) => {
    const nextRide: Ride = {
      id: `ride-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      passengerName: 'Ama Mensah',
      passengerPhone: '+233 24 555 0182',
      driverName: 'Kojo Asante',
      driverPhone: '+233 20 555 0197',
      vehicle,
      plate: 'GR 4821-24',
      pickup: 'Current location · Airport Residential',
      destination,
      fare,
      distance: destination.includes('Airport') ? '8.4 km' : '6.2 km',
      eta: '4 min',
      status: 'requested',
      requestedAt: new Date().toISOString(),
    };
    setRide(nextRide);
    persist(user, nextRide);
  };

  const updateRideStatus = (status: RideStatus) => {
    setRide((currentRide) => {
      if (!currentRide) return currentRide;
      const nextRide = { ...currentRide, status };
      persist(user, nextRide);
      return nextRide;
    });
  };

  const cancelRide = () => {
    setRide((currentRide) => {
      if (!currentRide) return currentRide;
      const nextRide = { ...currentRide, status: 'cancelled' as const };
      persist(user, nextRide);
      return nextRide;
    });
  };

  const value = useMemo(
    () => ({
      user,
      ride,
      isLoading,
      login,
      logout,
      requestRide,
      updateRideStatus,
      cancelRide,
    }),
    [user, ride, isLoading],
  );

  return (
    <TransportContext.Provider value={value}>
      {children}
    </TransportContext.Provider>
  );
}

export function useTransport() {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within TransportProvider');
  }
  return context;
}