import { COLORS, SHADOWS } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { StyleSheet, View } from "react-native"

type TabBarIconProps = {
  name: keyof typeof Ionicons.glyphMap
  color: string
  focused: boolean
}

function TabBarIcon({ name, color, focused }: TabBarIconProps) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Ionicons name={name} size={24} color={color} />
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          ...SHADOWS.lg,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="routes"
        options={{
          title: "Rutas",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="navigate-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="map-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="minibuses"
        options={{
          title: "Minibuses",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="bus-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="telefericos"
        options={{
          title: "Teleféricos",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="git-network-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="rates"
        options={{
          title: "Tarifas",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="cash-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="notifications-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="person-outline" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primaryLight + "30",
  },
})
