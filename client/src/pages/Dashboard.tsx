import { Activity, FlameIcon, HamburgerIcon, Ruler, ScaleIcon, TrendingUpIcon, ZapIcon } from "lucide-react"
import { getMotivationalMessage } from "../assets/assets"
import Card from "../components/ui/Card"
import ProgressBar from "../components/ui/ProgressBar"
import { useAppContext } from "../context/AppContext"
import type { ActivityEntry, FoodEntry } from "../types"
import { useEffect, useState } from "react"
import CaloriesChart from "../components/CaloriesChart"



const Dashboard = () => {

  const {user, allFoodLogs, allActivityLogs} = useAppContext()
  const [todayfood, setTodayfood] = useState<FoodEntry[]>([])
  const [todayactivity, setTodayactivity] = useState<ActivityEntry[]>([])

  const DAILY_CALORIE_LIMIT: number = user?.dailyCalorieIntake || 2000;

  //Load user data
  const loadUserData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const foodData = allFoodLogs.filter((f: FoodEntry) => f.createdAt?.split('T')[0] === today);
    setTodayfood(foodData);
    const activityData = allActivityLogs.filter((a: ActivityEntry) => a.createdAt?.split('T')[0] === today);
    setTodayactivity(activityData);
  }

  useEffect(() => {
    (()=>{loadUserData()})();
  }, [allFoodLogs, allActivityLogs]);

  const totalcalories: number = todayfood.reduce((sum, item) => sum + item.calories, 0);

  const remainingCalories: number = DAILY_CALORIE_LIMIT - totalcalories;

  const totalActiveMinutes: number = todayactivity.reduce((sum, item) => sum + item.duration, 0);

  const totalBurned: number = todayactivity.reduce((sum, item) => sum + (item.calories || 0), 0);

  const motivation = getMotivationalMessage(totalcalories, totalActiveMinutes, DAILY_CALORIE_LIMIT);

  const burnGoal = user?.dailyCalorieBurn || 400;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="dashboard-header">
        <p className="text-emerald-100 text-sm font-medium">Welcome back</p>
        <h1 className="mt-1 text-2xl lg:text-3xl font-bold tracking-tight">{`Hi, ${user?.username}! 👋`}</h1>

        <div className="dashboard-motivation-card">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{motivation.emoji}</span>
            <p className="text-white/95 font-medium text-base">{motivation.text}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-grid">
        {/* Calories Card */}
        <Card className="shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                <HamburgerIcon className="size-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Calories consumed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{totalcalories}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Daily limit</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{DAILY_CALORIE_LIMIT}</p>
            </div>
          </div>
          <ProgressBar value={totalcalories} max={DAILY_CALORIE_LIMIT} />
          <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
            <div className={`px-3 py-2 rounded-xl text-sm font-medium ${remainingCalories >= 0
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              {remainingCalories >= 0 ? `${remainingCalories} kcal remaining` : `${Math.abs(remainingCalories)} kcal over`}
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {Math.round(totalcalories / DAILY_CALORIE_LIMIT * 100)}%
            </span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-5" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 flex items-center justify-center">
                <FlameIcon className="size-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Calories burned</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{totalBurned}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Daily goal</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{burnGoal}</p>
            </div>
          </div>
          <ProgressBar value={totalBurned} max={burnGoal} />
        </Card>

        {/* Stats Row */}
        <div className="dashboard-card-grid">
          <Card className="dashboard-stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Activity className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{totalActiveMinutes}</p>
            <p className="text-sm text-slate-400">minutes today</p>
          </Card>

          <Card className="dashboard-stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <ZapIcon className="size-5 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Workouts</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{todayactivity.length}</p>
            <p className="text-sm text-slate-400">activities logged</p>
          </Card>
        </div>

        {/* Goal card */}
        {user && (
          <Card className="col-span-2 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-800 dark:to-slate-900 border-slate-700 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <TrendingUpIcon className="size-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Your goal</p>
                <p className="text-white font-semibold text-lg capitalize">
                  {user.goal === "lose" && "🔥 Lose weight"}
                  {user.goal === "maintain" && "⚖️ Maintain weight"}
                  {user.goal === "gain" && "💪 Gain muscle"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Body Metrics */}
        {user && user.weight && (
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <ScaleIcon className="size-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">Body metrics</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your stats</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <ScaleIcon className="size-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Weight</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-white tabular-nums">{user.weight} kg</span>
              </div>

              {user.height ? (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Ruler className="size-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Height</span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-white tabular-nums">{user.height} cm</span>
                </div>
              ) : null}

              {user.height ? (
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">BMI</span>
                    {(() => {
                      const bmi = (user.weight / Math.pow(user.height / 100, 2)).toFixed(1);
                      const getColor = (b: number) => {
                        if (b < 18.5) return 'text-blue-600 dark:text-blue-400';
                        if (b < 25) return 'text-emerald-600 dark:text-emerald-400';
                        if (b < 30) return 'text-orange-600 dark:text-orange-400';
                        return 'text-red-600 dark:text-red-400';
                      };
                      return <span className={`text-xl font-bold tabular-nums ${getColor(Number(bmi))}`}>{bmi}</span>;
                    })()}
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-blue-400/40 dark:bg-blue-500/30" />
                    <div className="flex-1 bg-emerald-400/40 dark:bg-emerald-500/30" />
                    <div className="flex-1 bg-orange-400/40 dark:bg-orange-500/30" />
                    <div className="flex-1 bg-red-400/40 dark:bg-red-500/30" />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        )}

        {/* Today's Summary */}
        <Card>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Today&apos;s summary</h3>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Meals logged</span>
              <span className="font-semibold text-slate-800 dark:text-white tabular-nums">{todayfood.length}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Total calories</span>
              <span className="font-semibold text-slate-800 dark:text-white tabular-nums">{totalcalories} kcal</span>
            </div>
            <div className="flex justify-between items-center py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Active time</span>
              <span className="font-semibold text-slate-800 dark:text-white tabular-nums">{totalActiveMinutes} min</span>
            </div>
          </div>
        </Card>

        {/* Calories Chart */}
        <Card className="col-span-2">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">This week&apos;s progress</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Intake vs. burn by day</p>
          <CaloriesChart />
        </Card>
      </div>
    </div>
  )
}

export default Dashboard