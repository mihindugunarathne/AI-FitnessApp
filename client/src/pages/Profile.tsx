import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import type { ProfileFormData } from "../types";
import Card from "../components/ui/Card";
import { Calendar, LogOutIcon, MoonIcon, Ruler, Scale, SunIcon, Target, User } from "lucide-react";
import Button from "../components/ui/Button";
import { goalLabels, goalOptions } from "../assets/assets";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";
import api from "../configs/api";



const Profile = () => {

  const { user, logout, fetchUser, allFoodLogs, allActivityLogs } = useAppContext();

  const {theme, toggleTheme} = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    age: 0,
    weight: 0,
    height: 0,
    goal: "maintain",
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 400,
  });

  const fetchUserData = async () => {
    if(user){
      setFormData({
        age: user?.age || 0,
        weight: user?.weight || 0,
        height: user?.height || 0,
        goal: user?.goal || "maintain",
        dailyCalorieIntake: user?.dailyCalorieIntake || 2000,
        dailyCalorieBurn: user?.dailyCalorieBurn || 400,
      });
    }
  }

  useEffect(() => {
    (()=>{
      fetchUserData();
    })();
  }, [user]);

  const handleSave = async () => {
    try {
      await api.put(`/api/users/${user?.id}`, formData);
      await fetchUser(user?.token || '');
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
    setIsEditing(false);
  }

  const getStats = () => {
    const totalFoodLogs = allFoodLogs.length || 0;
    const totalActivityLogs = allActivityLogs.length || 0;

    return {
      totalFoodLogs,
      totalActivityLogs,
    }
  }

  const stats = getStats();

  if(!user || !formData) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your profile settings</p>
      </div>

      <div className="profile-content">
        <Card className="shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <User className="size-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Your profile</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Member since {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input label="Age" type="number" value={formData.age} onChange={(v) => setFormData({ ...formData, age: Number(v) })} min={13} max={120} />
              <Input label="Weight (kg)" type="number" value={formData.weight} onChange={(v) => setFormData({ ...formData, weight: Number(v) })} min={30} max={300} />
              <Input label="Height (cm)" type="number" value={formData.height} onChange={(v) => setFormData({ ...formData, height: Number(v) })} min={100} max={250} />
              <Select label="Goal" value={formData.goal} options={goalOptions} onChange={(v) => setFormData({ ...formData, goal: v as "lose" | "maintain" | "gain" })} />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => { setIsEditing(false); setFormData({ age: Number(user.age), weight: Number(user.weight), height: Number(user.height), goal: user.goal || '', dailyCalorieIntake: user.dailyCalorieIntake || 2000, dailyCalorieBurn: user.dailyCalorieBurn || 400 }); }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1">Save changes</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="profile-info-row">
                  <div className="size-11 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Calendar className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Age</p>
                    <p className="font-bold text-slate-800 dark:text-white tabular-nums">{user.age} years</p>
                  </div>
                </div>
                <div className="profile-info-row">
                  <div className="size-11 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Scale className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Weight</p>
                    <p className="font-bold text-slate-800 dark:text-white tabular-nums">{user.weight} kg</p>
                  </div>
                </div>
                {user.height !== 0 && user.height && (
                  <div className="profile-info-row">
                    <div className="size-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                      <Ruler className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Height</p>
                      <p className="font-bold text-slate-800 dark:text-white tabular-nums">{user.height} cm</p>
                    </div>
                  </div>
                )}
                <div className="profile-info-row">
                  <div className="size-11 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Target className="size-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Goal</p>
                    <p className="font-bold text-slate-800 dark:text-white">{goalLabels[user?.goal || "maintain"]}</p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setIsEditing(true)} className="w-full mt-5">
                Edit profile
              </Button>
            </>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Your stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.totalFoodLogs}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Food entries</p>
              </div>
              <div className="text-center p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{stats.totalActivityLogs}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Activity entries</p>
              </div>
            </div>
          </Card>

          <div className="lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 rounded-2xl transition-colors border border-slate-100 dark:border-slate-700"
            >
              {theme === "light" ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
              <span className="text-base font-medium">{theme === "light" ? "Dark mode" : "Light mode"}</span>
            </button>
          </div>

          <Button variant="danger" onClick={logout} className="w-full">
            <LogOutIcon className="size-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Profile

