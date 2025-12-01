import { MapsScreen } from "@/components/screens/MapsScreen"
import { COLORS } from "@/constants/theme"
import { StyleSheet } from "react-native"

export default function Maps() {
  return <MapsScreen />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
})