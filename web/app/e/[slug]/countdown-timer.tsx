"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  targetDate: string
  accentBg: string
  accentText: string
}

export default function CountdownTimer({ targetDate, accentBg, accentText }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (timeLeft.total <= 0) return null

  const units = [
    { val: timeLeft.days, label: "Days" },
    { val: timeLeft.hours, label: "Hours" },
    { val: timeLeft.minutes, label: "Min" },
    { val: timeLeft.seconds, label: "Sec" },
  ]

  return (
    <div className="max-w-md mx-auto -mt-8 px-4 relative z-10">
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-neutral-100">
        <p className="text-xs text-neutral-400 uppercase tracking-widest mb-4">Counting down</p>
        <div className="flex justify-center gap-3">
          {units.map(({ val, label }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-3 min-w-[60px]"
              style={{ background: accentBg }}
            >
              <span className="text-2xl font-bold block" style={{ color: accentText }}>
                {String(val).padStart(2, "0")}
              </span>
              <p className="text-[10px] uppercase tracking-wide mt-1 text-neutral-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}
