import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ProductForm } from '../../_components/ProductForm'
import { ProductImagesManager } from '../../_components/ProductImagesManager'
import { VariantManager } from '../../_components/VariantManager'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function EditProductPage({ params }: PageProps) {
  const [product, categories, attributeTypes] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          include: {
            attributes: { include: { attributeType: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.attributeType.findMany({
      include: { values: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Məhsulu redaktə et
        </h2>
        <p className="text-[var(--color-muted)]">{product.name}</p>
      </div>

      <ProductForm
        mode="edit"
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          shortDesc: product.shortDesc,
          categoryId: product.categoryId,
          basePrice: product.basePrice.toString(),
          salePrice: product.salePrice?.toString() ?? null,
          costPrice: product.costPrice?.toString() ?? null,
          weight: product.weight,
          material: product.material,
          metaTitle: product.metaTitle,
          metaDesc: product.metaDesc,
          tags: product.tags,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          hasVariants: product.hasVariants,
          images: [],
        }}
      />

      <ProductImagesManager
        productId={product.id}
        images={product.images.map((i) => ({
          id: i.id,
          url: i.url,
          key: i.key,
          altText: i.altText,
          isPrimary: i.isPrimary,
          sortOrder: i.sortOrder,
        }))}
      />

      <VariantManager
        productId={product.id}
        productSku={product.sku}
        attributeTypes={attributeTypes.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          displayType: t.displayType,
          values: t.values.map((v) => ({
            id: v.id,
            value: v.value,
            colorCode: v.colorCode,
          })),
        }))}
        variants={product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: v.price?.toString() ?? null,
          salePrice: v.salePrice?.toString() ?? null,
          stock: v.stock,
          isActive: v.isActive,
          attributes: v.attributes.map((a) => ({
            id: a.id,
            value: a.value,
            attributeType: { name: a.attributeType.name, slug: a.attributeType.slug },
          })),
        }))}
      />
    </div>
  )
}
