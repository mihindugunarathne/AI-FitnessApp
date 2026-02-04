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
import mockApi from "../assets/mockApi";
import toast from "react-hot-toast";



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
    const {data} = await mockApi.foodLogs.create({data: formData});
    setAllFoodLogs(prev => [...prev, data]);
    setFormData({name: '', calories: 0, mealType: ''});
    setShowForm(false);
  }

  const handleDelete = async (documentId: string) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this food entry?');
      if(!confirm) return;
      await mockApi.foodLogs.delete(documentId);
      setAllFoodLogs(prev => prev.filter(e => e.documentId !== documentId));
    } catch (error) {
      console.error('Error deleting food entry:', error);
      toast.error(error?.message || 'Failed to delete food entry');
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
    //Implement image analysis
  }

  useEffect(() => {
    (()=>{
      loadEntries();
    })();
  }, [allFoodLogs]);


  return (
    <div className="page-container">
      {/*Header*/}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Food Log</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your daily intake</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Today's Total</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalcalories} kcal</p>
          </div>
        </div>
      </div>

      <div className="page-content-grid">
        {/* Quick Add Section */}
        {!showForm && (
          <div className="space-y-4">
            <Card>
             <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Quick Add</h3>
             <div className="flex flex-wrap gap-2">
              {quickActivitiesFoodLog.map((activity)=>(
                <button onClick={()=>handleQuickAdd(activity.name)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 
                dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 
                dark:text-slate-200 transition-colors" 
                key={activity.name}>
                  {activity.emoji} {activity.name}
                </button>
              ))}
             </div>
            </Card>

            <Button className="w-full" onClick={()=>setShowForm(true)}>
              <PlusIcon className="size-5" />
              Add Food Entry
            </Button>
           
            <Button className="w-full" onClick={()=>inputRef.current?.click()}>
              <SparkleIcon className="size-5" />
              AI Food Snap
            </Button>
            <input onChange={handleImagechange} type="file" accept="image/*" hidden ref={inputRef} />
            {Loading && (
              <div className="fixed inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur flex
              items-center justify-center z-100">
                <Loader2Icon className="size-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <Card className="border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">New Food Entry</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input label="Food Name" value={formData.name} 
              onChange={(v)=>setFormData({...formData, name: v.toString()})} placeholder="e.g. Chicken Salad" required />
              <Input label="Calories" type="number" value={formData.calories} 
              onChange={(v)=>setFormData({...formData, calories: Number(v)})} placeholder="e.g. 500" required min={1} />     
            
              <Select label="Meal Type" value={formData.mealType} 
              onChange={(v)=>setFormData({...formData, mealType: v.toString()})} 
              options={mealTypeOptions} placeholder="Select a meal type" required />

              <div className="flex pt-2 gap-2">
                <Button className="flex-1" type="button" variant="secondary" 
                onClick={()=>{setShowForm(false); setFormData({
                  name: '',
                  calories: 0,
                  mealType: '',
                })}}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Entry
                </Button>
              </div>
            </form>
            
          </Card>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossedIcon className="size-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-slate-700 dark:text-slate-200 text-lg font-semibold mb-2">No food logged today</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Start tracking your meals to stay on target</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {mealTypes.map((mealTypeKey) => {
              if (!groupedEntries[mealTypeKey]) return null;

              const MealIcon = mealIcons[mealTypeKey];
              const mealCalories = groupedEntries[mealTypeKey].reduce(
                (sum, e) => sum + e.calories,
                0
              );

              return (
                <Card key={mealTypeKey}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mealColors[mealTypeKey]}`}>
                        <MealIcon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white capitalize">
                          {mealTypeKey}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {groupedEntries[mealTypeKey].length} items</p>
                      </div>
                    </div>
                     <p className="font-semibold text-slate-700 dark:text-slate-200">{mealCalories} kcal</p>
                  </div>
                 <div className="space-y-2">
                  {groupedEntries[mealTypeKey].map((entry)=>(
                    <div key={entry.id} className="food-entry-item">
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{entry.name}</p>
                        <p className="text-sm text-slate-400 dark:text-slate-400">{entry.calories} kcal</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 dark:text-slate-300">{entry.calories} kcal</span>
                        <button onClick={()=>handleDelete(entry?.documentId || '')}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 
                            dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <TrashIcon className="w-4 h-4" />
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
  )
}

export default FoodLog





