"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

interface PaymentMethod {
  id: string
  type: "card" | "qr" | "saldo"
  name: string
  last4?: string
  brand?: string
  balance?: number
  isDefault: boolean
}

interface PaymentMethodsModalProps {
  visible: boolean
  onClose: () => void
}

const MOCK_METHODS: PaymentMethod[] = [
  { id: "1", type: "saldo", name: "Saldo Turuta", balance: 45.5, isDefault: true },
  { id: "2", type: "card", name: "Visa", last4: "4532", brand: "visa", isDefault: false },
  { id: "3", type: "qr", name: "QR Simple", isDefault: false },
]

export function PaymentMethodsModal({ visible, onClose }: PaymentMethodsModalProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>(MOCK_METHODS)
  const [showAddCard, setShowAddCard] = useState(false)
  const [showRecharge, setShowRecharge] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [rechargeAmount, setRechargeAmount] = useState("")

  const getMethodIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "card":
        return "card"
      case "qr":
        return "qr-code"
      case "saldo":
        return "wallet"
      default:
        return "card"
    }
  }

  const handleSetDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })))
  }

  const handleDeleteMethod = (id: string) => {
    Alert.alert("Eliminar metodo", "Estas seguro de eliminar este metodo de pago?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setMethods((prev) => prev.filter((m) => m.id !== id))
        },
      },
    ])
  }

  const handleAddCard = () => {
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      Alert.alert("Error", "Completa todos los campos")
      return
    }
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: "card",
      name: "Nueva Tarjeta",
      last4: cardNumber.slice(-4),
      brand: "visa",
      isDefault: false,
    }
    setMethods((prev) => [...prev, newCard])
    setShowAddCard(false)
    setCardNumber("")
    setCardName("")
    setCardExpiry("")
    setCardCvv("")
    Alert.alert("Exito", "Tarjeta agregada correctamente")
  }

  const handleRecharge = () => {
    const amount = Number.parseFloat(rechargeAmount)
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Ingresa un monto valido")
      return
    }
    setMethods((prev) => prev.map((m) => (m.type === "saldo" ? { ...m, balance: (m.balance || 0) + amount } : m)))
    setShowRecharge(false)
    setRechargeAmount("")
    Alert.alert("Exito", `Se recargaron Bs. ${amount.toFixed(2)} a tu saldo`)
  }

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "")
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned
    setCardNumber(formatted.slice(0, 19))
  }

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`)
    } else {
      setCardExpiry(cleaned)
    }
  }

  const saldoMethod = methods.find((m) => m.type === "saldo")

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Metodos de Pago</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Saldo Turuta */}
            {saldoMethod && (
              <View style={styles.saldoCard}>
                <View style={styles.saldoHeader}>
                  <View style={styles.saldoIcon}>
                    <Ionicons name="wallet" size={28} color={COLORS.white} />
                  </View>
                  <View>
                    <Text style={styles.saldoLabel}>Saldo disponible</Text>
                    <Text style={styles.saldoAmount}>Bs. {saldoMethod.balance?.toFixed(2)}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.rechargeBtn} onPress={() => setShowRecharge(true)}>
                  <Ionicons name="add-circle" size={20} color={COLORS.white} />
                  <Text style={styles.rechargeBtnText}>Recargar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Lista de metodos */}
            <Text style={styles.sectionTitle}>Tus metodos de pago</Text>
            {methods
              .filter((m) => m.type !== "saldo")
              .map((method) => (
                <View key={method.id} style={styles.methodCard}>
                  <View style={styles.methodIcon}>
                    <Ionicons name={getMethodIcon(method.type)} size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>
                      {method.type === "card" ? `${method.name} ****${method.last4}` : method.name}
                    </Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Predeterminado</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity onPress={() => handleSetDefault(method.id)} style={styles.actionBtn}>
                        <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteMethod(method.id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={22} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

            {/* Agregar tarjeta */}
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddCard(true)}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.addBtnText}>Agregar tarjeta</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Modal agregar tarjeta */}
          <Modal visible={showAddCard} animationType="fade" transparent>
            <View style={styles.innerOverlay}>
              <View style={styles.innerModal}>
                <Text style={styles.innerTitle}>Agregar Tarjeta</Text>

                <View style={styles.cardPreview}>
                  <View style={styles.cardChip} />
                  <Text style={styles.cardPreviewNumber}>{cardNumber || "**** **** **** ****"}</Text>
                  <View style={styles.cardPreviewRow}>
                    <Text style={styles.cardPreviewName}>{cardName || "NOMBRE"}</Text>
                    <Text style={styles.cardPreviewExpiry}>{cardExpiry || "MM/AA"}</Text>
                  </View>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Numero de tarjeta"
                  value={cardNumber}
                  onChangeText={formatCardNumber}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre en la tarjeta"
                  value={cardName}
                  onChangeText={setCardName}
                  autoCapitalize="characters"
                />
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChangeText={formatExpiry}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="CVV"
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>

                <View style={styles.innerBtns}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddCard(false)}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleAddCard}>
                    <Text style={styles.confirmBtnText}>Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal recargar saldo */}
          <Modal visible={showRecharge} animationType="fade" transparent>
            <View style={styles.innerOverlay}>
              <View style={styles.innerModal}>
                <Text style={styles.innerTitle}>Recargar Saldo</Text>
                <Text style={styles.innerSubtitle}>Saldo actual: Bs. {saldoMethod?.balance?.toFixed(2)}</Text>

                <View style={styles.quickAmounts}>
                  {[10, 20, 50, 100].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[styles.quickBtn, rechargeAmount === String(amount) && styles.quickBtnActive]}
                      onPress={() => setRechargeAmount(String(amount))}
                    >
                      <Text
                        style={[styles.quickBtnText, rechargeAmount === String(amount) && styles.quickBtnTextActive]}
                      >
                        Bs. {amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Otro monto"
                  value={rechargeAmount}
                  onChangeText={setRechargeAmount}
                  keyboardType="numeric"
                />

                <View style={styles.innerBtns}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRecharge(false)}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleRecharge}>
                    <Text style={styles.confirmBtnText}>Recargar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "90%",
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  saldoCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  saldoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  saldoIcon: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  saldoLabel: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
  },
  saldoAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    color: COLORS.white,
  },
  rechargeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  rechargeBtnText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  methodName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  defaultBadge: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  defaultText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: "500",
  },
  methodActions: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  actionBtn: {
    padding: SPACING.xs,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    margin: SPACING.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  addBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.primary,
  },
  innerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  innerModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: "100%",
    maxWidth: 400,
  },
  innerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  innerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  cardPreview: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    height: 180,
    justifyContent: "space-between",
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: "#D4AF37",
    borderRadius: 4,
  },
  cardPreviewNumber: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  cardPreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardPreviewName: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
  },
  cardPreviewExpiry: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.sm,
  },
  inputRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  inputHalf: {
    flex: 1,
  },
  quickAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickBtn: {
    flex: 1,
    minWidth: "45%",
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  quickBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  quickBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  quickBtnTextActive: {
    color: COLORS.primary,
  },
  innerBtns: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.white,
  },
})
