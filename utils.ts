import { ActivityLevel, CalculationResult, Gender, UserStats } from './types';
import { ACTIVITY_MULTIPLIERS, CALORIES_PER_KG_FAT, MIN_SAFE_CALORIES_FEMALE, MIN_SAFE_CALORIES_MALE } from './constants';

export const kgToLbs = (kg: number) => kg * 2.20462;
export const lbsToKg = (lbs: number) => lbs / 2.20462;
export const cmToFeet = (cm: number) => {
  const realFeet = (cm * 0.393701) / 12;
  const feet = Math.floor(realFeet);
  const inches = Math.round((realFeet - feet) * 12);
  return { feet, inches };
};
export const feetToCm = (feet: number, inches: number) => (feet * 12 + inches) * 2.54;

export const calculateResults = (stats: UserStats): CalculationResult => {
  // 1. Calculate BMR (Mifflin-St Jeor)
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  let bmr = (10 * stats.currentWeightKg) + (6.25 * stats.heightCm) - (5 * stats.age);
  bmr += stats.gender === Gender.Male ? 5 : -161;

  // 2. Calculate TDEE
  const tdee = bmr * ACTIVITY_MULTIPLIERS[stats.activityLevel];

  // 3. Determine Deficit logic
  const weightDiff = stats.currentWeightKg - stats.targetWeightKg;
  const totalCaloriesToBurn = weightDiff * CALORIES_PER_KG_FAT;
  
  let dailyDeficit = 0;
  let daysToGoal = 0;
  let completionDate = new Date();

  if (stats.goalType === 'target_date' && stats.targetDate) {
    const today = new Date();
    const target = new Date(stats.targetDate);
    // Difference in time
    const diffTime = Math.abs(target.getTime() - today.getTime());
    daysToGoal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysToGoal <= 0) daysToGoal = 1; // Avoid division by zero
    
    dailyDeficit = totalCaloriesToBurn / daysToGoal;
    completionDate = target;

  } else if (stats.goalType === 'weekly_rate' && stats.weeklyLossKg) {
    // Loss per week logic
    const weeklyDeficit = stats.weeklyLossKg * CALORIES_PER_KG_FAT;
    dailyDeficit = weeklyDeficit / 7;
    daysToGoal = Math.ceil(totalCaloriesToBurn / dailyDeficit);
    
    completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToGoal);
  }

  // 4. Calculate Final Calories
  // If user wants to gain weight (negative diff), we add calories. If lose, we subtract.
  // The logic above assumes weight loss (positive diff). 
  // Let's handle gain/loss generally:
  
  const isWeightLoss = stats.currentWeightKg > stats.targetWeightKg;
  const adjustedDeficit = isWeightLoss ? dailyDeficit : -dailyDeficit; // If gaining, deficit is negative (surplus)

  let dailyCalories = tdee - adjustedDeficit;

  // Safety Checks
  let warning = undefined;
  const minCalories = stats.gender === Gender.Male ? MIN_SAFE_CALORIES_MALE : MIN_SAFE_CALORIES_FEMALE;
  
  if (isWeightLoss && dailyCalories < minCalories) {
    warning = `Atenção: Sua meta exige um consumo calórico perigosamente baixo (${Math.round(dailyCalories)} kcal). Consideramos o mínimo seguro de ${minCalories} kcal.`;
    dailyCalories = minCalories;
    // Recalculate timeline based on min calories
    const maxSafeDeficit = tdee - minCalories;
    daysToGoal = Math.ceil(Math.abs(totalCaloriesToBurn) / maxSafeDeficit);
    completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToGoal);
  }

  // 5. Generate Projection Data for Chart
  const projectedData = [];
  const points = 10; // Number of points in chart
  const interval = Math.ceil(daysToGoal / points);

  for (let i = 0; i <= points; i++) {
    const dayOffset = Math.min(i * interval, daysToGoal);
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    
    // Linear progression
    const progress = dayOffset / daysToGoal;
    const projectedWeight = stats.currentWeightKg - (weightDiff * progress);
    
    projectedData.push({
      day: dayOffset,
      weight: parseFloat(projectedWeight.toFixed(1)),
      dateStr: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    });
  }
  // Ensure last point is exactly target
  if (projectedData[projectedData.length-1].weight !== stats.targetWeightKg) {
     projectedData[projectedData.length-1].weight = stats.targetWeightKg;
  }

  return {
    bmr,
    tdee,
    dailyCalories,
    daysToGoal,
    completionDate,
    weeklyDeficit: adjustedDeficit * 7,
    projectedData,
    warning
  };
};
