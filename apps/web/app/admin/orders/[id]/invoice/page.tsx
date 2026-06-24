import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { PrintButton } from './PrintButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

const dateFmt = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export default async function InvoicePage({ params }: PageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: true, address: true, items: true },
  })

  if (!order) notFound()

  const customerName = order.user?.name ?? order.guestName ?? 'Qonaq'
  const customerEmail = order.user?.email ?? order.guestEmail ?? ''
  const customerPhone = order.guestPhone ?? order.address?.phone ?? ''

  return (
    <div className="mx-auto max-w-3xl p-8 print:p-6">
      <div className="mb-6 flex items-center justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="border border-gray-200 p-8 print:border-0 print:p-0">
        {/* Şirkət başlığı */}
        <div className="flex items-start justify-between border-b-2 border-[#1565C0] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1565C0]">Nline Global</h1>
            <p className="mt-1 text-sm text-gray-600">
              Mebel və xırda detallar
            </p>
            <p className="mt-1 text-xs text-gray-500">info@nlineglobal.az</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">FAKTURA</h2>
            <p className="mt-1 text-sm text-gray-700">
              № {order.orderNumber.slice(0, 12).toUpperCase()}
            </p>
            <p className="text-sm text-gray-600">
              {dateFmt.format(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Müştəri / çatdırılma */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Müştəri
            </h3>
            <p className="mt-2 font-medium text-gray-900">{customerName}</p>
            {customerEmail && (
              <p className="text-sm text-gray-700">{customerEmail}</p>
            )}
            {customerPhone && (
              <p className="text-sm text-gray-700">{customerPhone}</p>
            )}
          </div>
          {order.address && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Çatdırılma
              </h3>
              <p className="mt-2 text-sm text-gray-900">
                {order.address.fullName}
              </p>
              <p className="text-sm text-gray-700">{order.address.street}</p>
              <p className="text-sm text-gray-700">
                {order.address.district}, {order.address.city}
                {order.address.zipCode && `, ${order.address.zipCode}`}
              </p>
            </div>
          )}
        </div>

        {/* Məhsullar */}
        <table className="mt-8 w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-3 py-2">Məhsul</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2 text-center">Say</th>
              <th className="px-3 py-2 text-right">Qiymət</th>
              <th className="px-3 py-2 text-right">Cəm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-900">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2.5">{item.name}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-gray-600">
                  {item.sku}
                </td>
                <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                <td className="px-3 py-2.5 text-right">
                  {formatPrice(item.price.toString())}
                </td>
                <td className="px-3 py-2.5 text-right font-medium">
                  {formatPrice(item.total.toString())}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Xülasə */}
        <div className="mt-6 ml-auto max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Ara cəm</span>
            <span>{formatPrice(order.subtotal.toString())}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Çatdırılma</span>
            <span>{formatPrice(order.shippingCost.toString())}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Endirim</span>
              <span>-{formatPrice(order.discountAmount.toString())}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-[#1565C0] pt-2 text-lg font-bold text-gray-900">
            <span>Ümumi cəm</span>
            <span className="text-[#1565C0]">
              {formatPrice(order.total.toString())}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          <p>Sifarişiniz üçün təşəkkür edirik. Suallarınız üçün: info@nlineglobal.az</p>
        </div>
      </div>
    </div>
  )
}
