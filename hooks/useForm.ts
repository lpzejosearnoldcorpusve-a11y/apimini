"use client"

import { useCallback, useState } from "react"

interface ValidationRules {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

interface FieldConfig {
  [key: string]: ValidationRules
}

export function useForm<T extends Record<string, string>>(initialValues: T, validationRules?: FieldConfig) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = useCallback(
    (field: keyof T, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [errors],
  )

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  const validateField = useCallback(
    (field: keyof T, value: string): string | null => {
      const rules = validationRules?.[field as string]
      if (!rules) return null

      if (rules.required && !value.trim()) {
        return "Este campo es requerido"
      }
      if (rules.minLength && value.length < rules.minLength) {
        return `Mínimo ${rules.minLength} caracteres`
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Máximo ${rules.maxLength} caracteres`
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return "Formato inválido"
      }
      if (rules.custom) {
        return rules.custom(value)
      }
      return null
    },
    [validationRules],
  )

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.keys(values).forEach((field) => {
      const error = validateField(field as keyof T, values[field as keyof T])
      if (error) {
        newErrors[field as keyof T] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validateField])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0,
  }
}
