import React, { useState } from 'react';
import { CalculationResult, UserStats, UnitSystem } from '../types';
import { kgToLbs } from '../utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getAiAdvice } from '../services/geminiService';

interface Props {
  results: CalculationResult;
  userStats: UserStats;
  unitSystem: UnitSystem;
}

const ResultsSection: React.FC<Props> = ({ results, userStats, unitSystem }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<{ tip: string; mealPlan: string; macros: string } | null>(null);

  const displayWeight = (kg: number) => {
    if (unitSystem === UnitSystem.Imperial) {
      return `${kgToLbs(kg).toFixed(1)} lbs`;
    }
    return `${kg.toFixed(1)} kg`;
  };

  const handleGetAdvice = async () => {
    setAiLoading(true);
    try {
      const jsonStr = await getAiAdvice(userStats, results);
      const data = JSON.parse(jsonStr);
      setAiData(data);
    } catch (e) {
      alert("Erro ao consultar IA. Verifique sua conexão.");
    } finally {
      setAiLoading(false);
    }
  };

  const isLoss = userStats.currentWeightKg > userStats.targetWeightKg;
  const color = isLoss ? "#10b981" : "#3b82f6"; // Green for loss, Blue for gain

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-8 border border-gray-100 animate-fade-in">
      <div className="bg-slate-800 p-6 text-white text-center">
        <h2 className="text-2xl font-bold">Seu Plano Personalizado</h2>
        <p className="text-slate-300">Baseado em seus dados e meta</p>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
            <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Calorias Diárias</p>
            <p className="text-4xl font-bold text-slate-800 mt-2">{Math.round(results.dailyCalories)}</p>
            <p className="text-xs text-slate-500 mt-1">Para atingir a meta</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
            <p className="text-sm text-green-600 font-semibold uppercase tracking-wider">Data Estimada</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-800 mt-2 truncate">
              {results.completionDate.toLocaleDateString('pt-BR')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Duração: {results.daysToGoal} dias</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
            <p className="text-sm text-orange-600 font-semibold uppercase tracking-wider">Gasto Total (TDEE)</p>
            <p className="text-4xl font-bold text-slate-800 mt-2">{Math.round(results.tdee)}</p>
            <p className="text-xs text-slate-500 mt-1">Kcal manutenção</p>
          </div>
        </div>

        {results.warning && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{results.warning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-64 md:h-80 w-full">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Projeção de Progresso</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={results.projectedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateStr" stroke="#94a3b8" fontSize={12} tickMargin={10} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} unit={unitSystem === UnitSystem.Metric ? 'kg' : 'lbs'} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                formatter={(value: number) => [unitSystem === UnitSystem.Imperial ? kgToLbs(value).toFixed(1) : value, unitSystem === UnitSystem.Metric ? 'kg' : 'lbs']}
              />
              <ReferenceLine y={userStats.targetWeightKg} stroke="red" strokeDasharray="3 3" label="Meta" />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke={color} 
                strokeWidth={3} 
                dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Section */}
        <div className="border-t border-gray-200 pt-8">
          {!aiData ? (
            <div className="text-center">
              <button
                onClick={handleGetAdvice}
                disabled={aiLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2"
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gerando Análise IA...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    Receber Dica do Coach IA
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 mt-2">Powered by Gemini 2.5 Flash</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <div className="flex items-center gap-2 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                 <h4 className="font-bold text-indigo-900 text-lg">Dica do Coach</h4>
              </div>
             
              <p className="text-slate-700 italic mb-4">"{aiData.tip}"</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-indigo-600 text-sm uppercase mb-2">Sugestão de Refeições</h5>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{aiData.mealPlan}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-indigo-600 text-sm uppercase mb-2">Macros Recomendados</h5>
                  <p className="text-sm text-slate-600">{aiData.macros}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResultsSection;
