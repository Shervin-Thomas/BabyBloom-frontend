import { profileService, Profile } from '../profile';
import { supabase } from '../supabase';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}));

const mockSupabase = supabase as any;

describe('profileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile: Profile = {
        id: 'test-id',
        full_name: 'Test User',
        phone: '1234567890',
        date_of_birth: '1990-01-01',
        user_role: 'user',
        avatar_url: 'test-avatar.png',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const result = await profileService.getProfile('test-id');
      
      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should return null on error', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile not found' }
            })
          })
        })
      });

      const result = await profileService.getProfile('test-id');
      
      expect(result).toBeNull();
    });

    it('should handle PGRST116 error gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { 
                code: 'PGRST116',
                message: 'JSON object requested, multiple (or no) rows returned'
              }
            })
          })
        })
      });

      const result = await profileService.getProfile('test-id');
      
      expect(result).toBeNull();
    });
  });

  describe('getOrCreateProfile', () => {
    it('should return existing profile if found', async () => {
      const mockProfile: Profile = {
        id: 'test-id',
        full_name: 'Test User',
        user_role: 'user',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      // Mock successful profile fetch
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const result = await profileService.getOrCreateProfile('test-id');
      
      expect(result).toEqual(mockProfile);
    });

    it('should create new profile if not found', async () => {
      // Mock profile not found initially
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          })
        })
        // Mock successful insert
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
        // Mock successful fetch after creation
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'test-id',
                  full_name: 'Test User',
                  user_role: 'admin',
                  is_active: true,
                  created_at: '2023-01-01T00:00:00Z',
                  updated_at: '2023-01-01T00:00:00Z'
                },
                error: null
              })
            })
          })
        });

      // Mock auth user data
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'test-id',
            user_metadata: {
              full_name: 'Test User',
              phone: '1234567890',
              user_role: 'admin'
            }
          }
        },
        error: null
      });

      const result = await profileService.getOrCreateProfile('test-id');
      
      expect(result).toBeTruthy();
      expect(result?.user_role).toBe('admin');
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('should handle auth error gracefully', async () => {
      // Mock profile not found
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      });

      // Mock auth error
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found' }
      });

      const result = await profileService.getOrCreateProfile('test-id');
      
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      });

      const result = await profileService.updateProfile('test-id', { 
        full_name: 'Updated Name' 
      });
      
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should return false on error', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Update failed' }
          })
        })
      });

      const result = await profileService.updateProfile('test-id', { 
        full_name: 'Updated Name' 
      });
      
      expect(result).toBe(false);
    });
  });

  describe('createProfile', () => {
    it('should create profile successfully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      });

      const newProfile = {
        id: 'test-id',
        full_name: 'Test User',
        user_role: 'user' as const,
        is_active: true
      };

      const result = await profileService.createProfile(newProfile);
      
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should return false on error', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' }
        })
      });

      const newProfile = {
        id: 'test-id',
        full_name: 'Test User',
        user_role: 'user' as const,
        is_active: true
      };

      const result = await profileService.createProfile(newProfile);
      
      expect(result).toBe(false);
    });
  });
});