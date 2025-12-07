import React, { useState, useEffect } from 'react';
import { 
  ActivityLevel, 
  Gender, 
  GoalType, 
  UnitSystem, 
  UserStats, 
  CalculationResult 
} from './types';
import { ACTIVITY_LABELS } from './constants';
import { calculateResults, kgToLbs, lbsToKg, cmToFeet, feetToCm } from './utils';
import ResultsSection from './components/ResultsSection';

const App: React.FC = () => {
  // --- State ---
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.Metric);
  
  // Storing core data in metric for consistency logic
  const [gender, setGender] = useState<Gender>(Gender.Male);
  const [age, setAge] = useState<number>(30);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(80);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(ActivityLevel.ModeratelyActive);
  const [goalType, setGoalType] = useState<GoalType>(GoalType.TargetDate);
  const [targetDate, setTargetDate] = useState<string>('');
  const [weeklyLossKg, setWeeklyLossKg] = useState<number>(0.5);

  const [result, setResult] = useState<CalculationResult | null>(null);

  // --- Helpers for Dual Input (Imperial/Metric) ---
  
  // Height Display helpers
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(9);

  // Weight Display helpers
  const [currentWeightLbs, setCurrentWeightLbs] = useState(176);
  const [targetWeightLbs, setTargetWeightLbs] = useState(154);
  const [weeklyLossLbs, setWeeklyLossLbs] = useState(1);

  // Initialize Default Date (3 months from now)
  useEffect(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    setTargetDate(d.toISOString().split('T')[0]);
  }, []);

  // Sync Imperial Inputs when Unit System changes or Metric Values change
  useEffect(() => {
    if (unitSystem === UnitSystem.Imperial) {
      const { feet, inches } = cmToFeet(heightCm);
      setHeightFeet(feet);
      setHeightInches(inches);
      setCurrentWeightLbs(parseFloat(kgToLbs(currentWeightKg).toFixed(1)));
      setTargetWeightLbs(parseFloat(kgToLbs(targetWeightKg).toFixed(1)));
      setWeeklyLossLbs(parseFloat(kgToLbs(weeklyLossKg).toFixed(1)));
    }
  }, [unitSystem, heightCm, currentWeightKg, targetWeightKg, weeklyLossKg]);

  const handleCalculate = () => {
    const stats: UserStats = {
      gender,
      age,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      activityLevel,
      goalType,
      targetDate: goalType === GoalType.TargetDate ? targetDate : undefined,
      weeklyLossKg: goalType === GoalType.WeeklyRate ? weeklyLossKg : undefined,
    };
    
    const res = calculateResults(stats);
    setResult(res);
  };

  // Input Handlers
  const handleImperialHeightChange = (ft: number, inc: number) => {
    setHeightFeet(ft);
    setHeightInches(inc);
    setHeightCm(feetToCm(ft, inc));
  };

  const handleWeightChange = (val: number, type: 'current' | 'target' | 'weekly') => {
    if (unitSystem === UnitSystem.Metric) {
      if (type === 'current') setCurrentWeightKg(val);
      if (type === 'target') setTargetWeightKg(val);
      if (type === 'weekly') setWeeklyLossKg(val);
    } else {
      const kg = lbsToKg(val);
      if (type === 'current') { setCurrentWeightLbs(val); setCurrentWeightKg(kg); }
      if (type === 'target') { setTargetWeightLbs(val); setTargetWeightKg(kg); }
      if (type === 'weekly') { setWeeklyLossLbs(val); setWeeklyLossKg(kg); }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center items-start">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Fit<span className="text-blue-600">Calc</span> Pro
          </h1>
          <p className="text-slate-500 mt-2">Calculadora de Perda de Peso & Nutrição Inteligente</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Unit Toggle Toolbar */}
          <div className="bg-slate-50 border-b border-gray-200 p-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Configuração</span>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setUnitSystem(UnitSystem.Metric)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  unitSystem === UnitSystem.Metric 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Métrico (kg/cm)
              </button>
              <button
                onClick={() => setUnitSystem(UnitSystem.Imperial)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  unitSystem === UnitSystem.Imperial 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Imperial (lbs/ft)
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {/* Gender & Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gênero</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${gender === Gender.Male ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="gender" className="hidden" checked={gender === Gender.Male} onChange={() => setGender(Gender.Male)} />
                    <span className="font-medium">Masculino</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${gender === Gender.Female ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="gender" className="hidden" checked={gender === Gender.Female} onChange={() => setGender(Gender.Female)} />
                    <span className="font-medium">Feminino</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Idade</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Height */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Altura</label>
                {unitSystem === UnitSystem.Metric ? (
                  <div className="relative">
                    <input 
                      type="number" 
                      value={heightCm} 
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 text-sm">cm</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="number" 
                        value={heightFeet} 
                        onChange={(e) => handleImperialHeightChange(Number(e.target.value), heightInches)}
                        className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                      <span className="absolute right-3 top-3.5 text-gray-400 text-sm">ft</span>
                    </div>
                    <div className="relative flex-1">
                      <input 
                        type="number" 
                        value={heightInches} 
                        onChange={(e) => handleImperialHeightChange(heightFeet, Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                      <span className="absolute right-3 top-3.5 text-gray-400 text-sm">in</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Weight */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Peso Atual</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={unitSystem === UnitSystem.Metric ? currentWeightKg : currentWeightLbs}
                    onChange={(e) => handleWeightChange(Number(e.target.value), 'current')}
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 text-sm">
                    {unitSystem === UnitSystem.Metric ? 'kg' : 'lbs'}
                  </span>
                </div>
              </div>

              {/* Target Weight */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Peso Alvo</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={unitSystem === UnitSystem.Metric ? targetWeightKg : targetWeightLbs}
                    onChange={(e) => handleWeightChange(Number(e.target.value), 'target')}
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 text-sm">
                    {unitSystem === UnitSystem.Metric ? 'kg' : 'lbs'}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nível de Atividade Diária</label>
              <select 
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white outline-none"
              >
                {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Goal Setting */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
               <label className="block text-sm font-semibold text-slate-700 mb-3">Definição da Meta</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <select 
                       value={goalType}
                       onChange={(e) => setGoalType(e.target.value as GoalType)}
                       className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white mb-2"
                     >
                       <option value={GoalType.TargetDate}>Quero atingir a meta até uma data</option>
                       <option value={GoalType.WeeklyRate}>Quero perder X por semana</option>
                     </select>
                  </div>
                  
                  <div>
                    {goalType === GoalType.TargetDate ? (
                       <input 
                         type="date" 
                         value={targetDate}
                         onChange={(e) => setTargetDate(e.target.value)}
                         className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                       />
                    ) : (
                      <div className="relative">
                        <input 
                          type="number"
                          step="0.1"
                          value={unitSystem === UnitSystem.Metric ? weeklyLossKg : weeklyLossLbs}
                          onChange={(e) => handleWeightChange(Number(e.target.value), 'weekly')}
                          className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute right-4 top-3.5 text-gray-400 text-sm">
                          {unitSystem === UnitSystem.Metric ? 'kg / semana' : 'lbs / semana'}
                        </span>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* CTA */}
            <button 
              onClick={handleCalculate}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg transform hover:-translate-y-0.5"
            >
              CALCULAR PLANO
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <ResultsSection 
            results={result} 
            userStats={{
              gender, age, heightCm, currentWeightKg, targetWeightKg, activityLevel, goalType, targetDate
            }}
            unitSystem={unitSystem}
          />
        )}
      </div>
    </div>
  );
};

export default App;
