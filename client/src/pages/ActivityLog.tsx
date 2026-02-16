import { useAppContext } from "../context/AppContext"
import { useMemo, useState } from "react"
import type { ActivityEntry } from "../types"
import { quickActivities } from "../assets/assets"
import {
  CalendarDaysIcon,
  FlameIcon,
  PlusCircleIcon,
  TimerIcon,
  Trash2Icon,
  TrophyIcon,
  ZapIcon,
} from "lucide-react"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import api from "../configs/api"
import { toast } from "react-hot-toast"


type ActivityFormData = {
  name: string
  duration: number
  calories: number
}


const ActivityLog = () => {
  const { allActivityLogs, setAllActivityLogs } = useAppContext()

  const today = new Date().toISOString().split("T")[0]
  const activity = useMemo(
    () =>
      allActivityLogs.filter(
        (a: ActivityEntry) => a.createdAt?.split("T")[0] === today
      ),
    [allActivityLogs, today]
  )

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ActivityFormData>({
    name: "",
    duration: 0,
    calories: 0,
  })

  const handleQuickAdd = (entry: { name: string; rate: number }) => {
    setFormData({
      name: entry.name,
      duration: 30,
      calories: 30 * entry.rate,
    })
    setShowForm(true)
  }

  const handleDurationChange = (v: string | number) => {
    const duration = Number(v)
    const selectedActivity = quickActivities.find((a) => a.name === formData.name)
    let calories = formData.calories
    if (selectedActivity) calories = duration * selectedActivity.rate
    setFormData({ ...formData, duration, calories })
  }

  const handleDelete = async (documentId: string) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this activity?"
      )
      if (!confirmDelete) return
      await api.delete(`/api/activity-logs/${documentId}`)
      setAllActivityLogs((prev) => prev.filter((a) => a.documentId !== documentId))
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: { message?: string } } }
        message?: string
      }
      toast.error(err?.response?.data?.error?.message || err?.message || "Delete failed")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await api.post("/api/activity-logs", { data: formData })
      setAllActivityLogs((prev) => [...prev, data])
      setFormData({ name: "", duration: 0, calories: 0 })
      setShowForm(false)
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: { message?: string } } }
        message?: string
      }
      toast.error(err?.response?.data?.error?.message || err?.message || "Save failed")
    }
  }

  const totalMinutes = activity.reduce((sum, a) => sum + a.duration, 0)
  const totalCalories = activity.reduce((sum, a) => sum + a.calories, 0)
  const intensityScore =
    totalMinutes > 0 ? Math.round(totalCalories / totalMinutes) : 0

  const activeDaysThisWeek = useMemo(() => {
    const now = new Date()
    const dates = new Set<string>()
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      dates.add(d.toISOString().split("T")[0])
    }
    const logged = new Set(
      allActivityLogs
        .map((a) => a.createdAt?.split("T")[0])
        .filter((d): d is string => !!d && dates.has(d))
    )
    return logged.size
  }, [allActivityLogs])

  const streakDays = useMemo(() => {
    const loggedDates = new Set(
      allActivityLogs
        .map((a) => a.createdAt?.split("T")[0])
        .filter((d): d is string => !!d)
    )
    let streak = 0
    const cursor = new Date()
    while (true) {
      const key = cursor.toISOString().split("T")[0]
      if (!loggedDates.has(key)) break
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  }, [allActivityLogs])

  const recentMilestones = [
    {
      title: activity.length > 0 ? "Activity Logged" : "First Activity",
      subtitle: activity.length > 0 ? "TODAY" : "START HERE",
    },
    {
      title: streakDays > 0 ? `Streak: ${streakDays} day${streakDays > 1 ? "s" : ""}` : "Consistent King",
      subtitle: streakDays > 0 ? "KEEP GOING" : "LOG 7 DAYS",
    },
  ]

  return (
    <div className="activity-log-page">
      <div className="activity-log-content">
        <div className="activity-log-layout">
          <section className="activity-log-main">
            <header className="activity-log-header">
              <div>
                <h1 className="activity-log-title">Activity Log</h1>
                <p className="activity-log-subtitle">MIDNIGHT &amp; TEAL EDITION</p>
              </div>
              <div className="text-right">
                <p className="activity-log-total-label">TODAY&apos;S TOTAL</p>
                <p className="activity-log-total-value">{totalMinutes} min</p>
              </div>
            </header>

            {!showForm ? (
              <>
                <div className="activity-log-quick-panel">
                  <p className="activity-log-panel-label">QUICK ADD ACTIVITY</p>
                  <div className="activity-log-quick-grid">
                    {quickActivities.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        className="activity-log-quick-item"
                      >
                        <span className="activity-log-quick-emoji">{item.emoji}</span>
                        <span className="activity-log-quick-name">{item.name.replace("Weight Training", "Weights")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  className="activity-log-add-btn"
                  onClick={() => setShowForm(true)}
                >
                  <PlusCircleIcon className="size-5" />
                  Add custom activity
                </Button>
              </>
            ) : (
              <div className="activity-log-form-panel">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">New activity</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <Input
                    label="Activity name"
                    placeholder="e.g. Morning run"
                    value={formData.name}
                    onChange={(v) => setFormData({ ...formData, name: v.toString() })}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Duration (min)"
                      placeholder="e.g. 30"
                      min={1}
                      max={300}
                      value={formData.duration}
                      onChange={handleDurationChange}
                      required
                    />
                    <Input
                      label="Calories burned"
                      placeholder="e.g. 300"
                      min={1}
                      max={2000}
                      value={formData.calories}
                      onChange={(v) => setFormData({ ...formData, calories: Number(v) })}
                      required
                    />
                  </div>
                  <div className="flex pt-2 gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setShowForm(false)
                        setFormData({ name: "", duration: 0, calories: 0 })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Add activity
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="activity-log-today-header">
              <h3>Today&apos;s Log</h3>
              <button type="button">View History</button>
            </div>

            {activity.length === 0 ? (
              <div className="activity-log-empty-panel">
                <div className="activity-log-empty-icon">
                  <CalendarDaysIcon className="size-8 text-teal-400" />
                </div>
                <h4>No activities logged today</h4>
                <p>
                  Ready to start? Track your movements to fill your progress rings
                  with a high-tech teal glow.
                </p>
                <div className="activity-log-empty-badges">
                  <span>0/10k Steps</span>
                  <span>0 Active Min</span>
                </div>
              </div>
            ) : (
              <div className="activity-log-list">
                {activity.map((item) => (
                  <div key={item.id} className="activity-log-item">
                    <div className="activity-log-item-left">
                      <div className="activity-log-item-icon">
                        <TimerIcon className="size-5 text-teal-300" />
                      </div>
                      <div>
                        <p className="activity-log-item-name">{item.name}</p>
                        <p className="activity-log-item-time">
                          {new Date(item.createdAt || "").toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="activity-log-item-right">
                      <div className="text-right">
                        <p className="activity-log-item-duration">{item.duration} min</p>
                        <p className="activity-log-item-calories">{item.calories} kcal</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.documentId)}
                        className="activity-log-delete"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="activity-log-metric-grid">
              <div className="activity-log-metric-card">
                <div className="activity-log-metric-top">
                  <FlameIcon className="size-4 text-teal-400" />
                  <span>Active Calories</span>
                </div>
                <p className="activity-log-metric-value">{totalCalories} <small>kcal</small></p>
                <div className="activity-log-metric-line" />
              </div>
              <div className="activity-log-metric-card">
                <div className="activity-log-metric-top">
                  <TimerIcon className="size-4 text-teal-400" />
                  <span>Total Duration</span>
                </div>
                <p className="activity-log-metric-value">{totalMinutes} <small>min</small></p>
                <div className="activity-log-metric-line" />
              </div>
              <div className="activity-log-metric-card">
                <div className="activity-log-metric-top">
                  <ZapIcon className="size-4 text-teal-400" />
                  <span>Intensity Score</span>
                </div>
                <p className="activity-log-metric-value">{intensityScore > 0 ? intensityScore : "--"} <small>lvl</small></p>
                <div className="activity-log-metric-line" />
              </div>
            </div>
          </section>

          <aside className="activity-log-side">
            <h3>Weekly Progress</h3>
            <div className="activity-log-side-goal">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Activity Goal</span>
                <span>{activeDaysThisWeek}/5 days</span>
              </div>
              <div className="activity-log-side-progress">
                <div
                  className="activity-log-side-progress-fill"
                  style={{ width: `${Math.min((activeDaysThisWeek / 5) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="activity-log-streak-card">
              <p className="activity-log-streak-label">CURRENT STREAK</p>
              <p className="activity-log-streak-value">{streakDays} Days</p>
              <p className="activity-log-streak-note">Consistency creates champions.</p>
            </div>

            <div className="activity-log-side-milestones">
              <p className="activity-log-panel-label">RECENT MILESTONES</p>
              {recentMilestones.map((item) => (
                <div key={item.title} className="activity-log-milestone">
                  <TrophyIcon className="size-4 text-slate-500" />
                  <div>
                    <p>{item.title}</p>
                    <span>{item.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default ActivityLog