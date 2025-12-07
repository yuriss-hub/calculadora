import { ActivityLevel } from './types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.Sedentary]: 1.2,
  [ActivityLevel.LightlyActive]: 1.375,
  [ActivityLevel.ModeratelyActive]: 1.55,
  [ActivityLevel.VeryActive]: 1.725,
  [ActivityLevel.ExtraActive]: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  [ActivityLevel.Sedentary]: 'Sedentário (Pouco ou nenhum exercício)',
  [ActivityLevel.LightlyActive]: 'Levemente Ativo (Exercício leve 1-3 dias/semana)',
  [ActivityLevel.ModeratelyActive]: 'Moderadamente Ativo (Exercício 3-5 dias/semana)',
  [ActivityLevel.VeryActive]: 'Muito Ativo (Exercício pesado 6-7 dias/semana)',
  [ActivityLevel.ExtraActive]: 'Extremamente Ativo (Trabalho físico ou treino 2x dia)',
};

export const CALORIES_PER_KG_FAT = 7700; // Approx calories to burn 1kg of fat
export const MIN_SAFE_CALORIES_MALE = 1500;
export const MIN_SAFE_CALORIES_FEMALE = 1200;
