// Variant matrix məntiqi — atribut seçiminə görə uyğun variantı tap

import type { ProductVariant, AttributeValue, AttributeType } from '@prisma/client'

export type VariantWithAttributes = ProductVariant & {
  attributes: (AttributeValue & { attributeType: AttributeType })[]
}

export interface AttributeOption {
  id: string
  value: string
  colorCode: string | null
  imageUrl: string | null
}

export interface AttributeGroup {
  id: string
  name: string
  slug: string
  displayType: 'TEXT' | 'COLOR' | 'IMAGE' | 'BUTTON'
  options: AttributeOption[]
}

// Variantlardan unikal atribut qruplarını çıxart
export function getAttributeGroups(
  variants: VariantWithAttributes[]
): AttributeGroup[] {
  const groupsMap = new Map<string, AttributeGroup>()

  for (const variant of variants) {
    for (const attr of variant.attributes) {
      const typeId = attr.attributeType.id
      if (!groupsMap.has(typeId)) {
        groupsMap.set(typeId, {
          id: typeId,
          name: attr.attributeType.name,
          slug: attr.attributeType.slug,
          displayType: attr.attributeType.displayType,
          options: [],
        })
      }
      const group = groupsMap.get(typeId)!
      if (!group.options.some((o) => o.id === attr.id)) {
        group.options.push({
          id: attr.id,
          value: attr.value,
          colorCode: attr.colorCode,
          imageUrl: attr.imageUrl,
        })
      }
    }
  }

  return Array.from(groupsMap.values())
}

// Seçilmiş atributlara uyğun variantı tap
// selection: { attributeTypeId: attributeValueId }
export function findVariant(
  variants: VariantWithAttributes[],
  selection: Record<string, string>
): VariantWithAttributes | null {
  const selectedIds = Object.values(selection).filter(Boolean)
  if (selectedIds.length === 0) return null

  return (
    variants.find((v) => {
      if (v.attributes.length !== selectedIds.length) return false
      return selectedIds.every((id) => v.attributes.some((a) => a.id === id))
    }) ?? null
  )
}

// Verilmiş qismi seçimə uyğun mövcud variantları tap
// (məs. rəng seçilibsə, hansı ölçülər mövcuddur?)
export function getAvailableValueIds(
  variants: VariantWithAttributes[],
  selection: Record<string, string>
): Set<string> {
  const available = new Set<string>()
  const activeVariants = variants.filter((v) => v.isActive && v.stock > 0)

  for (const variant of activeVariants) {
    // Bu variant seçilmiş atributların hamısını ehtiva edirmi?
    const matchesSelection = Object.entries(selection)
      .filter(([, valueId]) => valueId)
      .every(([, valueId]) =>
        variant.attributes.some((a) => a.id === valueId)
      )
    if (matchesSelection) {
      for (const attr of variant.attributes) {
        available.add(attr.id)
      }
    }
  }

  return available
}

// Effektiv qiyməti hesabla (variantPrice ?? salePrice ?? basePrice)
export interface PricingProduct {
  basePrice: string
  salePrice: string | null
}

export interface PricingVariant {
  price: string | null
  salePrice: string | null
}

export function getEffectiveVariantPrice(
  product: PricingProduct,
  variant: PricingVariant | null
): { price: number; original: number | null } {
  const toNum = (v: string | null | undefined): number | null => {
    if (!v) return null
    const n = parseFloat(v)
    return isNaN(n) ? null : n
  }

  const base = toNum(product.basePrice) ?? 0
  const productSale = toNum(product.salePrice)
  const variantPrice = toNum(variant?.price ?? null)
  const variantSale = toNum(variant?.salePrice ?? null)

  // Effektiv qiymət — xırda detallar olmasın deyə CLAUDE.md qaydasına uyğun
  const effective = variantSale ?? variantPrice ?? productSale ?? base

  // Endirim varsa üstündən xətli qiymət
  let original: number | null = null
  if (variantSale && variantPrice) {
    original = variantPrice
  } else if (variantSale && !variantPrice) {
    original = base
  } else if (productSale && !variantPrice && !variantSale) {
    original = base
  }

  return { price: effective, original }
}
