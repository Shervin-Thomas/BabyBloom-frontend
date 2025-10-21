import { SleepLog, getSleepLogsByDateRange } from './sleepLogService';

export interface BedtimeRecommendation {
  id: string;
  title: string;
  time: string;
  reason: string;
  tips: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface SleepPattern {
  averageBedtime: string;
  averageWakeTime: string;
  averageDuration: number;
  consistency: number; // 0-100, how consistent sleep times are
  totalLogs: number;
}

// Helper function to convert time string to minutes since midnight
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes since midnight to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Helper function to convert 24-hour time to 12-hour format
const formatTo12Hour = (time24: string): string => {
  if (!time24 || !time24.includes(':')) return time24;
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Calculate sleep pattern from logs
export const analyzeSleepPattern = (logs: SleepLog[]): SleepPattern | null => {
  if (!logs || logs.length === 0) {
    return null;
  }

  try {
    const validLogs = logs.filter(log => 
      log.sleep_time && 
      log.wake_time && 
      log.duration_hours > 0
    );

    if (validLogs.length === 0) {
      return null;
    }

    // Convert sleep times to minutes for averaging
    const sleepTimes = validLogs.map(log => timeToMinutes(log.sleep_time));
    const wakeTimes = validLogs.map(log => timeToMinutes(log.wake_time));
    const durations = validLogs.map(log => log.duration_hours);

    // Calculate averages
    const avgSleepMinutes = Math.round(sleepTimes.reduce((a, b) => a + b, 0) / sleepTimes.length);
    const avgWakeMinutes = Math.round(wakeTimes.reduce((a, b) => a + b, 0) / wakeTimes.length);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    // Calculate consistency (based on standard deviation of sleep times)
    const sleepTimeMean = sleepTimes.reduce((a, b) => a + b, 0) / sleepTimes.length;
    const variance = sleepTimes.reduce((a, b) => a + Math.pow(b - sleepTimeMean, 2), 0) / sleepTimes.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert standard deviation to consistency score (0-100)
    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, Math.min(100, 100 - (standardDeviation / 60) * 100));

    return {
      averageBedtime: minutesToTime(avgSleepMinutes),
      averageWakeTime: minutesToTime(avgWakeMinutes),
      averageDuration: Math.round(avgDuration * 10) / 10,
      consistency: Math.round(consistencyScore),
      totalLogs: validLogs.length
    };
  } catch (error) {
    console.error('Error analyzing sleep pattern:', error);
    return null;
  }
};

// Generate personalized bedtime recommendations based on sleep logs
export const generateBedtimeRecommendations = async (
  daysBack: number = 14
): Promise<BedtimeRecommendation[]> => {
  try {
    // Get sleep logs from the past specified days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const logs = await getSleepLogsByDateRange(startDate, endDate);
    
    if (!logs || logs.length === 0) {
      return getDefaultRecommendations();
    }

    const pattern = analyzeSleepPattern(logs);
    
    if (!pattern) {
      return getDefaultRecommendations();
    }

    const recommendations: BedtimeRecommendation[] = [];

    // Generate bedtime recommendation
    const confidence = getConfidenceLevel(pattern);
    const bedtimeRecommendation = generateBedtimeRecommendation(pattern, confidence);
    recommendations.push(bedtimeRecommendation);

    // Generate nap recommendations based on wake patterns
    const napRecommendations = generateNapRecommendations(pattern, confidence);
    recommendations.push(...napRecommendations);

    return recommendations;
  } catch (error) {
    console.error('Error generating bedtime recommendations:', error);
    return getDefaultRecommendations();
  }
};

// Determine confidence level based on data quality
const getConfidenceLevel = (pattern: SleepPattern): 'high' | 'medium' | 'low' => {
  if (pattern.totalLogs >= 10 && pattern.consistency >= 70) {
    return 'high';
  } else if (pattern.totalLogs >= 5 && pattern.consistency >= 50) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Generate bedtime recommendation from pattern
const generateBedtimeRecommendation = (
  pattern: SleepPattern, 
  confidence: 'high' | 'medium' | 'low'
): BedtimeRecommendation => {
  const bedtimeDisplay = formatTo12Hour(pattern.averageBedtime);
  
  let reason = `Based on ${pattern.totalLogs} sleep logs, ${pattern.consistency}% consistency`;
  const tips: string[] = [];

  // Adjust tips based on pattern analysis
  if (pattern.consistency >= 80) {
    tips.push('Great consistency! Maintain this schedule');
  } else if (pattern.consistency >= 60) {
    tips.push('Try to stick within 30 min of target time');
  } else {
    tips.push('Focus on building a consistent routine');
  }

  if (pattern.averageDuration < 10) {
    tips.push('Consider earlier bedtime for more sleep');
  } else if (pattern.averageDuration > 12) {
    tips.push('Current sleep duration is excellent');
  }

  tips.push('Keep bedroom dark and quiet');
  
  if (confidence === 'low') {
    reason += ' (Limited data - continue logging)';
    tips.push('Log more sleep data for better recommendations');
  }

  return {
    id: 'personalized-bedtime',
    title: 'Optimal Bedtime (Your Pattern)',
    time: bedtimeDisplay,
    reason,
    tips
  };
};

// Generate nap recommendations based on wake patterns
const generateNapRecommendations = (
  pattern: SleepPattern, 
  confidence: 'high' | 'medium' | 'low'
): BedtimeRecommendation[] => {
  const wakeMinutes = timeToMinutes(pattern.averageWakeTime);
  
  // Calculate nap windows based on wake time
  const firstNapMinutes = wakeMinutes + (2.5 * 60); // 2.5 hours after wake
  const secondNapMinutes = wakeMinutes + (6 * 60);   // 6 hours after wake

  const firstNapTime = formatTo12Hour(minutesToTime(firstNapMinutes));
  const secondNapTime = formatTo12Hour(minutesToTime(secondNapMinutes));

  const naps: BedtimeRecommendation[] = [
    {
      id: 'personalized-nap1',
      title: 'First Nap Window (Your Pattern)',
      time: firstNapTime,
      reason: `Based on your baby's ${formatTo12Hour(pattern.averageWakeTime)} average wake time`,
      tips: [
        '30-45 min power nap recommended',
        'Watch for sleepy cues around this time',
        'Keep room dark and comfortable',
      ],
      confidence
    },
    {
      id: 'personalized-nap2', 
      title: 'Second Nap Window (Your Pattern)',
      time: secondNapTime,
      reason: `Mid-day nap based on wake patterns`,
      tips: [
        '45-60 min nap if still needed',
        'Adjust based on baby\'s energy level',
        'Avoid if too close to bedtime',
      ],
      confidence
    }
  ];

  return naps;
};

// Fallback recommendations when no data is available
const getDefaultRecommendations = (): BedtimeRecommendation[] => {
  return [
    {
      id: 'default-bedtime',
      title: 'Recommended Bedtime',
      time: '8:00 PM',
      reason: 'General recommendation for babies (start logging sleep for personalized tips)',
      tips: [
        'Start tracking sleep to get personalized recommendations',
        'Consistent bedtime within 15-30 min window',
        'Helps establish circadian rhythm'
      ],
      confidence: 'low'
    },
    {
      id: 'default-nap1',
      title: 'Morning Nap Window',
      time: '10:00 AM - 10:30 AM',
      reason: 'General recommendation - log sleep data for personalized timing',
      tips: [
        '30-45 min power nap',
        'Adjust based on baby\'s morning wake time',
        'Track sleep patterns for better timing'
      ],
      confidence: 'low'
    },
    {
      id: 'default-nap2',
      title: 'Afternoon Nap Window', 
      time: '2:00 PM - 2:30 PM',
      reason: 'General recommendation - personalize with sleep tracking',
      tips: [
        '45-60 min nap recommended',
        'Monitor baby\'s energy and mood',
        'Log sleep data for custom recommendations'
      ],
      confidence: 'low'
    }
  ];
};