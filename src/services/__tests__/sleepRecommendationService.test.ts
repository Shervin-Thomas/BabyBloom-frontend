import {
  analyzeSleepPattern,
  generateBedtimeRecommendations,
  SleepPattern,
  BedtimeRecommendation
} from '../sleepRecommendationService';
import { SleepLog, getSleepLogsByDateRange } from '../sleepLogService';

// Mock the sleepLogService
jest.mock('../sleepLogService', () => ({
  getSleepLogsByDateRange: jest.fn()
}));

const mockGetSleepLogsByDateRange = getSleepLogsByDateRange as jest.MockedFunction<typeof getSleepLogsByDateRange>;

describe('sleepRecommendationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeSleepPattern', () => {
    // Happy Path Tests
    describe('Calculate optimal bedtime from logs', () => {
      it('should calculate correct sleep pattern from consistent logs', () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: '20:00', // 8:00 PM
            wake_time: '06:00', // 6:00 AM
            duration_hours: 10
          },
          {
            id: '2', 
            log_date: '2024-01-02',
            sleep_time: '20:30', // 8:30 PM
            wake_time: '06:30', // 6:30 AM
            duration_hours: 10
          },
          {
            id: '3',
            log_date: '2024-01-03', 
            sleep_time: '19:45', // 7:45 PM
            wake_time: '05:45', // 5:45 AM
            duration_hours: 10
          }
        ];

        const pattern = analyzeSleepPattern(mockLogs);

        expect(pattern).not.toBeNull();
        expect(pattern!.averageBedtime).toBe('20:05'); // Average of 20:00, 20:30, 19:45
        expect(pattern!.averageWakeTime).toBe('06:05'); // Average of 06:00, 06:30, 05:45
        expect(pattern!.averageDuration).toBe(10);
        expect(pattern!.totalLogs).toBe(3);
        expect(pattern!.consistency).toBeGreaterThan(80); // Should be high consistency
      });

      it('should handle single log entry', () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: '21:00',
            wake_time: '07:00', 
            duration_hours: 10
          }
        ];

        const pattern = analyzeSleepPattern(mockLogs);

        expect(pattern).not.toBeNull();
        expect(pattern!.averageBedtime).toBe('21:00');
        expect(pattern!.averageWakeTime).toBe('07:00');
        expect(pattern!.averageDuration).toBe(10);
        expect(pattern!.totalLogs).toBe(1);
        expect(pattern!.consistency).toBe(100); // Perfect consistency with one entry
      });
    });

    // Input Verification Tests
    describe('Handle empty sleep log data', () => {
      it('should return null for empty array', () => {
        const pattern = analyzeSleepPattern([]);
        expect(pattern).toBeNull();
      });

      it('should return null for null input', () => {
        const pattern = analyzeSleepPattern(null as any);
        expect(pattern).toBeNull();
      });

      it('should return null for undefined input', () => {
        const pattern = analyzeSleepPattern(undefined as any);
        expect(pattern).toBeNull();
      });
    });

    describe('Invalid time format handling', () => {
      it('should handle logs with invalid time formats', () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: 'invalid',
            wake_time: '06:00',
            duration_hours: 10
          },
          {
            id: '2',
            log_date: '2024-01-02', 
            sleep_time: '20:00',
            wake_time: 'invalid',
            duration_hours: 10
          },
          {
            id: '3',
            log_date: '2024-01-03',
            sleep_time: '20:00',
            wake_time: '06:00',
            duration_hours: 10
          }
        ];

        const pattern = analyzeSleepPattern(mockLogs);

        expect(pattern).not.toBeNull();
        expect(pattern!.totalLogs).toBe(1); // Only the valid log should be processed
        expect(pattern!.averageBedtime).toBe('20:00');
        expect(pattern!.averageWakeTime).toBe('06:00');
      });

      it('should filter out logs with zero or negative duration', () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: '20:00',
            wake_time: '06:00',
            duration_hours: 0
          },
          {
            id: '2',
            log_date: '2024-01-02',
            sleep_time: '20:00', 
            wake_time: '06:00',
            duration_hours: -1
          },
          {
            id: '3',
            log_date: '2024-01-03',
            sleep_time: '20:00',
            wake_time: '06:00', 
            duration_hours: 10
          }
        ];

        const pattern = analyzeSleepPattern(mockLogs);

        expect(pattern).not.toBeNull();
        expect(pattern!.totalLogs).toBe(1);
        expect(pattern!.averageDuration).toBe(10);
      });
    });

    // Branching Tests
    describe('Multiple sleep patterns analysis', () => {
      it('should handle inconsistent sleep patterns', () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: '19:00', // 7 PM
            wake_time: '05:00', // 5 AM
            duration_hours: 10
          },
          {
            id: '2',
            log_date: '2024-01-02',
            sleep_time: '22:00', // 10 PM 
            wake_time: '08:00', // 8 AM
            duration_hours: 10
          },
          {
            id: '3',
            log_date: '2024-01-03',
            sleep_time: '20:30', // 8:30 PM
            wake_time: '06:30', // 6:30 AM
            duration_hours: 10
          }
        ];

        const pattern = analyzeSleepPattern(mockLogs);

        expect(pattern).not.toBeNull();
        expect(pattern!.totalLogs).toBe(3);
        expect(pattern!.consistency).toBeLessThan(80); // Should be lower consistency due to variance
        expect(pattern!.averageBedtime).toBeDefined();
        expect(pattern!.averageWakeTime).toBeDefined();
      });

      it('should handle varying sleep durations correctly', () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: '20:00',
            wake_time: '06:00',
            duration_hours: 10
          },
          {
            id: '2',
            log_date: '2024-01-02',
            sleep_time: '20:00',
            wake_time: '07:30',
            duration_hours: 11.5
          },
          {
            id: '3',
            log_date: '2024-01-03',
            sleep_time: '20:00',
            wake_time: '05:30',
            duration_hours: 9.5
          }
        ];

        const pattern = analyzeSleepPattern(mockLogs);

        expect(pattern).not.toBeNull();
        expect(pattern!.averageDuration).toBeCloseTo(10.3, 1);
        expect(pattern!.consistency).toBeGreaterThan(90); // Same bedtime = high consistency
      });
    });

    // Exception Handling Tests
    describe('Exception during data processing', () => {
      it('should handle malformed log objects gracefully', () => {
        const mockLogs = [
          {}, // Empty object
          { id: '1', log_date: '2024-01-01' }, // Missing required fields
          null, // Null entry
          {
            id: '2',
            log_date: '2024-01-02',
            sleep_time: '20:00',
            wake_time: '06:00',
            duration_hours: 10
          }
        ] as SleepLog[];

        const pattern = analyzeSleepPattern(mockLogs);

        expect(pattern).not.toBeNull();
        expect(pattern!.totalLogs).toBe(1); // Only the valid log
      });

      it('should return null when all logs are invalid', () => {
        const mockLogs = [
          { id: '1', log_date: '2024-01-01' }, // Missing time fields
          { id: '2', log_date: '2024-01-02', duration_hours: 0 }, // Zero duration
          {} // Empty object
        ] as SleepLog[];

        const pattern = analyzeSleepPattern(mockLogs);
        expect(pattern).toBeNull();
      });
    });
  });

  describe('generateBedtimeRecommendations', () => {
    // Happy Path Tests  
    describe('Generate nap windows from patterns', () => {
      it('should generate personalized recommendations from good data', async () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: '20:00',
            wake_time: '06:00',
            duration_hours: 10
          },
          {
            id: '2',
            log_date: '2024-01-02',
            sleep_time: '20:15',
            wake_time: '06:15',
            duration_hours: 10
          },
          {
            id: '3',
            log_date: '2024-01-03',
            sleep_time: '19:45',
            wake_time: '05:45',
            duration_hours: 10
          }
        ];

        mockGetSleepLogsByDateRange.mockResolvedValue(mockLogs);

        const recommendations = await generateBedtimeRecommendations(7);

        expect(mockGetSleepLogsByDateRange).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String)
        );
        expect(recommendations).toHaveLength(3); // Bedtime + 2 naps
        
        const bedtimeRec = recommendations.find(r => r.id === 'personalized-bedtime');
        expect(bedtimeRec).toBeDefined();
        expect(bedtimeRec!.title).toContain('Your Pattern');
        expect(bedtimeRec!.confidence).toBeDefined();
        
        const napRecs = recommendations.filter(r => r.id.includes('nap'));
        expect(napRecs).toHaveLength(2);
        expect(napRecs[0].title).toContain('Your Pattern');
      });

      it('should calculate nap times based on wake patterns', async () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: '20:00',
            wake_time: '06:00', // 6 AM wake
            duration_hours: 10
          }
        ];

        mockGetSleepLogsByDateRange.mockResolvedValue(mockLogs);

        const recommendations = await generateBedtimeRecommendations();

        const firstNap = recommendations.find(r => r.id === 'personalized-nap1');
        const secondNap = recommendations.find(r => r.id === 'personalized-nap2');

        expect(firstNap).toBeDefined();
        expect(secondNap).toBeDefined();
        
        // First nap should be ~2.5 hours after 6 AM = 8:30 AM
        expect(firstNap!.time).toBe('8:30 AM');
        // Second nap should be ~6 hours after 6 AM = 12:00 PM  
        expect(secondNap!.time).toBe('12:00 PM');
      });
    });

    // Input Verification Tests
    describe('Insufficient data for recommendations', () => {
      it('should return default recommendations when no logs available', async () => {
        mockGetSleepLogsByDateRange.mockResolvedValue([]);

        const recommendations = await generateBedtimeRecommendations();

        expect(recommendations).toHaveLength(3);
        
        const bedtimeRec = recommendations.find(r => r.id === 'default-bedtime');
        expect(bedtimeRec).toBeDefined();
        expect(bedtimeRec!.time).toBe('8:00 PM');
        expect(bedtimeRec!.confidence).toBe('low');
        expect(bedtimeRec!.reason).toContain('start logging');
      });

      it('should handle insufficient data gracefully', async () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: 'invalid',
            wake_time: 'invalid',
            duration_hours: 0
          }
        ];

        mockGetSleepLogsByDateRange.mockResolvedValue(mockLogs);

        const recommendations = await generateBedtimeRecommendations();

        expect(recommendations).toHaveLength(3);
        expect(recommendations[0].id).toBe('default-bedtime');
        expect(recommendations[0].confidence).toBe('low');
      });
    });

    // Exception Handling Tests
    describe('Null sleep log service response', () => {
      it('should handle null response from sleep log service', async () => {
        mockGetSleepLogsByDateRange.mockResolvedValue(null as any);

        const recommendations = await generateBedtimeRecommendations();

        expect(recommendations).toHaveLength(3);
        expect(recommendations[0].id).toBe('default-bedtime');
      });

      it('should handle service errors gracefully', async () => {
        mockGetSleepLogsByDateRange.mockRejectedValue(new Error('Service error'));

        const recommendations = await generateBedtimeRecommendations();

        expect(recommendations).toHaveLength(3);
        expect(recommendations[0].id).toBe('default-bedtime');
        expect(recommendations[0].confidence).toBe('low');
      });

      it('should handle undefined response from sleep log service', async () => {
        mockGetSleepLogsByDateRange.mockResolvedValue(undefined as any);

        const recommendations = await generateBedtimeRecommendations();

        expect(recommendations).toHaveLength(3);
        expect(recommendations[0].id).toBe('default-bedtime');
      });
    });

    // Confidence Level Tests
    describe('Confidence levels based on data quality', () => {
      it('should assign high confidence for good data', async () => {
        const mockLogs: SleepLog[] = Array.from({ length: 12 }, (_, i) => ({
          id: `${i + 1}`,
          log_date: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
          sleep_time: '20:00', // Consistent time
          wake_time: '06:00',
          duration_hours: 10
        }));

        mockGetSleepLogsByDateRange.mockResolvedValue(mockLogs);

        const recommendations = await generateBedtimeRecommendations();

        const bedtimeRec = recommendations.find(r => r.id === 'personalized-bedtime');
        expect(bedtimeRec!.confidence).toBe('high');
      });

      it('should assign medium confidence for moderate data', async () => {
        const mockLogs: SleepLog[] = Array.from({ length: 6 }, (_, i) => ({
          id: `${i + 1}`,
          log_date: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
          sleep_time: i % 2 === 0 ? '20:00' : '20:30', // Some variation
          wake_time: '06:00',
          duration_hours: 10
        }));

        mockGetSleepLogsByDateRange.mockResolvedValue(mockLogs);

        const recommendations = await generateBedtimeRecommendations();

        const bedtimeRec = recommendations.find(r => r.id === 'personalized-bedtime');
        expect(bedtimeRec!.confidence).toBe('medium');
      });

      it('should assign low confidence for limited data', async () => {
        const mockLogs: SleepLog[] = [
          {
            id: '1',
            log_date: '2024-01-01',
            sleep_time: '19:00', // Very different times
            wake_time: '05:00',
            duration_hours: 10
          },
          {
            id: '2',
            log_date: '2024-01-02',
            sleep_time: '22:00',
            wake_time: '08:00',
            duration_hours: 10
          }
        ];

        mockGetSleepLogsByDateRange.mockResolvedValue(mockLogs);

        const recommendations = await generateBedtimeRecommendations();

        const bedtimeRec = recommendations.find(r => r.id === 'personalized-bedtime');
        expect(bedtimeRec!.confidence).toBe('low');
      });
    });

    // Custom days parameter test
    it('should use custom days parameter for date range', async () => {
      const customDays = 30;
      mockGetSleepLogsByDateRange.mockResolvedValue([]);

      await generateBedtimeRecommendations(customDays);

      const callArgs = mockGetSleepLogsByDateRange.mock.calls[0];
      const startDate = new Date(callArgs[0]);
      const endDate = new Date(callArgs[1]);
      const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBe(customDays);
    });
  });

  // Integration-style tests
  describe('End-to-end recommendation generation', () => {
    it('should provide actionable tips based on sleep duration', async () => {
      const shortSleepLogs: SleepLog[] = [
        {
          id: '1',
          log_date: '2024-01-01',
          sleep_time: '22:00', // Late bedtime
          wake_time: '06:00', // Early wake = short sleep
          duration_hours: 8 // Short duration
        }
      ];

      mockGetSleepLogsByDateRange.mockResolvedValue(shortSleepLogs);

      const recommendations = await generateBedtimeRecommendations();

      const bedtimeRec = recommendations.find(r => r.id === 'personalized-bedtime');
      expect(bedtimeRec!.tips.some(tip => tip.includes('earlier bedtime'))).toBe(true);
    });

    it('should acknowledge good sleep patterns', async () => {
      const goodSleepLogs: SleepLog[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        log_date: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
        sleep_time: '20:00',
        wake_time: '08:00',
        duration_hours: 12 // Good duration
      }));

      mockGetSleepLogsByDateRange.mockResolvedValue(goodSleepLogs);

      const recommendations = await generateBedtimeRecommendations();

      const bedtimeRec = recommendations.find(r => r.id === 'personalized-bedtime');
      expect(bedtimeRec!.tips.some(tip => tip.includes('excellent') || tip.includes('Great consistency'))).toBe(true);
    });
  });
});