// App.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  Bus,
  MapPin,
  CreditCard,
  Bell,
  User,
  Navigation,
  Cable,
  Phone,
  Calendar,
  IdCard,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';

const COLORS = {
  primary: '#00A99D',
  primaryDark: '#008B82',
  primaryLight: '#4DC4BB',
  secondary: '#00BFFF',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
};

// Icon wrapper component
const Icon = ({ component: LucideIcon, size = 24, color = '#000', style }: any) => (
  <LucideIcon size={size} color={color} style={style} />
);

export default function TurutaPreview() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const Card = ({ children, style, onPress }: any) => (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );

  const CardContent = ({ children, style }: any) => (
    <View style={[styles.cardContent, style]}>{children}</View>
  );

  const Button = ({ children, onPress, variant = 'default', style }: any) => (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'outline' ? styles.buttonOutline : styles.buttonPrimary,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'outline' ? styles.buttonOutlineText : styles.buttonPrimaryText,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );

  const Tabs = ({ children, value, onValueChange }: any) => {
    return React.Children.map(children, (child) =>
      React.cloneElement(child, { activeTab: value, onTabChange: onValueChange })
    );
  };

  const TabsList = ({ children, activeTab, onTabChange }: any) => (
    <View style={styles.tabsList}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isActive: child.props.value === activeTab,
          onPress: () => onTabChange(child.props.value),
        })
      )}
    </View>
  );

  const TabsTrigger = ({ children, isActive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.tabTrigger, isActive && styles.tabTriggerActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabTriggerText, isActive && styles.tabTriggerTextActive]}>
        {children}
      </Text>
    </TouchableOpacity>
  );

  const TabsContent = ({ children, value, activeTab }: any) => (
    <View style={value === activeTab ? styles.tabContentActive : styles.tabContentHidden}>
      {value === activeTab && children}
    </View>
  );

  if (isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        
        {/* Header */}
        <View style={[styles.header, styles.headerLoggedIn]}>
          <Text style={styles.greetingText}>¡Hola!</Text>
          <Text style={styles.title}>¿A dónde vas hoy?</Text>

          <View style={styles.searchContainer}>
            <Icon component={MapPin} size={20} color={COLORS.gray400} />
            <Text style={styles.searchPlaceholder}>Buscar destino...</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {[
              { icon: MapPin, label: 'Mi ubicación', color: COLORS.primary },
              { icon: Navigation, label: 'Casa', color: COLORS.secondary },
              { icon: Bus, label: 'Trabajo', color: '#FF6B35' },
            ].map((action, i) => (
              <Card key={i} style={styles.quickActionCard}>
                <CardContent style={styles.quickActionContent}>
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: `${action.color}20` },
                    ]}
                  >
                    <Icon component={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </CardContent>
              </Card>
            ))}
          </View>

          {/* Popular Routes */}
          <View style={styles.routesSection}>
            <Text style={styles.sectionTitle}>Rutas Populares</Text>
            {[
              { name: 'Centro - Zona Sur', time: '45 min', price: 'Bs. 3.50' },
              { name: 'El Alto - Miraflores', time: '35 min', price: 'Bs. 2.50' },
              { name: 'Sopocachi - San Miguel', time: '25 min', price: 'Bs. 2.00' },
            ].map((route, i) => (
              <Card key={i} style={styles.routeCard}>
                <CardContent style={styles.routeContent}>
                  <View
                    style={[
                      styles.routeIcon,
                      { backgroundColor: `${COLORS.primary}15` },
                    ]}
                  >
                    <Icon component={Navigation} size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{route.name}</Text>
                    <View style={styles.routeDetails}>
                      <Text style={styles.routeDetail}>{route.time}</Text>
                      <Text style={styles.routeDot}>•</Text>
                      <Text style={styles.routeDetail}>{route.price}</Text>
                    </View>
                  </View>
                  <Icon component={ChevronRight} size={20} color={COLORS.gray300} />
                </CardContent>
              </Card>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {[
            { icon: Navigation, label: 'Rutas', active: true },
            { icon: MapPin, label: 'Mapa' },
            { icon: Bus, label: 'Minibuses' },
            { icon: Cable, label: 'Teleféricos' },
            { icon: CreditCard, label: 'Tarifas' },
            { icon: Bell, label: 'Alertas' },
            { icon: User, label: 'Perfil' },
          ].map((tab, i) => (
            <TouchableOpacity
              key={i}
              style={styles.bottomNavItem}
              onPress={() => tab.label === 'Perfil' && setIsLoggedIn(false)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.bottomNavIcon,
                  tab.active && { backgroundColor: `${COLORS.primary}15` },
                ]}
              >
                <Icon
                  component={tab.icon}
                  size={20}
                  color={tab.active ? COLORS.primary : COLORS.gray400}
                />
              </View>
              <Text
                style={[
                  styles.bottomNavLabel,
                  { color: tab.active ? COLORS.primary : COLORS.gray400 },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={[styles.header, styles.headerAuth]}>
        <View style={styles.logoContainer}>
          <Icon component={Bus} size={40} color={COLORS.white} />
        </View>
        <Text style={styles.appTitle}>Turuta</Text>
        <Text style={styles.appSubtitle}>Tu transporte en La Paz</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Form Card */}
        <View style={styles.formContainer}>
          <View style={styles.card}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <View style={styles.tabContent}>
                  <Text style={styles.tabTitle}>Bienvenido de vuelta</Text>
                  <Text style={styles.tabDescription}>
                    Ingresa tus credenciales para continuar
                  </Text>

                  <View style={styles.form}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Carnet de Identidad</Text>
                      <View style={styles.inputContainer}>
                        <Icon
                          component={IdCard}
                          size={20}
                          color={COLORS.gray400}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Ingresa tu CI"
                          placeholderTextColor={COLORS.gray400}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Contraseña</Text>
                      <View style={styles.inputContainer}>
                        <Icon
                          component={Lock}
                          size={20}
                          color={COLORS.gray400}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[styles.input, styles.passwordInput]}
                          placeholder="Ingresa tu contraseña"
                          placeholderTextColor={COLORS.gray400}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Icon
                            component={showPassword ? EyeOff : Eye}
                            size={20}
                            color={COLORS.gray400}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>
                        ¿Olvidaste tu contraseña?
                      </Text>
                    </TouchableOpacity>

                    <Button onPress={() => setIsLoggedIn(true)}>
                      Iniciar Sesión
                    </Button>
                  </View>
                </View>
              </TabsContent>

              <TabsContent value="signup">
                <View style={styles.tabContent}>
                  {/* Step Indicator */}
                  <View style={styles.stepIndicator}>
                    {[0, 1, 2].map((s) => (
                      <View key={s} style={styles.stepContainer}>
                        <View
                          style={[
                            styles.stepCircle,
                            s <= step && { backgroundColor: COLORS.primary },
                            s === step && {
                              borderWidth: 3,
                              borderColor: COLORS.primaryLight,
                            },
                          ]}
                        >
                          {s < step ? (
                            <Icon
                              component={CheckCircle2}
                              size={16}
                              color={COLORS.white}
                            />
                          ) : (
                            <Text
                              style={[
                                styles.stepNumber,
                                s <= step && { color: COLORS.white },
                              ]}
                            >
                              {s + 1}
                            </Text>
                          )}
                        </View>
                        {s < 2 && (
                          <View
                            style={[
                              styles.stepLine,
                              s < step && { backgroundColor: COLORS.primary },
                            ]}
                          />
                        )}
                      </View>
                    ))}
                  </View>

                  <Text style={styles.stepTitle}>
                    {['Datos Personales', 'Información de Contacto', 'Seguridad'][step]}
                  </Text>

                  <View style={styles.form}>
                    {step === 0 && (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Nombres</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              component={User}
                              size={20}
                              color={COLORS.gray400}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Ej: Carlos Alberto"
                              placeholderTextColor={COLORS.gray400}
                            />
                          </View>
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Apellido Paterno</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              component={User}
                              size={20}
                              color={COLORS.gray400}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Ej: Gutiérrez"
                              placeholderTextColor={COLORS.gray400}
                            />
                          </View>
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Carnet de Identidad</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              component={IdCard}
                              size={20}
                              color={COLORS.gray400}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Ej: 9876543"
                              placeholderTextColor={COLORS.gray400}
                            />
                          </View>
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Fecha de Nacimiento</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              component={Calendar}
                              size={20}
                              color={COLORS.gray400}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="YYYY-MM-DD"
                              placeholderTextColor={COLORS.gray400}
                            />
                          </View>
                        </View>
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Ciudad</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              component={MapPin}
                              size={20}
                              color={COLORS.gray400}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Selecciona tu ciudad"
                              placeholderTextColor={COLORS.gray400}
                            />
                          </View>
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Complemento / Zona</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              component={Navigation}
                              size={20}
                              color={COLORS.gray400}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Ej: Z/Central"
                              placeholderTextColor={COLORS.gray400}
                            />
                          </View>
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Número de Celular</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              component={Phone}
                              size={20}
                              color={COLORS.gray400}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Ej: 77754321"
                              placeholderTextColor={COLORS.gray400}
                              keyboardType="phone-pad"
                            />
                          </View>
                        </View>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <View
                          style={[
                            styles.infoBanner,
                            { backgroundColor: `${COLORS.primaryLight}20` },
                          ]}
                        >
                          <Icon
                            component={CheckCircle2}
                            size={24}
                            color={COLORS.primary}
                          />
                          <Text
                            style={[styles.infoText, { color: COLORS.primaryDark }]}
                          >
                            Tu información está protegida con encriptación
                          </Text>
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Contraseña</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              component={Lock}
                              size={20}
                              color={COLORS.gray400}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Mínimo 6 caracteres"
                              placeholderTextColor={COLORS.gray400}
                              secureTextEntry
                            />
                          </View>
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Confirmar Contraseña</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              component={Lock}
                              size={20}
                              color={COLORS.gray400}
                              style={styles.inputIcon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Repite tu contraseña"
                              placeholderTextColor={COLORS.gray400}
                              secureTextEntry
                            />
                          </View>
                        </View>
                      </>
                    )}

                    <View style={styles.buttonGroup}>
                      {step > 0 && (
                        <Button
                          variant="outline"
                          style={styles.backButton}
                          onPress={() => setStep(step - 1)}
                        >
                          Atrás
                        </Button>
                      )}
                      <Button
                        style={step > 0 ? styles.nextButton : styles.fullButton}
                        onPress={() => {
                          if (step < 2) setStep(step + 1);
                          else setIsLoggedIn(true);
                        }}
                      >
                        {step === 2 ? 'Crear Cuenta' : 'Siguiente'}
                      </Button>
                    </View>
                  </View>
                </View>
              </TabsContent>
            </Tabs>
          </View>

          <Text style={styles.footerText}>
            Gobierno Autónomo Municipal de La Paz
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollView: {
    flex: 1,
  },
  // Header Styles
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerLoggedIn: {
    backgroundColor: COLORS.primary,
    paddingBottom: 32,
    paddingTop: 48,
  },
  headerAuth: {
    backgroundColor: COLORS.primary,
    paddingBottom: 48,
    paddingTop: 64,
    alignItems: 'center',
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: {
    color: COLORS.gray400,
    fontSize: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  appSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 8,
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: -8,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionContent: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  // Routes Section
  routesSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 16,
  },
  routeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  routeContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  routeDetail: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  routeDot: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bottomNavIcon: {
    padding: 8,
    borderRadius: 20,
  },
  bottomNavLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Form Styles
  formContainer: {
    paddingHorizontal: 24,
    marginTop: -24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  // Tabs Styles
  tabsList: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: 4,
    margin: 16,
  },
  tabTrigger: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabTriggerActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabTriggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  tabTriggerTextActive: {
    color: COLORS.gray900,
  },
  tabContentActive: {
    display: 'flex',
  },
  tabContentHidden: {
    display: 'none',
  },
  tabContent: {
    padding: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: 4,
  },
  tabDescription: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 16,
  },
  // Form Styles
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.gray900,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    padding: 12,
    position: 'absolute',
    right: 0,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  // Button Styles
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPrimaryText: {
    color: COLORS.white,
  },
  buttonOutlineText: {
    color: COLORS.gray700,
  },
  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 4,
  },
  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  // Button Group
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  fullButton: {
    width: '100%',
  },
  // Footer
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.gray400,
    marginTop: 24,
    marginBottom: 16,
  },
});