import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import {
  DemoUser,
  Ride,
  RideStatus,
  useTransport,
} from '@/context/TransportContext';

const icon = require('../assets/images/icon.png');

const DESTINATIONS = [
  { name: 'Kotoka International Airport', detail: 'Airport City', icon: 'airplane' as const },
  { name: 'Accra Mall', detail: 'Tetteh Quarshie', icon: 'cart-outline' as const },
  { name: 'Osu Oxford Street', detail: 'Osu, Accra', icon: 'restaurant-outline' as const },
  { name: 'University of Ghana', detail: 'Legon', icon: 'school-outline' as const },
];

const VEHICLES = [
  { name: 'SmartGo', detail: 'Affordable everyday rides', price: 28, icon: 'car-outline' as const },
  { name: 'Comfort', detail: 'More space, newer cars', price: 42, icon: 'car-sport-outline' as const },
];

function money(value: number) {
  return `GH₵ ${value.toFixed(2)}`;
}

function haptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <Image
      source={icon}
      style={{ width: size, height: size, borderRadius: size * 0.24 }}
      accessibilityLabel="Smart Transport Ghana"
    />
  );
}

function IconButton({
  name,
  onPress,
  colors,
  testID,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  testID: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        haptic();
        onPress();
      }}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      <Ionicons name={name} size={20} color={colors.foreground} />
    </Pressable>
  );
}

function PrimaryButton({
  label,
  iconName,
  onPress,
  colors,
  disabled = false,
  testID,
  secondary = false,
}: {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  disabled?: boolean;
  testID: string;
  secondary?: boolean;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        if (disabled) return;
        haptic();
        onPress();
      }}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: secondary ? colors.secondary : colors.primary,
          borderColor: secondary ? colors.border : colors.primary,
        },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text
        style={[
          styles.primaryButtonText,
          { color: secondary ? colors.secondaryForeground : colors.primaryForeground },
        ]}
      >
        {label}
      </Text>
      <Ionicons
        name={iconName}
        size={18}
        color={secondary ? colors.secondaryForeground : colors.primaryForeground}
      />
    </Pressable>
  );
}

function TopBar({
  user,
  onLogout,
  colors,
}: {
  user: DemoUser;
  onLogout: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.topBar}>
      <View style={styles.brandRow}>
        <LogoMark size={38} />
        <View>
          <Text style={[styles.brandName, { color: colors.foreground }]}>Smart Transport</Text>
          <Text style={[styles.brandLocation, { color: colors.mutedForeground }]}>Accra, Ghana</Text>
        </View>
      </View>
      <Pressable
        testID="logout-button"
        onPress={() => {
          haptic();
          onLogout();
        }}
        style={({ pressed }) => [styles.avatar, { backgroundColor: colors.sand }, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <Text style={[styles.avatarText, { color: colors.primary }]}>
          {user.name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)}
        </Text>
      </Pressable>
    </View>
  );
}

function MapPreview({
  colors,
  status = 'ready',
}: {
  colors: ReturnType<typeof useColors>;
  status?: 'ready' | 'requested' | 'arriving' | 'in_progress' | 'completed';
}) {
  const showRoute = status !== 'ready' && status !== 'requested';
  return (
    <View style={[styles.map, { backgroundColor: colors.navy }]}>
      <View style={[styles.mapGrid, { borderColor: 'rgba(255,255,255,0.08)' }]} />
      <View style={[styles.mapRoad, styles.mapRoadOne, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
      <View style={[styles.mapRoad, styles.mapRoadTwo, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
      <View style={[styles.mapRoad, styles.mapRoadThree, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
      {showRoute ? (
        <>
          <View style={[styles.routeLine, { backgroundColor: colors.accent }]} />
          <View style={[styles.mapPin, styles.pickupPin, { backgroundColor: colors.card }]}>
            <View style={[styles.pinDot, { backgroundColor: colors.primary }]} />
          </View>
          <View style={[styles.mapPin, styles.destinationPin, { backgroundColor: colors.accent }]}>
            <Ionicons name="location" size={18} color={colors.navy} />
          </View>
          <View style={[styles.mapCar, { backgroundColor: colors.card }]}>
            <MaterialCommunityIcons name="car-side" size={20} color={colors.primary} />
          </View>
        </>
      ) : (
        <View style={[styles.currentLocation, { backgroundColor: colors.card }]}>
          <View style={[styles.currentLocationDot, { backgroundColor: colors.accent }]} />
        </View>
      )}
      <View style={[styles.mapLabel, { backgroundColor: 'rgba(23,42,55,0.84)' }]}>
        <Ionicons name="navigate-outline" size={14} color={colors.accent} />
        <Text style={[styles.mapLabelText, { color: colors.primaryForeground }]}>Airport Residential</Text>
      </View>
    </View>
  );
}

function SectionTitle({
  title,
  action,
  colors,
}: {
  title: string;
  action?: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action ? <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text> : null}
    </View>
  );
}

function LoginScreen() {
  const colors = useColors();
  const { login } = useTransport();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [email, setEmail] = useState('passenger@demo.com');
  const [password, setPassword] = useState('Pass1234!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectDemo = (nextRole: 'passenger' | 'driver') => {
    setRole(nextRole);
    setError('');
    if (nextRole === 'passenger') {
      setEmail('passenger@demo.com');
      setPassword('Pass1234!');
    } else {
      setEmail('driver@demo.com');
      setPassword('Drive1234!');
    }
  };

  const handleLogin = async () => {
    setSubmitting(true);
    setError('');
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) setError(result.message ?? 'Unable to sign in.');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.navy, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.loginHero, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 22) }]}
      >
        <View style={styles.loginHeroGlow} />
        <LogoMark size={66} />
        <Text style={[styles.loginTitle, { color: colors.primaryForeground }]}>Move Ghana forward.</Text>
        <Text style={[styles.loginSubtitle, { color: 'rgba(255,253,246,0.76)' }]}>
          Reliable rides, built for your everyday journey.
        </Text>
      </LinearGradient>
      <KeyboardAwareScrollViewCompat
        style={styles.loginContent}
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 28) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loginIntro}>
          <Text style={[styles.screenEyebrow, { color: colors.primary }]}>WELCOME BACK</Text>
          <Text style={[styles.loginFormTitle, { color: colors.foreground }]}>How are you riding today?</Text>
        </View>
        <View style={[styles.roleToggle, { backgroundColor: colors.muted }]}>
          {(['passenger', 'driver'] as const).map((item) => {
            const selected = item === role;
            return (
              <Pressable
                key={item}
                testID={`${item}-role`}
                onPress={() => {
                  haptic();
                  selectDemo(item);
                }}
                style={[
                  styles.roleOption,
                  selected && { backgroundColor: colors.card, shadowColor: colors.navy },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Ionicons
                  name={item === 'passenger' ? 'person-outline' : 'car-outline'}
                  size={17}
                  color={selected ? colors.primary : colors.mutedForeground}
                />
                <Text style={[styles.roleOptionText, { color: selected ? colors.foreground : colors.mutedForeground }]}>
                  {item === 'passenger' ? 'Passenger' : 'Driver'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Email address</Text>
          <View style={[styles.inputShell, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={19} color={colors.mutedForeground} />
            <TextInput
              testID="email-input"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: colors.foreground }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Password</Text>
          <View style={[styles.inputShell, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={19} color={colors.mutedForeground} />
            <TextInput
              testID="password-input"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Your password"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#F9E9E7' }]}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}
        <PrimaryButton
          label={submitting ? 'Signing in…' : 'Continue'}
          iconName="arrow-forward"
          onPress={handleLogin}
          colors={colors}
          disabled={submitting || !email || !password}
          testID="login-button"
        />
        <View style={[styles.demoCard, { backgroundColor: colors.sand }]}>
          <View style={styles.demoCardHeader}>
            <View style={[styles.demoIcon, { backgroundColor: colors.accent }]}>
              <Ionicons name="sparkles-outline" size={17} color={colors.navy} />
            </View>
            <View style={styles.demoCardCopy}>
              <Text style={[styles.demoTitle, { color: colors.foreground }]}>Demo access</Text>
              <Text style={[styles.demoBody, { color: colors.mutedForeground }]}>
                Try both sides of a trip with one tap.
              </Text>
            </View>
          </View>
          <View style={styles.demoButtons}>
            <Pressable
              testID="passenger-demo-button"
              onPress={() => {
                haptic();
                selectDemo('passenger');
              }}
              style={({ pressed }) => [
                styles.demoButton,
                { borderColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.demoButtonText, { color: colors.primary }]}>Passenger demo</Text>
            </Pressable>
            <Pressable
              testID="driver-demo-button"
              onPress={() => {
                haptic();
                selectDemo('driver');
              }}
              style={({ pressed }) => [
                styles.demoButton,
                { borderColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.demoButtonText, { color: colors.primary }]}>Driver demo</Text>
            </Pressable>
          </View>
          <Text style={[styles.demoCredentials, { color: colors.mutedForeground }]}>
            {role === 'passenger'
              ? 'passenger@demo.com  ·  Pass1234!'
              : 'driver@demo.com  ·  Drive1234!'}
          </Text>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function PassengerHome({
  user,
  ride,
  onLogout,
}: {
  user: DemoUser;
  ride: Ride | null;
  onLogout: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { requestRide } = useTransport();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [vehicle, setVehicle] = useState(VEHICLES[0].name);

  const selectedVehicle = VEHICLES.find((item) => item.name === vehicle) ?? VEHICLES[0];
  const fare = selectedVehicle.price + (destination?.includes('Airport') ? 12 : 0);
  const hasCompletedRide = ride?.status === 'completed';
  const hasCancelledRide = ride?.status === 'cancelled';

  const confirmRide = () => {
    if (!destination) return;
    requestRide(destination, vehicle, fare);
    setBookingOpen(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 18), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 30) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pagePadding}>
          <TopBar user={user} onLogout={onLogout} colors={colors} />
          <View style={styles.greetingRow}>
            <View>
              <Text style={[styles.screenEyebrow, { color: colors.primary }]}>PASSENGER</Text>
              <Text style={[styles.greeting, { color: colors.foreground }]}>Good afternoon, Ama</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: colors.secondary }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusPillText, { color: colors.primary }]}>Ready to ride</Text>
            </View>
          </View>
          <MapPreview colors={colors} status="ready" />
          <Pressable
            testID="open-booking"
            onPress={() => {
              haptic();
              setBookingOpen(true);
            }}
            style={({ pressed }) => [
              styles.destinationSearch,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            <View style={[styles.searchIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="search" size={20} color={colors.primary} />
            </View>
            <View style={styles.searchCopy}>
              <Text style={[styles.searchTitle, { color: colors.foreground }]}>Where to?</Text>
              <Text style={[styles.searchSubtitle, { color: colors.mutedForeground }]}>Set your destination</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </Pressable>
          {hasCompletedRide ? (
            <View style={[styles.lastTripCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.lastTripHeading}>
                <View style={[styles.lastTripIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="checkmark" size={18} color={colors.success} />
                </View>
                <View style={styles.flexOne}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>Trip completed</Text>
                  <Text style={[styles.cardSubtle, { color: colors.mutedForeground }]}>{ride.destination}</Text>
                </View>
                <Text style={[styles.fareText, { color: colors.foreground }]}>{money(ride.fare)}</Text>
              </View>
              <Text style={[styles.lastTripNote, { color: colors.mutedForeground }]}>
                Thanks for riding with Smart Transport.
              </Text>
            </View>
          ) : null}
          {hasCancelledRide ? (
            <View style={[styles.noticeCard, { backgroundColor: colors.sand }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.noticeText, { color: colors.foreground }]}>Your previous ride was cancelled. Ready for a new one?</Text>
            </View>
          ) : null}
          <SectionTitle title="Your shortcuts" colors={colors} />
          <View style={styles.shortcutRow}>
            {[
              { label: 'Airport', icon: 'airplane-outline' as const, value: 'Kotoka International Airport' },
              { label: 'Home', icon: 'home-outline' as const, value: 'Airport Residential' },
              { label: 'Work', icon: 'briefcase-outline' as const, value: 'Accra Mall' },
            ].map((shortcut) => (
              <Pressable
                key={shortcut.label}
                testID={`shortcut-${shortcut.label.toLowerCase()}`}
                onPress={() => {
                  haptic();
                  setDestination(shortcut.value);
                  setBookingOpen(true);
                }}
                style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <View style={[styles.shortcutIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name={shortcut.icon} size={19} color={colors.primary} />
                </View>
                <Text style={[styles.shortcutLabel, { color: colors.mutedForeground }]}>{shortcut.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.trustBanner, { backgroundColor: colors.primary }]}>
            <View style={styles.trustCopy}>
              <Text style={[styles.trustTitle, { color: colors.primaryForeground }]}>Your safety matters.</Text>
              <Text style={[styles.trustBody, { color: 'rgba(255,253,246,0.72)' }]}>
                Every ride includes driver details and a shareable trip status.
              </Text>
            </View>
            <Ionicons name="shield-checkmark-outline" size={38} color={colors.accent} />
          </View>
        </View>
      </ScrollView>
      {bookingOpen ? (
        <View style={[styles.bookingOverlay, { backgroundColor: colors.background }]}>
          <View style={[styles.bookingHeader, { borderBottomColor: colors.border }]}>
            <Pressable
              testID="close-booking"
              onPress={() => setBookingOpen(false)}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Close booking"
            >
              <Ionicons name="close" size={23} color={colors.foreground} />
            </Pressable>
            <View>
              <Text style={[styles.bookingEyebrow, { color: colors.primary }]}>BOOK A RIDE</Text>
              <Text style={[styles.bookingTitle, { color: colors.foreground }]}>Choose your destination</Text>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 28) }} showsVerticalScrollIndicator={false}>
            <View style={styles.pagePadding}>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>PICKUP</Text>
              <View style={[styles.locationField, { backgroundColor: colors.secondary }]}>
                <View style={[styles.locationDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.locationText, { color: colors.foreground }]}>Current location</Text>
                <Ionicons name="checkmark-circle" size={19} color={colors.success} />
              </View>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground, marginTop: 24 }]}>DESTINATION</Text>
              <View style={styles.destinationList}>
                {DESTINATIONS.map((item) => {
                  const selected = item.name === destination;
                  return (
                    <Pressable
                      key={item.name}
                      testID={`destination-${item.name}`}
                      onPress={() => {
                        haptic();
                        setDestination(item.name);
                      }}
                      style={({ pressed }) => [
                        styles.destinationOption,
                        {
                          backgroundColor: selected ? colors.secondary : colors.card,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <View style={[styles.destinationIcon, { backgroundColor: selected ? colors.accent : colors.muted }]}>
                        <Ionicons name={item.icon} size={19} color={selected ? colors.navy : colors.primary} />
                      </View>
                      <View style={styles.flexOne}>
                        <Text style={[styles.destinationName, { color: colors.foreground }]}>{item.name}</Text>
                        <Text style={[styles.destinationDetail, { color: colors.mutedForeground }]}>{item.detail}</Text>
                      </View>
                      <Ionicons
                        name={selected ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={selected ? colors.primary : colors.border}
                      />
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground, marginTop: 24 }]}>RIDE TYPE</Text>
              {VEHICLES.map((item) => {
                const selected = vehicle === item.name;
                const itemFare = item.price + (destination?.includes('Airport') ? 12 : 0);
                return (
                  <Pressable
                    key={item.name}
                    testID={`vehicle-${item.name}`}
                    onPress={() => {
                      haptic();
                      setVehicle(item.name);
                    }}
                    style={({ pressed }) => [
                      styles.vehicleOption,
                      {
                        backgroundColor: selected ? colors.primary : colors.card,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <View style={[styles.vehicleIcon, { backgroundColor: selected ? 'rgba(255,253,246,0.14)' : colors.secondary }]}>
                      <Ionicons name={item.icon} size={24} color={selected ? colors.accent : colors.primary} />
                    </View>
                    <View style={styles.flexOne}>
                      <Text style={[styles.vehicleName, { color: selected ? colors.primaryForeground : colors.foreground }]}>{item.name}</Text>
                      <Text style={[styles.vehicleDetail, { color: selected ? 'rgba(255,253,246,0.66)' : colors.mutedForeground }]}>{item.detail}</Text>
                    </View>
                    <Text style={[styles.vehicleFare, { color: selected ? colors.primaryForeground : colors.foreground }]}>{money(itemFare)}</Text>
                  </Pressable>
                );
              })}
              <View style={[styles.fareSummary, { borderTopColor: colors.border }]}>
                <Text style={[styles.fareSummaryLabel, { color: colors.mutedForeground }]}>Estimated fare</Text>
                <Text style={[styles.fareSummaryValue, { color: colors.foreground }]}>{money(fare)}</Text>
              </View>
              <PrimaryButton
                label={destination ? 'Request this ride' : 'Choose a destination'}
                iconName="arrow-forward"
                onPress={confirmRide}
                colors={colors}
                disabled={!destination}
                testID="request-ride"
              />
            </View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function RideStatusLabel({ status }: { status: RideStatus }) {
  const labels: Record<RideStatus, string> = {
    requested: 'Finding your driver',
    accepted: 'Driver confirmed',
    arriving: 'Driver is on the way',
    in_progress: 'You are on your way',
    completed: 'Trip completed',
    cancelled: 'Ride cancelled',
  };
  return <>{labels[status]}</>;
}

function PassengerTracking({
  user,
  ride,
  onLogout,
}: {
  user: DemoUser;
  ride: Ride;
  onLogout: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cancelRide } = useTransport();
  const isActive = ride.status !== 'completed' && ride.status !== 'cancelled';
  const progress = ride.status === 'requested' ? 0.18 : ride.status === 'accepted' ? 0.42 : ride.status === 'arriving' ? 0.66 : ride.status === 'in_progress' ? 0.84 : 1;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 18), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 30) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pagePadding}>
          <TopBar user={user} onLogout={onLogout} colors={colors} />
          <View style={styles.trackingHeading}>
            <View>
              <Text style={[styles.screenEyebrow, { color: colors.primary }]}>YOUR RIDE</Text>
              <Text style={[styles.greeting, { color: colors.foreground }]}><RideStatusLabel status={ride.status} /></Text>
            </View>
            <View style={[styles.etaBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.etaValue, { color: colors.navy }]}>{ride.status === 'requested' ? '—' : ride.eta}</Text>
              <Text style={[styles.etaLabel, { color: colors.navy }]}>ETA</Text>
            </View>
          </View>
          <MapPreview
            colors={colors}
            status={
              ride.status === 'accepted'
                ? 'arriving'
                : ride.status === 'requested'
                  ? 'requested'
                  : ride.status === 'cancelled'
                    ? 'ready'
                    : ride.status
            }
          />
          <View style={[styles.tripRouteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.routeRow}>
              <View style={styles.routeRail}>
                <View style={[styles.routeCircle, { borderColor: colors.primary, backgroundColor: colors.card }]} />
                <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
                <View style={[styles.routeCircle, { borderColor: colors.accent, backgroundColor: colors.accent }]} />
              </View>
              <View style={styles.routeCopy}>
                <Text style={[styles.routeLabel, { color: colors.mutedForeground }]}>PICKUP</Text>
                <Text style={[styles.routeValue, { color: colors.foreground }]}>{ride.pickup}</Text>
                <View style={styles.routeGap} />
                <Text style={[styles.routeLabel, { color: colors.mutedForeground }]}>DROPOFF</Text>
                <Text style={[styles.routeValue, { color: colors.foreground }]}>{ride.destination}</Text>
              </View>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>
          {ride.status === 'requested' ? (
            <View style={[styles.searchingCard, { backgroundColor: colors.secondary }]}>
              <ActivityIndicator color={colors.primary} />
              <View style={styles.flexOne}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Searching nearby drivers</Text>
                <Text style={[styles.cardSubtle, { color: colors.mutedForeground }]}>This demo request is ready for the driver view.</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.driverCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.driverAvatar, { backgroundColor: colors.sand }]}>
                <Text style={[styles.driverAvatarText, { color: colors.primary }]}>KA</Text>
              </View>
              <View style={styles.flexOne}>
                <Text style={[styles.driverName, { color: colors.foreground }]}>{ride.driverName}</Text>
                <View style={styles.driverMeta}>
                  <Ionicons name="star" size={14} color={colors.accent} />
                  <Text style={[styles.driverRating, { color: colors.mutedForeground }]}>4.8 · {ride.vehicle}</Text>
                </View>
                <Text style={[styles.plateText, { color: colors.primary }]}>{ride.plate}</Text>
              </View>
              <View style={styles.driverActions}>
                <IconButton name="call-outline" onPress={() => {}} colors={colors} testID="call-driver" />
                <IconButton name="chatbubble-outline" onPress={() => {}} colors={colors} testID="message-driver" />
              </View>
            </View>
          )}
          <View style={[styles.fareCard, { backgroundColor: colors.primary }]}>
            <View>
              <Text style={[styles.fareCardLabel, { color: 'rgba(255,253,246,0.66)' }]}>ESTIMATED FARE</Text>
              <Text style={[styles.fareCardValue, { color: colors.primaryForeground }]}>{money(ride.fare)}</Text>
            </View>
            <View style={styles.fareCardRight}>
              <Text style={[styles.fareCardLabel, { color: 'rgba(255,253,246,0.66)' }]}>DISTANCE</Text>
              <Text style={[styles.fareCardDistance, { color: colors.primaryForeground }]}>{ride.distance}</Text>
            </View>
          </View>
          {isActive ? (
            <Pressable
              testID="cancel-ride"
              onPress={() => {
                haptic();
                cancelRide();
              }}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { color: colors.destructive }]}>Cancel ride</Text>
            </Pressable>
          ) : (
            <View style={[styles.completeNotice, { backgroundColor: colors.secondary }]}>
              <Ionicons name="checkmark-circle" size={21} color={colors.success} />
              <Text style={[styles.completeNoticeText, { color: colors.primary }]}>Thanks for choosing Smart Transport Ghana.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DriverHome({
  user,
  ride,
  onLogout,
}: {
  user: DemoUser;
  ride: Ride | null;
  onLogout: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateRideStatus } = useTransport();
  const [online, setOnline] = useState(true);
  const currentRide = ride && ride.status !== 'cancelled' ? ride : null;
  const nextAction: Partial<Record<RideStatus, { label: string; status: RideStatus }>> = {
    requested: { label: 'Accept passenger', status: 'accepted' },
    accepted: { label: 'I’m at pickup', status: 'arriving' },
    arriving: { label: 'Start trip', status: 'in_progress' },
    in_progress: { label: 'Complete trip', status: 'completed' },
  };
  const action = currentRide ? nextAction[currentRide.status] : undefined;
  const isCompleted = currentRide?.status === 'completed';

  const toggleOnline = () => {
    haptic();
    setOnline((value) => !value);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 18), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 30) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pagePadding}>
          <TopBar user={user} onLogout={onLogout} colors={colors} />
          <View style={styles.greetingRow}>
            <View>
              <Text style={[styles.screenEyebrow, { color: colors.primary }]}>DRIVER MODE</Text>
              <Text style={[styles.greeting, { color: colors.foreground }]}>Good afternoon, Kojo</Text>
            </View>
            <View style={[styles.onlineToggle, { backgroundColor: online ? colors.secondary : colors.muted }]}>
              <View style={[styles.statusDot, { backgroundColor: online ? colors.success : colors.mutedForeground }]} />
              <Text style={[styles.onlineText, { color: online ? colors.primary : colors.mutedForeground }]}>
                {online ? 'Online' : 'Offline'}
              </Text>
              <Switch
                testID="driver-online-toggle"
                value={online}
                onValueChange={toggleOnline}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.card}
                accessibilityLabel="Toggle driver online status"
              />
            </View>
          </View>
          <LinearGradient
            colors={[colors.primary, colors.navy]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.earningsCard}
          >
            <View style={styles.earningsHeading}>
              <View>
                <Text style={[styles.earningsLabel, { color: 'rgba(255,253,246,0.68)' }]}>TODAY’S EARNINGS</Text>
                <Text style={[styles.earningsValue, { color: colors.primaryForeground }]}>GH₵ 186.50</Text>
              </View>
              <View style={[styles.earningsIcon, { backgroundColor: 'rgba(246,183,60,0.16)' }]}>
                <Ionicons name="trending-up" size={23} color={colors.accent} />
              </View>
            </View>
            <View style={styles.earningsStats}>
              <View>
                <Text style={[styles.statValue, { color: colors.primaryForeground }]}>8</Text>
                <Text style={[styles.statLabel, { color: 'rgba(255,253,246,0.60)' }]}>Trips</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: 'rgba(255,253,246,0.16)' }]} />
              <View>
                <Text style={[styles.statValue, { color: colors.primaryForeground }]}>4.8</Text>
                <Text style={[styles.statLabel, { color: 'rgba(255,253,246,0.60)' }]}>Rating</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: 'rgba(255,253,246,0.16)' }]} />
              <View>
                <Text style={[styles.statValue, { color: colors.primaryForeground }]}>5h 20m</Text>
                <Text style={[styles.statLabel, { color: 'rgba(255,253,246,0.60)' }]}>Online time</Text>
              </View>
            </View>
          </LinearGradient>
          <SectionTitle title="Ride requests" action={online ? 'Live now' : 'Go online to receive trips'} colors={colors} />
          {!online ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                <Ionicons name="moon-outline" size={23} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>You’re currently offline</Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Turn on availability when you’re ready to receive passenger requests.</Text>
            </View>
          ) : currentRide && !isCompleted && action ? (
            <View style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.requestHeader}>
                <View style={[styles.requestAvatar, { backgroundColor: colors.sand }]}>
                  <Text style={[styles.requestAvatarText, { color: colors.primary }]}>AM</Text>
                </View>
                <View style={styles.flexOne}>
                  <Text style={[styles.requestTitle, { color: colors.foreground }]}>
                    {currentRide.status === 'requested' ? 'New ride request' : 'Active trip'}
                  </Text>
                  <View style={styles.requestMeta}>
                    <Ionicons name="star" size={14} color={colors.accent} />
                    <Text style={[styles.cardSubtle, { color: colors.mutedForeground }]}>Ama Mensah · Passenger</Text>
                  </View>
                </View>
                <Text style={[styles.requestFare, { color: colors.foreground }]}>{money(currentRide.fare)}</Text>
              </View>
              <View style={[styles.requestRoute, { backgroundColor: colors.muted }]}>
                <View style={styles.driverRouteLine}>
                  <View style={[styles.driverRouteDot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.driverRouteConnector, { backgroundColor: colors.border }]} />
                  <View style={[styles.driverRouteDot, { backgroundColor: colors.accent }]} />
                </View>
                <View style={styles.flexOne}>
                  <Text style={[styles.requestRouteLabel, { color: colors.mutedForeground }]}>PICKUP</Text>
                  <Text style={[styles.requestRouteValue, { color: colors.foreground }]}>{currentRide.pickup}</Text>
                  <Text style={[styles.requestRouteLabel, { color: colors.mutedForeground, marginTop: 11 }]}>DROPOFF</Text>
                  <Text style={[styles.requestRouteValue, { color: colors.foreground }]}>{currentRide.destination}</Text>
                </View>
              </View>
              <PrimaryButton
                label={action.label}
                iconName={currentRide.status === 'requested' ? 'checkmark' : 'arrow-forward'}
                onPress={() => updateRideStatus(action.status)}
                colors={colors}
                testID={`driver-action-${action.status}`}
              />
            </View>
          ) : isCompleted ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
                <Ionicons name="checkmark-circle-outline" size={23} color={colors.success} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Trip complete</Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>You earned {money(currentRide.fare)} on this ride.</Text>
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="radio-outline" size={23} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Waiting for requests</Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Passenger requests from the demo view will appear here.</Text>
            </View>
          )}
          <SectionTitle title="Vehicle details" colors={colors} />
          <View style={[styles.vehicleSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.vehicleSummaryIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="car-sport-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.flexOne}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Toyota Corolla</Text>
              <Text style={[styles.cardSubtle, { color: colors.mutedForeground }]}>White · {user.plate}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </View>
          <View style={[styles.driverTip, { backgroundColor: colors.sand }]}>
            <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            <Text style={[styles.driverTipText, { color: colors.foreground }]}>Keep your acceptance rate high to unlock more busy-area requests.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const { user, ride, isLoading, logout } = useTransport();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) return <LoginScreen />;

  if (user.role === 'driver') {
    return <DriverHome user={user} ride={ride} onLogout={logout} />;
  }

  if (ride && ride.status !== 'cancelled' && ride.status !== 'completed') {
    return <PassengerTracking user={user} ride={ride} onLogout={logout} />;
  }

  return <PassengerHome user={user} ride={ride} onLogout={logout} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pagePadding: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  brandLocation: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  iconButton: { width: 39, height: 39, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  greetingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
  screenEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  greeting: { fontSize: 25, fontWeight: '700', letterSpacing: -0.8 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, marginTop: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  map: { height: 214, borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 14 },
  mapGrid: { ...StyleSheet.absoluteFillObject, opacity: 0.8, borderWidth: 1, borderRadius: 24 },
  mapRoad: { position: 'absolute', height: 2, borderRadius: 2 },
  mapRoadOne: { width: '120%', left: -20, top: 73, transform: [{ rotate: '-18deg' }] },
  mapRoadTwo: { width: '115%', left: -5, top: 152, transform: [{ rotate: '27deg' }] },
  mapRoadThree: { width: '100%', left: 15, top: 116, transform: [{ rotate: '74deg' }] },
  routeLine: { position: 'absolute', width: 162, height: 3, left: 83, top: 116, transform: [{ rotate: '-27deg' }], borderRadius: 4 },
  mapPin: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 15, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  pickupPin: { left: 54, top: 143 },
  destinationPin: { right: 46, top: 66 },
  pinDot: { width: 10, height: 10, borderRadius: 5 },
  mapCar: { position: 'absolute', left: 134, top: 104, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  currentLocation: { position: 'absolute', left: '48%', top: '43%', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  currentLocationDot: { width: 10, height: 10, borderRadius: 5 },
  mapLabel: { position: 'absolute', left: 14, bottom: 13, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  mapLabelText: { fontSize: 11, fontWeight: '600' },
  destinationSearch: { minHeight: 70, borderRadius: 19, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1, marginBottom: 26 },
  searchIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  searchCopy: { flex: 1 },
  searchTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  searchSubtitle: { fontSize: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  sectionAction: { fontSize: 11, fontWeight: '700' },
  shortcutRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 27 },
  shortcut: { alignItems: 'center', width: '31%', gap: 8 },
  shortcutIcon: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontSize: 12, fontWeight: '600' },
  trustBanner: { borderRadius: 22, padding: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  trustCopy: { flex: 1 },
  trustTitle: { fontSize: 15, fontWeight: '700', marginBottom: 5 },
  trustBody: { fontSize: 12, lineHeight: 18 },
  lastTripCard: { borderRadius: 20, borderWidth: 1, padding: 15, marginBottom: 22 },
  lastTripHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lastTripIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSubtle: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  fareText: { fontSize: 14, fontWeight: '800' },
  lastTripNote: { fontSize: 12, marginTop: 12, marginLeft: 45 },
  noticeCard: { borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  bookingOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 5 },
  bookingHeader: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 15 },
  closeButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  bookingEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 4 },
  bookingTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  inputLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginBottom: 8 },
  locationField: { minHeight: 52, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationDot: { width: 10, height: 10, borderRadius: 5 },
  locationText: { flex: 1, fontSize: 14, fontWeight: '600' },
  destinationList: { gap: 9 },
  destinationOption: { minHeight: 67, borderWidth: 1, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 11 },
  destinationIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  destinationName: { fontSize: 13, fontWeight: '700' },
  destinationDetail: { fontSize: 11, marginTop: 3 },
  vehicleOption: { minHeight: 74, borderWidth: 1, borderRadius: 17, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 9 },
  vehicleIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  vehicleName: { fontSize: 14, fontWeight: '700' },
  vehicleDetail: { fontSize: 11, marginTop: 3 },
  vehicleFare: { fontSize: 13, fontWeight: '800' },
  fareSummary: { borderTopWidth: 1, paddingTop: 15, marginTop: 5, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareSummaryLabel: { fontSize: 13, fontWeight: '600' },
  fareSummaryValue: { fontSize: 20, fontWeight: '800' },
  primaryButton: { minHeight: 55, borderRadius: 17, paddingHorizontal: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryButtonText: { fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  trackingHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 },
  etaBadge: { borderRadius: 16, minWidth: 58, paddingVertical: 8, alignItems: 'center' },
  etaValue: { fontSize: 16, fontWeight: '800' },
  etaLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginTop: 2 },
  tripRouteCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 13 },
  routeRow: { flexDirection: 'row', gap: 14 },
  routeRail: { width: 12, alignItems: 'center', paddingTop: 4 },
  routeCircle: { width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
  routeDash: { width: 2, height: 34, marginVertical: 4 },
  routeCopy: { flex: 1 },
  routeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginBottom: 4 },
  routeValue: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  routeGap: { height: 18 },
  progressTrack: { height: 5, borderRadius: 3, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  searchingCard: { borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 13 },
  driverCard: { borderRadius: 20, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 13 },
  driverAvatar: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  driverAvatarText: { fontSize: 14, fontWeight: '800' },
  driverName: { fontSize: 14, fontWeight: '800' },
  driverMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  driverRating: { fontSize: 11 },
  plateText: { fontSize: 11, fontWeight: '800', marginTop: 5, letterSpacing: 0.5 },
  driverActions: { flexDirection: 'row', gap: 7 },
  fareCard: { borderRadius: 20, padding: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  fareCardLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  fareCardValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  fareCardRight: { alignItems: 'flex-end' },
  fareCardDistance: { fontSize: 14, fontWeight: '700', marginTop: 5 },
  cancelButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontSize: 13, fontWeight: '700' },
  completeNotice: { minHeight: 50, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  completeNoticeText: { fontSize: 12, fontWeight: '700' },
  onlineToggle: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingLeft: 9, paddingRight: 3, paddingVertical: 2 },
  onlineText: { fontSize: 11, fontWeight: '800' },
  earningsCard: { borderRadius: 23, padding: 19, marginBottom: 26 },
  earningsHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningsLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  earningsValue: { fontSize: 29, fontWeight: '800', letterSpacing: -1, marginTop: 5 },
  earningsIcon: { width: 45, height: 45, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  earningsStats: { flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  statValue: { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 4 },
  statDivider: { width: 1, height: 27, marginHorizontal: 23 },
  requestCard: { borderRadius: 21, borderWidth: 1, padding: 14, marginBottom: 26 },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  requestAvatar: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  requestAvatarText: { fontSize: 13, fontWeight: '800' },
  requestTitle: { fontSize: 14, fontWeight: '800' },
  requestMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  requestFare: { fontSize: 15, fontWeight: '800' },
  requestRoute: { borderRadius: 15, padding: 13, flexDirection: 'row', gap: 12, marginBottom: 13 },
  driverRouteLine: { width: 10, alignItems: 'center', paddingTop: 5 },
  driverRouteDot: { width: 9, height: 9, borderRadius: 5 },
  driverRouteConnector: { width: 2, height: 30, marginVertical: 4 },
  requestRouteLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginBottom: 3 },
  requestRouteValue: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  vehicleSummary: { borderRadius: 18, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 15 },
  vehicleSummaryIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  driverTip: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  driverTipText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  emptyCard: { borderRadius: 20, borderWidth: 1, padding: 22, alignItems: 'center', marginBottom: 26 },
  emptyIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '800', marginBottom: 5 },
  emptyBody: { fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 280 },
  flexOne: { flex: 1 },
  loginHero: { minHeight: 280, paddingHorizontal: 26, paddingBottom: 34, justifyContent: 'flex-end', overflow: 'hidden' },
  loginHeroGlow: { width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(246,183,60,0.10)', position: 'absolute', right: -62, top: 60 },
  loginTitle: { fontSize: 34, lineHeight: 39, fontWeight: '800', letterSpacing: -1.1, marginTop: 24, maxWidth: 290 },
  loginSubtitle: { fontSize: 14, lineHeight: 21, marginTop: 9, maxWidth: 280 },
  loginContent: { flex: 1 },
  loginIntro: { paddingHorizontal: 22, paddingTop: 26, paddingBottom: 18 },
  loginFormTitle: { fontSize: 23, fontWeight: '700', letterSpacing: -0.6 },
  roleToggle: { marginHorizontal: 22, padding: 4, borderRadius: 16, flexDirection: 'row', marginBottom: 22 },
  roleOption: { flex: 1, minHeight: 42, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  roleOptionText: { fontSize: 12, fontWeight: '700' },
  formGroup: { marginHorizontal: 22, marginBottom: 14 },
  inputShell: { minHeight: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, minHeight: 52, fontSize: 14 },
  errorBox: { marginHorizontal: 22, padding: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  errorText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  demoCard: { marginHorizontal: 22, borderRadius: 20, padding: 15, marginTop: 22 },
  demoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  demoIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  demoCardCopy: { flex: 1 },
  demoTitle: { fontSize: 13, fontWeight: '800' },
  demoBody: { fontSize: 11, marginTop: 3 },
  demoButtons: { flexDirection: 'row', gap: 8, marginTop: 13 },
  demoButton: { flex: 1, minHeight: 36, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  demoButtonText: { fontSize: 11, fontWeight: '800' },
  demoCredentials: { fontSize: 10, marginTop: 11, textAlign: 'center', letterSpacing: 0.1 },
});