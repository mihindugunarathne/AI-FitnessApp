import { useAppContext } from "../context/AppContext"
import { useEffect, useMemo, useState } from "react"
import type { ProfileFormData } from "../types"
import { Calendar, Flame, LogOutIcon, Pencil, Ruler, Scale, Target, User, Zap } from "lucide-react"
import Button from "../components/ui/Button"
import { goalLabels, goalOptions } from "../assets/assets"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import toast from "react-hot-toast"
import api from "../configs/api"



const Profile = () => {
  const { user, logout, fetchUser, allFoodLogs, allActivityLogs } = useAppContext()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    age: 0,
    weight: 0,
    height: 0,
    goal: "maintain",
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 400,
  })

  const fetchUserData = async () => {
    if (user) {
      setFormData({
        age: user?.age || 0,
        weight: user?.weight || 0,
        height: user?.height || 0,
        goal: user?.goal || "maintain",
        dailyCalorieIntake: user?.dailyCalorieIntake || 2000,
        dailyCalorieBurn: user?.dailyCalorieBurn || 400,
      })
    }
  }

  useEffect(() => {
    ;(() => {
      fetchUserData()
    })()
  }, [user])

  const handleSave = async () => {
    try {
      await api.put(`/api/users/${user?.id}`, formData)
      await fetchUser(user?.token || "")
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    }
    setIsEditing(false)
  }

  const getStats = useMemo(() => {
    const totalFoodLogs = allFoodLogs.length || 0
    const totalActivityLogs = allActivityLogs.length || 0
    return {
      totalFoodLogs,
      totalActivityLogs,
    }
  }, [allFoodLogs, allActivityLogs])

  const activeDaysThisWeek = useMemo(() => {
    const now = new Date()
    const days = new Set<string>()
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      days.add(d.toISOString().split("T")[0])
    }
    const logged = new Set(
      allActivityLogs
        .map((a) => a.createdAt?.split("T")[0])
        .filter((d): d is string => !!d && days.has(d))
    )
    return logged.size
  }, [allActivityLogs])

  const weeklyGoalPercent = Math.min(Math.round((activeDaysThisWeek / 5) * 100), 100)
  const joinedLabel = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "N/A"

  const insightText =
    activeDaysThisWeek >= 5
      ? "Consistency is the key to lasting change. You've logged 5 days in a row!"
      : activeDaysThisWeek >= 3
      ? "Great momentum this week. Keep stacking those active days."
      : "You are just getting started. Log one activity today to build momentum."

  if (!user || !formData) return null

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-topbar">
          <div>
            <h1 className="profile-title">User Profile</h1>
            <p className="profile-subtitle">Manage your account and monitor your fitness journey.</p>
          </div>
          <div className="profile-last-login">Last login: 2 hours ago</div>
        </div>

        <div className="profile-layout">
          <section className="profile-main-card">
            {!isEditing ? (
              <>
                <div className="profile-hero">
                  <div className="profile-avatar-wrap">
                    <div className="profile-avatar">
                      <User className="size-9 text-teal-300" />
                    </div>
                    <span className="profile-avatar-dot">
                      <Zap className="size-3 text-slate-900" />
                    </span>
                  </div>
                  <div>
                    <h2 className="profile-name">{user?.username || "User"}</h2>
                    <div className="profile-joined">
                      <Calendar className="size-3.5" />
                      Joined {joinedLabel}
                    </div>
                  </div>
                </div>

                <div className="profile-stats-grid">
                  <div className="profile-stat-box">
                    <div className="profile-stat-icon"><Calendar className="size-4" /></div>
                    <div>
                      <p className="profile-stat-label">Age</p>
                      <p className="profile-stat-value">{user.age || 0} years</p>
                    </div>
                  </div>
                  <div className="profile-stat-box">
                    <div className="profile-stat-icon"><Scale className="size-4" /></div>
                    <div>
                      <p className="profile-stat-label">Weight</p>
                      <p className="profile-stat-value">{user.weight || 0} kg</p>
                    </div>
                  </div>
                  <div className="profile-stat-box">
                    <div className="profile-stat-icon"><Ruler className="size-4" /></div>
                    <div>
                      <p className="profile-stat-label">Height</p>
                      <p className="profile-stat-value">{user.height || 0} cm</p>
                    </div>
                  </div>
                  <div className="profile-stat-box">
                    <div className="profile-stat-icon"><Target className="size-4" /></div>
                    <div>
                      <p className="profile-stat-label">Goal</p>
                      <p className="profile-stat-value">{goalLabels[user?.goal || "maintain"]}</p>
                    </div>
                  </div>
                </div>

                <Button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                  <Pencil className="size-4" />
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <h3 className="profile-form-title">Edit Profile</h3>
                <div className="space-y-4">
                  <Input label="Age" type="number" value={formData.age} onChange={(v) => setFormData({ ...formData, age: Number(v) })} min={13} max={120} />
                  <Input label="Weight (kg)" type="number" value={formData.weight} onChange={(v) => setFormData({ ...formData, weight: Number(v) })} min={30} max={300} />
                  <Input label="Height (cm)" type="number" value={formData.height} onChange={(v) => setFormData({ ...formData, height: Number(v) })} min={100} max={250} />
                  <Select label="Goal" value={formData.goal} options={goalOptions} onChange={(v) => setFormData({ ...formData, goal: v as "lose" | "maintain" | "gain" })} />
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          age: Number(user.age),
                          weight: Number(user.weight),
                          height: Number(user.height),
                          goal: user.goal || "",
                          dailyCalorieIntake: user.dailyCalorieIntake || 2000,
                          dailyCalorieBurn: user.dailyCalorieBurn || 400,
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="flex-1">
                      Save changes
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>

          <aside className="profile-side">
            <div className="profile-side-card">
              <h3 className="profile-side-title">
                <span className="profile-side-title-dot" />
                Lifetime Statistics
              </h3>
              <div className="profile-side-stats">
                <div className="profile-side-stat">
                  <p className="profile-side-stat-value">{getStats.totalFoodLogs}</p>
                  <p className="profile-side-stat-label">Food Logs</p>
                </div>
                <div className="profile-side-stat">
                  <p className="profile-side-stat-value">{getStats.totalActivityLogs}</p>
                  <p className="profile-side-stat-label">Workouts</p>
                </div>
              </div>
              <div className="profile-goal-progress">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span>Weekly Goal Progress</span>
                  <span className="text-teal-400 font-semibold">{weeklyGoalPercent}%</span>
                </div>
                <div className="profile-progress-track">
                  <div className="profile-progress-fill" style={{ width: `${weeklyGoalPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="profile-side-card">
              <h3 className="profile-side-title">
                <Flame className="size-4 text-teal-400" />
                Daily Insight
              </h3>
              <p className="profile-insight-text">"{insightText}"</p>
              <div className="profile-side-divider" />
              <button type="button" onClick={logout} className="profile-signout-btn">
                <LogOutIcon className="size-4" />
                Sign Out
              </button>
              <p className="profile-account-mail">
                ACCOUNT: {String(user.email || "").toUpperCase()}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Profile

