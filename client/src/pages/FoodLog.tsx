import { useAppContext } from "../context/AppContext";
import { useState, useEffect } from "react";
import type { FoodEntry, FormData } from "../types";
import Card from "../components/ui/Card";
import { mealColors, mealIcons, mealTypeOptions, quickActivitiesFoodLog } from "../assets/assets";
import Button from "../components/ui/Button";
import { Loader2Icon, PlusIcon, SparkleIcon, TrashIcon, UtensilsCrossedIcon } from "lucide-react";
import { useRef } from "react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";
import api from "../configs/api";





const FoodLog = () => { 

  const {allFoodLogs, setAllFoodLogs} = useAppContext();

  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    calories: 0,
    mealType: '',
  });

  const [Loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];

  const loadEntries = () => {
    const todayEntries = allFoodLogs.filter((e: FoodEntry)=> 
      e.createdAt?.split("T")[0] === today);
    setEntries(todayEntries);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!formData.name.trim() || !formData.calories || formData.calories <= 0 || !formData.mealType) {
      return toast.error('Please fill in all fields');
    }
    
    try {
      const {data} = await api.post('/api/food-logs', {data: formData});
      setAllFoodLogs(prev => [...prev, data]);
      setFormData({name: '', calories: 0, mealType: ''});
      setShowForm(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message)
    }  
  }

  const handleDelete = async (documentId: string) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this food entry?');
      if(!confirm) return;
      await api.delete(`/api/food-logs/${documentId}`);
      setAllFoodLogs(prev => prev.filter(e => e.documentId !== documentId));
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message)
    } 
  }

  const totalcalories = entries.reduce((sum, e)=> sum + e.calories, 0);

  //Group entries by meal type
  const groupedEntries : Record<'breakfast' | 'lunch' | 'dinner' | 'snack',
   FoodEntry[]> = entries.reduce((acc, entry)=>{
    if(!acc[entry.mealType]) acc[entry.mealType] = [];
    acc[entry.mealType].push(entry);
    return acc;
   }, {} as Record<'breakfast' | 'lunch' | 'dinner' | 'snack', FoodEntry[]>);

  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  const handleQuickAdd = (activityName: string) => {
    setFormData({...formData, mealType: activityName});
    setShowForm(true);
  }

  const handleImagechange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/api/image-analysis', formData);
      const result = data.data ?? data.result;
      if (!result?.name || !result?.calories) {
        toast.error('Could not detect food in image. Please try again.');
        return;
      }

      let mealType = '';
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 12) mealType = 'breakfast';
      else if (hour >= 12 && hour < 16) mealType = 'lunch';
      else if (hour >= 16 && hour < 18) mealType = 'snack';
      else mealType = 'dinner';

      const { data: newEntry } = await api.post('/api/food-logs', {
        data: { name: result.name, calories: result.calories, mealType },
      });
      setAllFoodLogs((prev) => [...prev, newEntry]);

      if(inputRef.current){
        inputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (()=>{
      loadEntries();
    })();
  }, [allFoodLogs]);


  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Food Log</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your daily intake</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Today&apos;s total</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{totalcalories} kcal</p>
          </div>
        </div>
      </div>

      <div className="page-content-grid">
        {!showForm && (
          <div className="space-y-4">
            <Card className="shadow-sm">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Quick add meal type</h3>
              <div className="flex flex-wrap gap-2">
                {quickActivitiesFoodLog.map((activity) => (
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(activity.name)}
                    className="quick-add-pill"
                    key={activity.name}
                  >
                    {activity.emoji} {activity.name}
                  </button>
                ))}
              </div>
            </Card>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => setShowForm(true)}>
                <PlusIcon className="size-5" />
                Add food entry
              </Button>
              <Button className="ai-button" type="button" onClick={() => inputRef.current?.click()}>
                <SparkleIcon className="size-5" />
                AI Food Snap
              </Button>
            </div>
            <input onChange={handleImagechange} type="file" accept="image/*" hidden ref={inputRef} />
            {Loading && (
              <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-4">
                  <Loader2Icon className="size-10 text-emerald-500 animate-spin" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Analyzing your food...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {showForm && (
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">New food entry</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Food name"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v.toString() })}
                placeholder="e.g. Chicken salad"
                required
              />
              <Input
                label="Calories"
                type="number"
                value={formData.calories}
                onChange={(v) => setFormData({ ...formData, calories: Number(v) })}
                placeholder="e.g. 500"
                required
                min={1}
              />
              <Select
                label="Meal type"
                value={formData.mealType}
                onChange={(v) => setFormData({ ...formData, mealType: v.toString() })}
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
                    setShowForm(false);
                    setFormData({ name: '', calories: 0, mealType: '' });
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

        {entries.length === 0 ? (
          <Card className="empty-state-card col-span-2">
            <div className="size-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
              <UtensilsCrossedIcon className="size-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-slate-700 dark:text-slate-200 text-lg font-semibold mb-2">No food logged today</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">Start tracking your meals to stay on target with your goals</p>
          </Card>
        ) : (
          <div className="space-y-4 lg:col-span-2">
            {mealTypes.map((mealTypeKey) => {
              if (!groupedEntries[mealTypeKey]) return null;
              const MealIcon = mealIcons[mealTypeKey];
              const mealCalories = groupedEntries[mealTypeKey].reduce((sum, e) => sum + e.calories, 0);

              return (
                <Card key={mealTypeKey} className="overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-11 rounded-2xl flex items-center justify-center ${mealColors[mealTypeKey]}`}>
                        <MealIcon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white capitalize">{mealTypeKey}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{groupedEntries[mealTypeKey].length} items</p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{mealCalories} kcal</p>
                  </div>
                  <div className="space-y-2">
                    {groupedEntries[mealTypeKey].map((entry) => (
                      <div key={entry.id} className="food-entry-item">
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-200">{entry.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">{entry.calories} kcal</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 tabular-nums">{entry.calories} kcal</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(entry?.documentId || '')}
                            className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default FoodLog

