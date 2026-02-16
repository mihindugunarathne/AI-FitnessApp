import { useAppContext } from "../context/AppContext"
import { useState, useEffect } from "react"
import type { FoodEntry, FormData } from "../types"
import Card from "../components/ui/Card"
import { mealTypeOptions } from "../assets/assets"
import Button from "../components/ui/Button"
import {
  Beef,
  Cookie,
  EggFried,
  Loader2Icon,
  Moon,
  PlusIcon,
  SparkleIcon,
  TrashIcon,
} from "lucide-react"
import { useRef } from "react"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import toast from "react-hot-toast"
import api from "../configs/api"
import ProgressBar from "../components/ui/ProgressBar"

const mealTypeConfig = [
  { key: "breakfast" as const, label: "Breakfast", icon: EggFried },
  { key: "lunch" as const, label: "Lunch", icon: Beef },
  { key: "dinner" as const, label: "Dinner", icon: Moon },
  { key: "snack" as const, label: "Snack", icon: Cookie },
]

const foodEntryIcons: Record<string, { icon: typeof Beef; bg: string }> = {
  breakfast: { icon: EggFried, bg: "bg-sky-500/20 text-sky-400" },
  lunch: { icon: Beef, bg: "bg-emerald-500/20 text-emerald-400" },
  dinner: { icon: Moon, bg: "bg-indigo-500/20 text-indigo-400" },
  snack: { icon: Cookie, bg: "bg-rose-500/20 text-rose-400" },
}

const MACRO_GOALS = { protein: 150, carbs: 240, fats: 65 }

function estimateProtein(calories: number) {
  return Math.round((calories * 0.25) / 4)
}

function estimateCarbs(calories: number) {
  return Math.round((calories * 0.5) / 4)
}

function estimateFats(calories: number) {
  return Math.round((calories * 0.25) / 9)
}

function formatEntryTime(createdAt?: string) {
  if (!createdAt) return ""
  const d = new Date(createdAt)
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

const FoodLog = () => {
  const { allFoodLogs, setAllFoodLogs } = useAppContext()

  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack" | null
  >(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    calories: 0,
    mealType: "",
  })

  const [Loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.calories ||
      formData.calories <= 0 ||
      !formData.mealType
    ) {
      return toast.error("Please fill in all fields")
    }

    try {
      const { data } = await api.post("/api/food-logs", { data: formData })
      setAllFoodLogs((prev) => [...prev, data])
      setFormData({ name: "", calories: 0, mealType: "" })
      setShowForm(false)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string }
      toast.error(err?.response?.data?.error?.message || err?.message || "Something went wrong")
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this food entry?"
      )
      if (!confirm) return
      await api.delete(`/api/food-logs/${documentId}`)
      setAllFoodLogs((prev) => prev.filter((e) => e.documentId !== documentId))
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string }
      toast.error(err?.response?.data?.error?.message || err?.message || "Something went wrong")
    }
  }

  const totalcalories = entries.reduce((sum, e) => sum + e.calories, 0)
  const totalProtein = entries.reduce(
    (sum, e) => sum + estimateProtein(e.calories),
    0
  )
  const totalCarbs = entries.reduce(
    (sum, e) => sum + estimateCarbs(e.calories),
    0
  )
  const totalFats = entries.reduce(
    (sum, e) => sum + estimateFats(e.calories),
    0
  )

  const handleQuickAdd = (mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    setSelectedMealType(mealType)
    setFormData({ ...formData, mealType })
    setShowForm(true)
  }

  const handleImagechange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const formDataUpload = new FormData()
    formDataUpload.append("image", file)
    try {
      const { data } = await api.post("/api/image-analysis", formDataUpload)
      const result = data.data ?? data.result
      if (!result?.name || !result?.calories) {
        toast.error("Could not detect food in image. Please try again.")
        return
      }

      let mealType = "breakfast"
      const hour = new Date().getHours()
      if (hour >= 0 && hour < 12) mealType = "breakfast"
      else if (hour >= 12 && hour < 16) mealType = "lunch"
      else if (hour >= 16 && hour < 18) mealType = "snack"
      else mealType = "dinner"

      const { data: newEntry } = await api.post("/api/food-logs", {
        data: { name: result.name, calories: result.calories, mealType },
      })
      setAllFoodLogs((prev) => [...prev, newEntry])

      if (inputRef.current) {
        inputRef.current.value = ""
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string }
      toast.error(err?.response?.data?.error?.message || err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    const todayEntries = allFoodLogs.filter(
      (e: FoodEntry) => e.createdAt?.split("T")[0] === todayStr
    )
    setEntries(todayEntries)
  }, [allFoodLogs])

  const recentEntries = [...entries].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  )

  return (
    <div className="food-log-page">
      <div className="food-log-content">
        {/* Header */}
        <div className="food-log-header">
          <div>
            <h1 className="food-log-title">Food Log</h1>
            <p className="food-log-subtitle">
              Nourish your body, track your progress.
            </p>
          </div>
          <div className="text-right">
            <p className="food-log-total-label">TODAY&apos;S TOTAL</p>
            <p className="food-log-total-value">{totalcalories.toLocaleString()} kcal</p>
          </div>
        </div>

        {!showForm ? (
          <div className="space-y-6">
              <div className="food-log-panel">
                <p className="food-log-section-label">SELECT MEAL TYPE</p>
                <div className="food-log-meal-pills">
                  {mealTypeConfig.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleQuickAdd(key)}
                      className={`food-log-meal-pill ${
                        selectedMealType === key ? "food-log-meal-pill-active" : ""
                      }`}
                    >
                      <Icon className="size-5 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="food-log-actions">
                <Button
                  className="food-log-action-btn"
                  onClick={() => setShowForm(true)}
                >
                  <PlusIcon className="size-5" />
                  Add Food Entry
                </Button>
                <Button
                  className="food-log-action-btn"
                  type="button"
                  onClick={() => inputRef.current?.click()}
                >
                  <SparkleIcon className="size-5" />
                  AI Food Snap
                </Button>
              </div>
              <input
                onChange={handleImagechange}
                type="file"
                accept="image/*"
                hidden
                ref={inputRef}
              />

            {Loading && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-4">
                  <Loader2Icon className="size-10 text-teal-500 animate-spin" />
                  <p className="text-sm text-slate-400">Analyzing your food...</p>
                </div>
              </div>
            )}

            {/* RECENT ENTRIES */}
            <div>
              <p className="food-log-section-label">RECENT ENTRIES</p>
              {recentEntries.length === 0 ? (
                <div className="food-log-empty">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No food logged today. Add your first entry above.
                  </p>
                </div>
              ) : (
                <div className="food-log-entries">
                  {recentEntries.map((entry) => {
                    const config = foodEntryIcons[entry.mealType] || foodEntryIcons.breakfast
                    const Icon = config.icon
                    const mealLabel =
                      entry.mealType.charAt(0).toUpperCase() +
                      entry.mealType.slice(1)
                    return (
                      <div key={entry.id} className="food-log-entry-card">
                        <div
                          className={`food-log-entry-icon ${config.bg}`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="food-log-entry-content">
                          <p className="font-medium text-slate-800 dark:text-white">
                            {entry.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {mealLabel} • {formatEntryTime(entry.createdAt) || "—"}
                          </p>
                        </div>
                        <div className="food-log-entry-right">
                          <p className="font-semibold text-teal-500 tabular-nums">
                            {entry.calories} kcal
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {estimateProtein(entry.calories)}g Protein
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(entry?.documentId || "")
                          }
                          className="food-log-delete-btn"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Nutrient Progress */}
            {entries.length > 0 && (
              <div className="food-log-nutrients">
                <div className="food-log-nutrient-card">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Protein
                    </span>
                    <span className="font-medium text-slate-800 dark:text-white tabular-nums">
                      {totalProtein}/{MACRO_GOALS.protein}g
                    </span>
                  </div>
                  <ProgressBar value={totalProtein} max={MACRO_GOALS.protein} />
                </div>
                <div className="food-log-nutrient-card">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Carbs
                    </span>
                    <span className="font-medium text-slate-800 dark:text-white tabular-nums">
                      {totalCarbs}/{MACRO_GOALS.carbs}g
                    </span>
                  </div>
                  <ProgressBar value={totalCarbs} max={MACRO_GOALS.carbs} />
                </div>
                <div className="food-log-nutrient-card">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Fats
                    </span>
                    <span className="font-medium text-slate-800 dark:text-white tabular-nums">
                      {totalFats}/{MACRO_GOALS.fats}g
                    </span>
                  </div>
                  <ProgressBar value={totalFats} max={MACRO_GOALS.fats} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="border-2 border-teal-200 dark:border-teal-800 shadow-lg shadow-teal-500/5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              New food entry
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Food name"
                value={formData.name}
                onChange={(v) =>
                  setFormData({ ...formData, name: v.toString() })
                }
                placeholder="e.g. Chicken salad"
                required
              />
              <Input
                label="Calories"
                type="number"
                value={formData.calories}
                onChange={(v) =>
                  setFormData({ ...formData, calories: Number(v) })
                }
                placeholder="e.g. 500"
                required
                min={1}
              />
              <Select
                label="Meal type"
                value={formData.mealType}
                onChange={(v) =>
                  setFormData({ ...formData, mealType: v.toString() })
                }
                options={mealTypeOptions}
                placeholder="Select a meal type"
                required
              />
              <div className="flex pt-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ name: "", calories: 0, mealType: "" })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add entry
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FoodLog
