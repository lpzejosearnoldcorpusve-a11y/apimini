"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface FAQ {
  question: string
  answer: string
}

interface HelpModalProps {
  visible: boolean
  onClose: () => void
}

const FAQS: FAQ[] = [
  {
    question: "Como puedo recargar mi saldo?",
    answer:
      "Puedes recargar tu saldo desde la seccion 'Metodos de pago' en tu perfil. Acepta tarjetas de debito/credito y QR Simple.",
  },
  {
    question: "Que hago si olvide mi contrasena?",
    answer:
      "En la pantalla de inicio de sesion, presiona 'Olvide mi contrasena' e ingresa tu numero de carnet de identidad para recuperarla.",
  },
  {
    question: "Como funciona el sistema de tarifas?",
    answer:
      "Las tarifas varian segun el tipo de transporte. Minibus: Bs. 2.00-2.50, Teleferico: Bs. 3.00. Los estudiantes y adultos mayores tienen descuentos.",
  },
  {
    question: "Puedo usar la app sin internet?",
    answer:
      "Algunas funciones como ver rutas guardadas funcionan sin internet, pero para ubicacion en tiempo real y pagos necesitas conexion.",
  },
  {
    question: "Como reporto un problema con un minibus?",
    answer:
      "Desde el historial de viajes, selecciona el viaje y presiona 'Reportar problema'. Tu reporte sera enviado a las autoridades.",
  },
  {
    question: "Que es el saldo Turuta?",
    answer: "Es tu billetera virtual dentro de la app. Puedes usarla para pagar viajes de forma rapida sin efectivo.",
  },
]

const CONTACT_OPTIONS = [
  { icon: "call-outline", label: "Linea de ayuda", value: "800-10-1234", type: "phone" },
  { icon: "mail-outline", label: "Correo", value: "soporte@turuta.gob.bo", type: "email" },
  { icon: "logo-whatsapp", label: "WhatsApp", value: "+591 70000000", type: "whatsapp" },
  { icon: "location-outline", label: "Oficina", value: "Av. Mariscal Santa Cruz, La Paz", type: "address" },
]

export function HelpModal({ visible, onClose }: HelpModalProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleContact = (type: string, value: string) => {
    switch (type) {
      case "phone":
        Linking.openURL(`tel:${value.replace(/-/g, "")}`)
        break
      case "email":
        Linking.openURL(`mailto:${value}`)
        break
      case "whatsapp":
        Linking.openURL(`https://wa.me/${value.replace(/[^0-9]/g, "")}`)
        break
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Centro de Ayuda</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Banner */}
            <View style={styles.banner}>
              <Ionicons name="help-buoy" size={40} color={COLORS.white} />
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Estamos para ayudarte</Text>
                <Text style={styles.bannerText}>Encuentra respuestas rapidas o contactanos directamente</Text>
              </View>
            </View>

            {/* FAQs */}
            <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>
            <View style={styles.faqList}>
              {FAQS.map((faq, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.faqItem}
                  onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Ionicons
                      name={expandedFaq === index ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </View>
                  {expandedFaq === index && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Contacto */}
            <Text style={styles.sectionTitle}>Contactanos</Text>
            <View style={styles.contactList}>
              {CONTACT_OPTIONS.map((contact, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.contactItem}
                  onPress={() => handleContact(contact.type, contact.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIcon}>
                    <Ionicons name={contact.icon as any} size={22} color={COLORS.primary} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>{contact.label}</Text>
                    <Text style={styles.contactValue}>{contact.value}</Text>
                  </View>
                  {contact.type !== "address" && <Ionicons name="open-outline" size={18} color={COLORS.textLight} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Horario */}
            <View style={styles.scheduleCard}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary} />
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>Horario de atencion</Text>
                <Text style={styles.scheduleText}>Lunes a Viernes: 8:00 - 20:00</Text>
                <Text style={styles.scheduleText}>Sabados: 9:00 - 14:00</Text>
                <Text style={styles.scheduleText}>Domingos y feriados: Cerrado</Text>
              </View>
            </View>

            {/* Links legales */}
            <View style={styles.legalLinks}>
              <TouchableOpacity style={styles.legalLink}>
                <Ionicons name="document-text-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.legalLinkText}>Terminos y condiciones</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.legalLink}>
                <Ionicons name="shield-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.legalLinkText}>Politica de privacidad</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.legalLink}>
                <Ionicons name="information-circle-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.legalLinkText}>Acerca de Turuta</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Turuta es un servicio del Gobierno Autonomo Municipal de La Paz</Text>
              <View style={styles.footerLogos}>
                <View style={styles.logo}>
                  <Text style={styles.logoText}>GAMLP</Text>
                </View>
              </View>
            </View>
          </ScrollView>
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
  content: {
    padding: SPACING.lg,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.white,
  },
  bannerText: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  faqList: {
    marginBottom: SPACING.xl,
  },
  faqItem: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    lineHeight: 20,
  },
  contactList: {
    marginBottom: SPACING.xl,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  contactValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: COLORS.primary + "10",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  scheduleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  legalLinks: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  legalLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  legalLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: "center",
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  footerLogos: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  logo: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary + "15",
    borderRadius: BORDER_RADIUS.sm,
  },
  logoText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.primary,
  },
})
