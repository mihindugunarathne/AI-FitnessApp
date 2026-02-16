import {
  Calendar,
  Dumbbell,
  Edit3,
  Flame,
  Plus,
  Ruler,
  Scale,
  Timer,
  UtensilsCrossed,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"
import ProgressBar from "../components/ui/ProgressBar"
import CaloriesChart from "../components/CaloriesChart"
import { useAppContext } from "../context/AppContext"
import type { ActivityEntry, FoodEntry } from "../types"
import { useEffect, useState } from "react"

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

const Dashboard = () => {
  const { user, allFoodLogs, allActivityLogs } = useAppContext()
  const [todayfood, setTodayfood] = useState<FoodEntry[]>([])
  const [todayactivity, setTodayactivity] = useState<ActivityEntry[]>([])
  const [yesterdayActivity, setYesterdayActivity] = useState<ActivityEntry[]>([])
  const [selectedDay, setSelectedDay] = useState<number>(6)

  const DAILY_CALORIE_LIMIT = user?.dailyCalorieIntake || 2000
  const burnGoal = user?.dailyCalorieBurn || 500

  const loadUserData = () => {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    setTodayfood(allFoodLogs.filter((f) => f.createdAt?.split("T")[0] === today))
    setTodayactivity(
      allActivityLogs.filter((a) => a.createdAt?.split("T")[0] === today)
    )
    setYesterdayActivity(
      allActivityLogs.filter((a) => a.createdAt?.split("T")[0] === yesterdayStr)
    )
  }

  useEffect(() => {
    loadUserData()
  }, [allFoodLogs, allActivityLogs])

  const totalcalories = todayfood.reduce((sum, item) => sum + item.calories, 0)
  const remainingCalories = DAILY_CALORIE_LIMIT - totalcalories
  const totalActiveMinutes = todayactivity.reduce(
    (sum, item) => sum + item.duration,
    0
  )
  const totalBurned = todayactivity.reduce(
    (sum, item) => sum + (item.calories || 0),
    0
  )
  const yesterdayMinutes = yesterdayActivity.reduce(
    (sum, item) => sum + item.duration,
    0
  )
  const percentChange =
    yesterdayMinutes > 0
      ? Math.round(
          ((totalActiveMinutes - yesterdayMinutes) / yesterdayMinutes) * 100
        )
      : 0

  const bmi =
    user?.weight && user?.height
      ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
      : null
  const bmiStatus =
    bmi !== null
      ? Number(bmi) < 18.5
        ? "Under"
        : Number(bmi) < 25
          ? "Healthy"
          : Number(bmi) < 30
            ? "Overweight"
            : "Obese"
      : null

  const displayName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : "User"
  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase()

  const consumedPct = Math.round(
    Math.min((totalcalories / DAILY_CALORIE_LIMIT) * 100, 100)
  )
  const burnedPct = Math.round(
    Math.min((totalBurned / burnGoal) * 100, 100)
  )

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        {/* Welcome Section - unified container */}
        <div className="welcome-section">
          <div className="welcome-header">
            <p className="welcome-label">OVERVIEW DASHBOARD</p>
            <h1 className="welcome-title">
              Welcome back, {displayName}! 👋
            </h1>
          </div>

          <div className="welcome-goal-card">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="welcome-goal-icon shrink-0">
                <Zap className="size-6 text-teal-400" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-white">
                  Daily Goal in Sight
                </p>
                <p className="text-sm dashboard-muted">
                  {remainingCalories >= 0
                    ? `${remainingCalories} kcal more to hit your target today.`
                    : `${Math.abs(remainingCalories)} kcal over your target.`}
                </p>
              </div>
            </div>
            <Link to="/food" className="welcome-log-meal-btn shrink-0">
              Log Meal
            </Link>
          </div>
        </div>

        {/* Row 2: Left = Daily Nutrition | Right = Active Minutes + Workouts stacked */}
        <div className="dashboard-row-2">
          <div className="dashboard-nutrition-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  Daily Nutrition
                  <Edit3 className="size-4 dashboard-muted" />
                </h3>
                <p className="text-sm" style={{ color: "#a0aec0" }}>
                  Summary of your intake vs goals
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm dashboard-muted">
                <Calendar className="size-4" />
                {todayDate}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="dashboard-icon-teal">
                    <UtensilsCrossed className="size-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: "#a0aec0" }}
                    >
                      Calories Consumed
                    </p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white tabular-nums">
                      {totalcalories.toLocaleString()}{" "}
                      <span
                        className="text-sm font-normal"
                        style={{ color: "#a0aec0" }}
                      >
                        / {DAILY_CALORIE_LIMIT.toLocaleString()} kcal
                      </span>
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums dashboard-accent">
                    {consumedPct}%
                  </span>
                </div>
                <ProgressBar
                  value={totalcalories}
                  max={DAILY_CALORIE_LIMIT}
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="dashboard-icon-gray">
                    <Flame className="size-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider dashboard-muted">
                      Calories Burned
                    </p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white tabular-nums">
                      {totalBurned}{" "}
                      <span className="text-sm font-normal dashboard-muted">
                        / {burnGoal} kcal
                      </span>
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums dashboard-muted">
                    {burnedPct}%
                  </span>
                </div>
                <ProgressBar
                  value={totalBurned}
                  max={burnGoal}
                  variant="muted"
                />
              </div>
            </div>
          </div>

          <div className="dashboard-stat-column">
            <div className="dashboard-stat-card">
              <div className="flex items-start justify-between mb-2">
                <div className="dashboard-icon-teal">
                  <Timer className="size-5 text-white" />
                </div>
                <span className="dashboard-realtime-tag">REALTIME</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-white mb-1">
                Active Minutes
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">
                {totalActiveMinutes}{" "}
                <span className="text-base font-normal dashboard-muted">
                  min
                </span>
              </p>
              <p className="text-sm mt-1 flex items-center gap-1 dashboard-muted">
                <span>{percentChange >= 0 ? "+" : ""}{percentChange}% from yesterday</span>
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-icon-teal mb-2">
                <Dumbbell className="size-5 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-white mb-1">
                Workouts
              </p>
              <p className="text-xs mb-2 dashboard-muted">
                Today&apos;s session
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">
                {todayactivity.length}{" "}
                <span className="text-base font-normal dashboard-muted">
                  logged
                </span>
              </p>
              <div className="dashboard-workout-tags">
                <span>STRENGTH</span>
                <span>CARDIO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Body Metrics, Weekly Progress */}
        <div className="dashboard-row-3">
          <div className="dashboard-body-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">
                Body Metrics
              </h3>
              <Link to="/profile">
                <Edit3 className="size-4 hover:opacity-80 dashboard-muted" />
              </Link>
            </div>

            <div className="space-y-3">
              {/* Weight - dark gray card */}
              <div className="body-metric-card">
                <div className="flex items-center gap-3">
                  <div className="body-metric-icon">
                    <Scale className="size-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                    Weight
                  </span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                  {user?.weight ?? "—"}
                  {user?.weight ? (
                    <span className="font-normal ml-0.5">kg</span>
                  ) : (
                    ""
                  )}
                </span>
              </div>

              {/* Height - dark gray card */}
              {user?.height !== undefined ? (
                <div className="body-metric-card">
                  <div className="flex items-center gap-3">
                    <div className="body-metric-icon">
                      <Ruler className="size-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Height
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                    {user.height}
                    <span className="font-normal ml-0.5">cm</span>
                  </span>
                </div>
              ) : null}

              {/* BMI - integrated into main background */}
              {bmi !== null && bmiStatus ? (
                <div
                  className="pt-4 mt-1 border-t border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      BMI
                    </span>
                    <span className="text-xl font-bold tabular-nums dashboard-accent">
                      {bmi} ({bmiStatus})
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-lg overflow-hidden flex">
                    <div className="flex-[1] min-w-0 bmi-bar-under" />
                    <div className="flex-[2] min-w-0 bmi-bar-normal" />
                    <div className="flex-[1] min-w-0 bmi-bar-over" />
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-medium text-slate-700 dark:text-white">
                    <span className="flex-1 text-center">UNDER</span>
                    <span className="flex-1 text-center">NORMAL</span>
                    <span className="flex-1 text-center">OVER</span>
                  </div>
                </div>
              ) : (
                <Link
                  to="/profile"
                  className="block pt-4 text-sm hover:underline dashboard-accent"
                >
                  Add height to see BMI →
                </Link>
              )}
            </div>
          </div>

          <div className="dashboard-weekly-card p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">
                  Weekly Progress
                </h3>
                <p className="text-sm dashboard-muted">
                  Comparison of caloric balance
                </p>
              </div>
              <Link
                to="/activity"
                className="dashboard-btn-primary inline-flex items-center gap-2 shrink-0"
              >
                <Plus className="size-5" />
                Quick Log Activity
              </Link>
            </div>
            <div className="flex gap-2 mb-6">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(i)}
                  className={`dashboard-day-btn ${
                    selectedDay === i ? "dashboard-day-btn-active" : ""
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <div>
              <CaloriesChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
