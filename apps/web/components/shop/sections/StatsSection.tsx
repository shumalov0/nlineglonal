import { Award, Truck, Headphones, ShieldCheck } from 'lucide-react'

const stats = [
  { value: '5,000+', label: 'Razı müştəri' },
  { value: '500+', label: 'Premium məhsul' },
  { value: '15', label: 'İl təcrübə' },
  { value: '98%', label: 'Müsbət rəy' },
]

const features = [
  {
    icon: Award,
    title: 'Premium keyfiyyət',
    desc: 'Hər məhsul ekspert keyfiyyət testindən keçir',
  },
  {
    icon: Truck,
    title: 'Sürətli çatdırılma',
    desc: 'Bakı və ətraf rayonlarda 24-48 saat',
  },
  {
    icon: Headphones,
    title: '7/24 dəstək',
    desc: 'Mütəxəssis dəstək komandamız hər zaman yanınızda',
  },
  {
    icon: ShieldCheck,
    title: '12 ay zəmanət',
    desc: 'Bütün məhsullara tam zavod zəmanəti',
  },
]

export function StatsSection() {
  return (
    <section className="bg-[#18181b] text-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Sol — başlıq + statistikalar */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
              — Niyə Nline Global
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Müştəri məmnuniyyətinə
              <br />
              <span className="italic text-slate-300">sadiq qalırıq</span>
            </h2>
            <p className="mt-5 max-w-md text-slate-400">
              Hər müştəri bizim üçün vacibdir. Sifariş verdiyiniz andan
              başlayaraq evinizdə yerləşdirildiyi günə qədər yanınızdayıq.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-6 sm:gap-8">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="border-l-2 border-[var(--color-accent)] pl-4"
                >
                  <p className="font-display text-3xl font-bold text-white sm:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ — feature grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
