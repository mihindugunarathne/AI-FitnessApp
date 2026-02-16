import { ArrowLeft, ArrowRight, ScaleIcon, Target, User, ZapIcon } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import type { ProfileFormData } from "../types"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { goalOptions } from "../assets/assets"
import { ageRanges } from "../assets/assets"
import Slider from "../components/ui/Slider"
import api from "../configs/api"




const Onboarding = () => {

  const [step, setStep] = useState(1)
  const {user, setOnboardingCompleted, fetchUser} = useAppContext();
  const [formData, setFormData] = useState<ProfileFormData>({
    age: 0,
    weight: 0,
    height: 0,
    goal: "maintain",
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 400,
  })

  const totalSteps = 3;

  const updateField = (field: keyof ProfileFormData, value: string | number) => {
    setFormData({...formData, [field]: value})
  }

  const handleNext = async () => {
    if(step === 1) {
     if(!formData.age || Number(formData.age) < 13 || Number(formData.age) > 120) {
      return toast.error('Please enter a valid age (13–120)')
     }
    }
    if(step < totalSteps) {
      setStep(step + 1)
    } else {
      const userData = {
        ...formData,
        age: formData.age,
        weight: formData.weight,
        height: formData.height ? formData.height : null,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('fitness_user', JSON.stringify(userData))
      
      try {
       await api.put(`/api/users/${user?.id}`, userData)
        toast.success('Profile updated successfully')
        setOnboardingCompleted(true)
        fetchUser(user?.token || '')
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'Failed to save profile');
      }
    }
  }

  return (
    <>
      <Toaster />
      <div className="onboarding-container">
        {/* Header */}
        <div className="pt-10 pb-6 onboarding-wrapper">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ZapIcon className="size-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">FitTrack</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Let&apos;s personalize your experience</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="onboarding-wrapper mb-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="onboarding-progress-step">
                <div className="onboarding-progress-bar">
                  <div
                    className="onboarding-progress-fill"
                    style={{ width: s <= step ? '100%' : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Step {step} of {totalSteps}</p>
        </div>

        {/* Form content in card */}
        <div className="onboarding-wrapper flex-1 pb-6">
          <div className="onboarding-step-card">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center border border-teal-200/50 dark:border-teal-700/30">
                    <User className="size-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">How old are you?</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">We use this to calculate your daily calorie needs</p>
                  </div>
                </div>
                <Input
                  label="Age"
                  type="number"
                  className="max-w-md"
                  value={formData.age}
                  onChange={(v) => updateField('age', v)}
                  placeholder="e.g. 28"
                  min={13}
                  max={120}
                  required
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center border border-teal-200/50 dark:border-teal-700/30">
                    <ScaleIcon className="size-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your measurements</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Help us track your progress over time</p>
                  </div>
                </div>
                <div className="flex flex-col gap-5 max-w-md">
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={(v) => updateField('weight', v)}
                    placeholder="e.g. 70"
                    min={20}
                    max={300}
                    required
                  />
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={formData.height}
                    onChange={(v) => updateField('height', v)}
                    placeholder="Optional — e.g. 175"
                    min={100}
                    max={250}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center border border-teal-200/50 dark:border-teal-700/30">
                    <Target className="size-7 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">What is your goal?</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">We&apos;ll tailor your daily targets</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {goalOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        const age = Number(formData.age);
                        const range = ageRanges.find((r) => age <= r.max) || ageRanges[ageRanges.length - 1];
                        let intake = range.maintain;
                        let burn = range.burn;
                        if (option.value === 'lose') {
                          intake -= 400;
                          burn += 100;
                        } else if (option.value === 'gain') {
                          intake += 400;
                          burn -= 100;
                        }
                        setFormData({
                          ...formData,
                          goal: option.value as "lose" | "maintain" | "gain",
                          dailyCalorieIntake: intake,
                          dailyCalorieBurn: burn,
                        });
                      }}
                      className={`onboarding-option-btn ${formData.goal === option.value ? 'selected' : ''}`}
                    >
                      <span className="text-base font-medium text-slate-700 dark:text-slate-200">{option.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Daily targets</h3>
                  <div className="space-y-6">
                    <Slider
                      label="Daily Calorie Intake"
                      min={120}
                      max={4000}
                      step={50}
                      value={formData.dailyCalorieIntake}
                      onChange={(v) => updateField('dailyCalorieIntake', v)}
                      unit="kcal"
                      infoText="Total calories you plan to consume each day."
                    />
                    <Slider
                      label="Daily Calorie Burn"
                      min={100}
                      max={2000}
                      step={50}
                      value={formData.dailyCalorieBurn}
                      onChange={(v) => updateField('dailyCalorieBurn', v)}
                      unit="kcal"
                      infoText="Calories you aim to burn through exercise and activity."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="onboarding-wrapper pb-10 pt-2">
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={() => setStep(step > 1 ? step - 1 : 1)}
                className="max-lg:flex-1 lg:px-8"
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft className="size-5" />
                  Back
                </span>
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 lg:flex-initial lg:px-10">
              <span className="flex items-center justify-center gap-2">
                {step === totalSteps ? 'Get started' : 'Continue'}
                <ArrowRight className="size-5" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Onboarding