// Faktura səhifəsi sidebar-sız print-friendly layout
export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-black">
      {children}
    </div>
  )
}
