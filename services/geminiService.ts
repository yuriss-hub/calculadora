import { GoogleGenAI } from "@google/genai";
import { CalculationResult, UserStats, Gender, ActivityLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiAdvice = async (stats: UserStats, results: CalculationResult): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Atue como um nutricionista esportivo especializado e motivador.
    
    Analise os dados deste usuário:
    - Gênero: ${stats.gender === Gender.Male ? 'Masculino' : 'Feminino'}
    - Idade: ${stats.age} anos
    - Peso Atual: ${stats.currentWeightKg.toFixed(1)} kg
    - Peso Meta: ${stats.targetWeightKg.toFixed(1)} kg
    - Nível de Atividade: ${stats.activityLevel}
    - TMB (Basal): ${Math.round(results.bmr)} kcal
    - Gasto Total Diário (TDEE): ${Math.round(results.tdee)} kcal
    - Meta de Calorias Diárias Recomendada: ${Math.round(results.dailyCalories)} kcal
    - Dias para atingir a meta: ${results.daysToGoal}

    ${results.warning ? `AVISO IMPORTANTE: O cálculo matemático original resultou em calorias muito baixas, então ajustamos para o mínimo seguro. Reforce a importância de não passar fome.` : ''}

    Forneça uma resposta em formato JSON com a seguinte estrutura (sem markdown code blocks, apenas o JSON puro):
    {
      "tip": "Uma dica curta, motivacional e científica sobre a jornada dele(a) (max 2 frases).",
      "mealPlan": "Uma ideia de café da manhã e almoço que se encaixe nessas calorias.",
      "macros": "Sugestão aproximada de divisão de macros (Proteína/Carb/Gordura) em porcentagem."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    throw new Error("Não foi possível conectar ao nutricionista virtual no momento.");
  }
};
