import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { GraduationCap, LinkIcon, MapPin, Shield, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'

const steps = [
  { key: 'story_step1', icon: GraduationCap, color: 'bg-brand-700' },
  { key: 'story_step2', icon: LinkIcon, color: 'bg-brand-600' },
  { key: 'story_step3', icon: MapPin, color: 'bg-brand-500' },
  { key: 'story_step4', icon: Shield, color: 'bg-brand-800' },
  { key: 'story_step5', icon: CheckCircle, color: 'bg-emerald-500' },
]

export default function StoryMode() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)

  const step = steps[current]
  const Icon = step.icon

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-brand-50/50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-900">
          {t('home.story_title')}
        </motion.h2>

        <div className="relative">
          {/* Progress bar */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${i === current ? `${s.color} scale-125 shadow-brand` : i < current ? 'bg-brand-400' : 'bg-brand-200'}`} />
            ))}
          </div>

          {/* Card */}
          <motion.div key={current} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }} className="card max-w-2xl mx-auto text-center">
            <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-brand`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="text-sm font-medium text-brand-500 mb-2">Step {current + 1} of {steps.length}</div>
            <h3 className="text-xl font-bold text-brand-900 mb-3">{t(`home.${step.key}_title`)}</h3>
            <p className="text-brand-600 leading-relaxed">{t(`home.${step.key}`)}</p>
          </motion.div>

          {/* Nav buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
              className="p-2 rounded-xl border border-border hover:bg-brand-50 hover:border-brand-300 disabled:opacity-30 transition-all duration-200">
              <ChevronLeft className="w-5 h-5 text-brand-700" />
            </button>
            <button onClick={() => setCurrent(Math.min(steps.length - 1, current + 1))} disabled={current === steps.length - 1}
              className="p-2 rounded-xl border border-border hover:bg-brand-50 hover:border-brand-300 disabled:opacity-30 transition-all duration-200">
              <ChevronRight className="w-5 h-5 text-brand-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
