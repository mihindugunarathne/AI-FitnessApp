import { useAppContext } from "../context/AppContext";
import { useMemo, useState } from "react";
import type { ActivityEntry } from "../types";
import Card from "../components/ui/Card";
import { quickActivities } from "../assets/assets";
import { ActivityIcon, DumbbellIcon, PlusIcon, TimerIcon, Trash2Icon } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import api from "../configs/api";
import  { toast } from "react-hot-toast";


type ActivityFormData = {
  name: string;
  duration: number;
  calories: number;
};


const ActivityLog = () => {

 const { allActivityLogs, setAllActivityLogs } = useAppContext();

 const today = new Date().toISOString().split("T")[0];
 const activity = useMemo(
   () =>
     allActivityLogs.filter(
       (a: ActivityEntry) => a.createdAt?.split("T")[0] === today
     ),
   [allActivityLogs, today]
 );

 const [showForm, setShowForm] = useState(false);
 const [formData, setFormData] = useState<ActivityFormData>({
  name: '',
  duration: 0,
  calories: 0,
 });
 const [error, setError] = useState('');

  const handleQuickAdd = (activity: { name: string; rate: number }) => {
    setFormData({
      name: activity.name,
      duration:30,
      calories: 30 * activity.rate,
    });
    setShowForm(true);
  }

  const handleDurationChange = (v: string | number) => {
    const duration = Number(v);
    const activity = quickActivities.find((a)=>a.name === formData.name);

    let calories = formData.calories;
    if (activity) {
      calories = duration * activity.rate;
    }
    setFormData({...formData, duration, calories});
  }

  const handleDelete = async (documentId: string) => {
    try {
     const confirm = window.confirm('Are you sure you want to delete this activity?');
     if(!confirm) return;
     await api.delete(`/api/activity-logs/${documentId}`)
     setAllActivityLogs((prev) => prev.filter((a) => a.documentId !== documentId));
  }catch (error: any) {
    console.log(error);
    toast.error(error?.response?.data?.error?.message || error?.message)
  }
}


  const totalMinutes = activity.reduce((sum, a) => sum + a.duration, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const {data} = await api.post('/api/activity-logs', {data: formData})
      setAllActivityLogs((prev) => [...prev, data]);
      setFormData({ name: '', duration: 0, calories: 0 });
      setShowForm(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message)
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Activity Log</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your workouts</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Activity total</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{totalMinutes} min</p>
          </div>
        </div>
      </div>

      <div className="page-content-grid">
        {!showForm && (
          <div className="space-y-4">
            <Card className="shadow-sm">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Quick add</h3>
              <div className="flex flex-wrap gap-2">
                {quickActivities.map((item) => (
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(item)}
                    className="quick-add-pill"
                    key={item.name}
                  >
                    {item.emoji} {item.name}
                  </button>
                ))}
              </div>
            </Card>
            <Button type="button" className="w-full" onClick={() => setShowForm(true)}>
              <PlusIcon className="size-5" />
              Add custom activity
            </Button>
          </div>
        )}

        {showForm && (
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">New activity</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Activity name"
                placeholder="e.g. Morning run"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v.toString() })}
                required
              />
              <div className="flex gap-4">
                <Input
                  label="Duration (min)"
                  className="flex-1"
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
                  className="flex-1"
                  min={1}
                  max={2000}
                  value={formData.calories}
                  onChange={(v) => setFormData({ ...formData, calories: Number(v) })}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex pt-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                    setFormData({ name: '', duration: 0, calories: 0 });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add activity
                </Button>
              </div>
            </form>
          </Card>
        )}

        {activity.length === 0 ? (
          <Card className="empty-state-card col-span-2">
            <div className="size-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
              <DumbbellIcon className="size-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">No activities logged today</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">Start moving and track your progress</p>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ActivityIcon className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">Today&apos;s activities</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{activity.length} logged</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="activity-entry-item">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <TimerIcon className="size-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{item.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(item?.createdAt || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{item.duration} min</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{item.calories} kcal</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.documentId)}
                      className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total active time</span>
              <span className="text-lg font-bold text-slate-700 dark:text-slate-200 tabular-nums">{totalMinutes} min</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ActivityLog