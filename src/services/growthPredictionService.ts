import { WHO_STANDARDS } from './whoStandards';
import { supabase } from 'lib/supabase';

interface GrowthLog {
  date: string;
  weightKg: number;
  heightCm: number;
  headCm: number;
}

interface NutritionLog {
  log_date: string;
  daily_nutrient_intake?: {
    calories?: number;
    protein?: number;
    calcium?: number;
    iron?: number;
    vitaminD?: number;
  };
  deficiencies?: string[];
}

interface GrowthPrediction {
  date: string;
  weightKg: number;
  heightCm: number;
  headCm: number;
  weightPercentile: number;
  heightPercentile: number;
  headPercentile: number;
  confidenceScore: number;
  factors: {
    nutrition: {
      calorieIntake: number;
      deficiencies: string[];
      nutritionScore: number;
    };
    consistency: {
      growthPattern: 'steady' | 'variable' | 'concerning';
      trendScore: number;
    };
    percentileTracking: {
      weightTrend: 'stable' | 'increasing' | 'decreasing';
      heightTrend: 'stable' | 'increasing' | 'decreasing';
      headTrend: 'stable' | 'increasing' | 'decreasing';
      percentileScore: number;
    };
  };
  adjustedPrediction: boolean;
  recommendations: string[];
}

interface GrowthVelocity {
  weightVelocity: number;  // kg per month
  heightVelocity: number;  // cm per month
  headVelocity: number;    // cm per month
}

export class GrowthPredictionService {
  // Calculate growth velocity based on recent logs
  private calculateVelocity(logs: GrowthLog[]): GrowthVelocity {
    if (logs.length < 2) {
      return {
        weightVelocity: 0,
        heightVelocity: 0,
        headVelocity: 0
      };
    }

    // Sort logs by date
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Use the last 3 months of data if available
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentLogs = sortedLogs.filter(log => new Date(log.date) >= threeMonthsAgo);
    const firstLog = recentLogs[0];
    const lastLog = recentLogs[recentLogs.length - 1];
    
    const monthsDiff = this.getMonthsDifference(new Date(firstLog.date), new Date(lastLog.date));
    
    if (monthsDiff === 0) return { weightVelocity: 0, heightVelocity: 0, headVelocity: 0 };
    
    return {
      weightVelocity: (lastLog.weightKg - firstLog.weightKg) / monthsDiff,
      heightVelocity: (lastLog.heightCm - firstLog.heightCm) / monthsDiff,
      headVelocity: (lastLog.headCm - firstLog.headCm) / monthsDiff
    };
  }

  // Calculate growth percentiles based on WHO standards
  private calculatePercentiles(ageMonths: number, measurements: { weight?: number; height?: number; head?: number }): {
    weightPercentile: number;
    heightPercentile: number;
    headPercentile: number;
  } {
    const standards = WHO_STANDARDS[Math.floor(ageMonths)] || WHO_STANDARDS[WHO_STANDARDS.length - 1];
    
    return {
      weightPercentile: measurements.weight ? this.calculatePercentile(measurements.weight, standards.weight) : 0,
      heightPercentile: measurements.height ? this.calculatePercentile(measurements.height, standards.height) : 0,
      headPercentile: measurements.head ? this.calculatePercentile(measurements.head, standards.head) : 0
    };
  }

  // Helper function to calculate specific percentile
  private calculatePercentile(value: number, standardData: { mean: number; sd: number }): number {
    const zScore = (value - standardData.mean) / standardData.sd;
    return this.zScoreToPercentile(zScore);
  }

  // Convert z-score to percentile using normal distribution
  private zScoreToPercentile(z: number): number {
    if (z < -3.49) return 0;
    if (z > 3.49) return 100;
    
    // Using error function approximation
    const erf = (x: number): number => {
      const t = 1.0 / (1.0 + 0.3275911 * Math.abs(x));
      const poly = 1.061405429 * t
        - 1.453152027 * Math.pow(t, 2)
        + 1.421413741 * Math.pow(t, 3)
        - 0.284496736 * Math.pow(t, 4)
        + 0.254829592 * Math.pow(t, 5);
      return x >= 0 ? poly : -poly;
    };
    
    return 50 * (1 + erf(z / Math.sqrt(2)));
  }

  // Get months difference between two dates
  private getMonthsDifference(date1: Date, date2: Date): number {
    const monthsDiff = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
    return Math.max(monthsDiff, 1); // Ensure we don't divide by zero
  }

  private async getNutritionData(userId: string, startDate: string): Promise<NutritionLog[]> {
    try {
      const { data, error } = await supabase
        .from('user_nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .order('log_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching nutrition data:', e);
      return [];
    }
  }

  private calculateNutritionScore(nutritionLogs: NutritionLog[]): {
    calorieIntake: number;
    deficiencies: string[];
    nutritionScore: number;
  } {
    if (nutritionLogs.length === 0) {
      return { calorieIntake: 0, deficiencies: [], nutritionScore: 0.5 }; // Neutral score if no data
    }

    // Calculate average calorie intake
    let totalCalories = 0;
    const allDeficiencies = new Set<string>();
    let logsWithCalories = 0;

    nutritionLogs.forEach(log => {
      if (log.daily_nutrient_intake?.calories) {
        totalCalories += log.daily_nutrient_intake.calories;
        logsWithCalories++;
      }
      if (log.deficiencies) {
        log.deficiencies.forEach(d => allDeficiencies.add(d));
      }
    });

    const avgCalorieIntake = logsWithCalories > 0 ? totalCalories / logsWithCalories : 0;
    const deficiencies = Array.from(allDeficiencies);

    // Calculate nutrition score (0 to 1)
    let nutritionScore = 1;
    // Reduce score based on deficiencies
    nutritionScore -= (deficiencies.length * 0.1);
    // Reduce score if calorie intake is too low
    if (avgCalorieIntake < 1500) nutritionScore -= 0.2;
    // Normalize score between 0 and 1
    nutritionScore = Math.max(0, Math.min(1, nutritionScore));

    return {
      calorieIntake: avgCalorieIntake,
      deficiencies,
      nutritionScore
    };
  }

  private analyzeGrowthPattern(logs: GrowthLog[]): {
    growthPattern: 'steady' | 'variable' | 'concerning';
    trendScore: number;
  } {
    if (logs.length < 2) {
      return { growthPattern: 'steady', trendScore: 0.5 };
    }

    // Calculate consistency of growth
    const weightChanges: number[] = [];
    const heightChanges: number[] = [];

    for (let i = 1; i < logs.length; i++) {
      weightChanges.push(logs[i].weightKg - logs[i-1].weightKg);
      heightChanges.push(logs[i].heightCm - logs[i-1].heightCm);
    }

    // Calculate standard deviation of changes
    const weightStdDev = this.calculateStandardDeviation(weightChanges);
    const heightStdDev = this.calculateStandardDeviation(heightChanges);

    // Determine growth pattern
    let pattern: 'steady' | 'variable' | 'concerning' = 'steady';
    let trendScore = 1;

    if (weightStdDev > 0.5 || heightStdDev > 2) {
      pattern = 'variable';
      trendScore = 0.7;
    }
    if (weightStdDev > 1 || heightStdDev > 4) {
      pattern = 'concerning';
      trendScore = 0.4;
    }

    return { growthPattern: pattern, trendScore };
  }

  private calculateStandardDeviation(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  private analyzePercentileTrends(logs: GrowthLog[], birthDate: Date): {
    weightTrend: 'stable' | 'increasing' | 'decreasing';
    heightTrend: 'stable' | 'increasing' | 'decreasing';
    headTrend: 'stable' | 'increasing' | 'decreasing';
    percentileScore: number;
  } {
    if (logs.length < 2) {
      return {
        weightTrend: 'stable',
        heightTrend: 'stable',
        headTrend: 'stable',
        percentileScore: 0.5
      };
    }

    const percentiles = logs.map(log => {
      const ageMonths = this.getMonthsDifference(birthDate, new Date(log.date));
      return this.calculatePercentiles(ageMonths, {
        weight: log.weightKg,
        height: log.heightCm,
        head: log.headCm
      });
    });

    const analyzeTrend = (values: number[]): 'stable' | 'increasing' | 'decreasing' => {
      const change = values[values.length - 1] - values[0];
      if (Math.abs(change) < 5) return 'stable';
      return change > 0 ? 'increasing' : 'decreasing';
    };

    const weightTrend = analyzeTrend(percentiles.map(p => p.weightPercentile));
    const heightTrend = analyzeTrend(percentiles.map(p => p.heightPercentile));
    const headTrend = analyzeTrend(percentiles.map(p => p.headPercentile));

    // Calculate percentile score
    let percentileScore = 1;
    if (weightTrend === 'decreasing' || heightTrend === 'decreasing') percentileScore -= 0.3;
    if (weightTrend === 'increasing' && heightTrend === 'stable') percentileScore -= 0.2;
    percentileScore = Math.max(0, Math.min(1, percentileScore));

    return {
      weightTrend,
      heightTrend,
      headTrend,
      percentileScore
    };
  }

  // Main prediction function
  public async predictGrowth(logs: GrowthLog[], birthDate: Date, userId: string, months: number = 3): Promise<GrowthPrediction[]> {
    if (logs.length === 0) return [];
    
    // Get base velocity and predictions
    const velocity = this.calculateVelocity(logs);
    const lastLog = logs[logs.length - 1];
    const predictions: GrowthPrediction[] = [];

    // Get nutrition data for the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const nutritionLogs = await this.getNutritionData(userId, threeMonthsAgo.toISOString());
    
    // Analyze growth patterns
    const nutritionAnalysis = this.calculateNutritionScore(nutritionLogs);
    const growthPattern = this.analyzeGrowthPattern(logs);
    const percentileTrends = this.analyzePercentileTrends(logs, birthDate);
    
    // Calculate overall confidence score
    const confidenceScore = (
      nutritionAnalysis.nutritionScore * 0.3 +
      growthPattern.trendScore * 0.4 +
      percentileTrends.percentileScore * 0.3
    );

    // Generate predictions with adjustments
    for (let i = 1; i <= months; i++) {
      const predictionDate = new Date(lastLog.date);
      predictionDate.setMonth(predictionDate.getMonth() + i);
      
      const ageAtPrediction = this.getMonthsDifference(birthDate, predictionDate);
      
      // Apply adjustments based on factors
      let weightAdjustment = 1;
      let heightAdjustment = 1;
      let headAdjustment = 1;

      // Adjust for nutrition
      if (nutritionAnalysis.deficiencies.length > 0) {
        weightAdjustment *= 0.95;
        heightAdjustment *= 0.97;
      }
      if (nutritionAnalysis.calorieIntake < 1500) {
        weightAdjustment *= 0.93;
      }

      // Adjust for growth pattern
      if (growthPattern.growthPattern === 'variable') {
        weightAdjustment *= 0.98;
        heightAdjustment *= 0.99;
      }

      // Calculate adjusted predictions
      const predictedWeight = lastLog.weightKg + (velocity.weightVelocity * i * weightAdjustment);
      const predictedHeight = lastLog.heightCm + (velocity.heightVelocity * i * heightAdjustment);
      const predictedHead = lastLog.headCm + (velocity.headVelocity * i * headAdjustment);
      
      const percentiles = this.calculatePercentiles(ageAtPrediction, {
        weight: predictedWeight,
        height: predictedHeight,
        head: predictedHead
      });

      // Generate recommendations
      const recommendations: string[] = [];
      if (nutritionAnalysis.deficiencies.length > 0) {
        recommendations.push(`Address nutritional deficiencies: ${nutritionAnalysis.deficiencies.join(', ')}`);
      }
      if (growthPattern.growthPattern === 'variable') {
        recommendations.push('Monitor growth more frequently due to variable growth pattern');
      }
      if (percentileTrends.weightTrend === 'decreasing') {
        recommendations.push('Consider dietary adjustments to support healthy weight gain');
      }
      
      predictions.push({
        date: predictionDate.toISOString(),
        weightKg: Number(predictedWeight.toFixed(2)),
        heightCm: Number(predictedHeight.toFixed(1)),
        headCm: Number(predictedHead.toFixed(1)),
        weightPercentile: Number(percentiles.weightPercentile.toFixed(1)),
        heightPercentile: Number(percentiles.heightPercentile.toFixed(1)),
        headPercentile: Number(percentiles.headPercentile.toFixed(1)),
        confidenceScore,
        factors: {
          nutrition: nutritionAnalysis,
          consistency: growthPattern,
          percentileTracking: percentileTrends
        },
        adjustedPrediction: weightAdjustment !== 1 || heightAdjustment !== 1 || headAdjustment !== 1,
        recommendations
      });
    }
    
    return predictions;
  }

  // Get growth status and recommendations
  public getGrowthStatus(prediction: GrowthPrediction): {
    status: 'normal' | 'monitor' | 'concern';
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let status: 'normal' | 'monitor' | 'concern' = 'normal';

    // Check weight percentile
    if (prediction.weightPercentile < 3) {
      status = 'concern';
      recommendations.push('Weight is below 3rd percentile. Consult your pediatrician for evaluation.');
    } else if (prediction.weightPercentile < 10) {
      status = 'monitor';
      recommendations.push('Weight is below 10th percentile. Monitor feeding and discuss with your healthcare provider.');
    } else if (prediction.weightPercentile > 97) {
      status = 'monitor';
      recommendations.push('Weight is above 97th percentile. Discuss growth pattern with your healthcare provider.');
    }

    // Check height percentile
    if (prediction.heightPercentile < 3) {
      status = 'concern';
      recommendations.push('Length/height is below 3rd percentile. Consult your pediatrician.');
    } else if (prediction.heightPercentile < 10) {
      status = 'monitor';
      recommendations.push('Length/height is below 10th percentile. Continue monitoring growth.');
    }

    // Check head circumference
    if (prediction.headPercentile < 3 || prediction.headPercentile > 97) {
      status = 'concern';
      recommendations.push('Head circumference needs evaluation. Schedule a check-up with your pediatrician.');
    }

    // If everything is normal
    if (recommendations.length === 0) {
      recommendations.push('Growth appears to be progressing normally. Continue regular check-ups.');
    }

    return { status, recommendations };
  }
}

export const growthPredictionService = new GrowthPredictionService();