import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { assessmentService } from '@services/assessmentService';
import toast from 'react-hot-toast';

export const useAssessmentStore = create(
  devtools((set, get) => ({
    // State
    assessments: [],
    currentAssessment: null,
    currentAttempt: null,
    attempts: [],
    isLoading: false,
    error: null,
    timeRemaining: null,
    timerActive: false,

    // Actions
    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    setAssessments: (assessments) => set({ assessments }),

    setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),

    setCurrentAttempt: (attempt) => set({ currentAttempt: attempt }),

    setAttempts: (attempts) => set({ attempts }),

    setTimeRemaining: (time) => set({ timeRemaining: time }),

    setTimerActive: (active) => set({ timerActive: active }),

    // Fetch all assessments
    fetchAssessments: async (params = {}) => {
      set({ isLoading: true, error: null });
      try {
        const response = await assessmentService.getAllAssessments(params);
        set({ assessments: response.assessments, isLoading: false });
        return response;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to fetch assessments');
        throw error;
      }
    },

    // Fetch assessment by ID
    fetchAssessmentById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const response = await assessmentService.getAssessmentById(id);
        set({ currentAssessment: response.assessment, isLoading: false });
        return response.assessment;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to fetch assessment');
        throw error;
      }
    },

    // Start assessment attempt
    startAttempt: async (assessmentId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await assessmentService.startAttempt(assessmentId);
        
        set({
          currentAttempt: response.attempt,
          timeRemaining: response.attempt.timeLimit * 60, // Convert to seconds
          timerActive: true,
          isLoading: false,
        });

        toast.success('Assessment started! Good luck! 🍀');
        return response.attempt;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to start assessment');
        throw error;
      }
    },

    // Submit assessment attempt
    submitAttempt: async (attemptId, answers) => {
      set({ isLoading: true, error: null });
      try {
        const response = await assessmentService.submitAttempt(attemptId, answers);
        
        set({
          currentAttempt: response.attempt,
          timerActive: false,
          isLoading: false,
        });

        toast.success('Assessment submitted successfully! 🎉');
        return response.attempt;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to submit assessment');
        throw error;
      }
    },

    // Fetch user attempts
    fetchUserAttempts: async (assessmentId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await assessmentService.getUserAttempts(assessmentId);
        set({ attempts: response.attempts, isLoading: false });
        return response.attempts;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to fetch attempts');
        throw error;
      }
    },

    // Fetch attempt details
    fetchAttemptDetails: async (attemptId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await assessmentService.getAttemptDetails(attemptId);
        set({ currentAttempt: response.attempt, isLoading: false });
        return response.attempt;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to fetch attempt details');
        throw error;
      }
    },

    // Create assessment (Admin/Trainer)
    createAssessment: async (assessmentData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await assessmentService.createAssessment(assessmentData);
        
        set((state) => ({
          assessments: [response.assessment, ...state.assessments],
          isLoading: false,
        }));

        toast.success('Assessment created successfully! 📝');
        return response.assessment;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to create assessment');
        throw error;
      }
    },

    // Update assessment
    updateAssessment: async (id, assessmentData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await assessmentService.updateAssessment(id, assessmentData);
        
        set((state) => ({
          assessments: state.assessments.map((assessment) =>
            assessment._id === id ? response.assessment : assessment
          ),
          currentAssessment: state.currentAssessment?._id === id 
            ? response.assessment 
            : state.currentAssessment,
          isLoading: false,
        }));

        toast.success('Assessment updated successfully! ✅');
        return response.assessment;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to update assessment');
        throw error;
      }
    },

    // Delete assessment
    deleteAssessment: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await assessmentService.deleteAssessment(id);
        
        set((state) => ({
          assessments: state.assessments.filter((assessment) => assessment._id !== id),
          isLoading: false,
        }));

        toast.success('Assessment deleted successfully! 🗑️');
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to delete assessment');
        throw error;
      }
    },

    // Timer functions
    startTimer: () => {
      set({ timerActive: true });
      
      const interval = setInterval(() => {
        const { timeRemaining, timerActive } = get();
        
        if (!timerActive) {
          clearInterval(interval);
          return;
        }
        
        if (timeRemaining <= 0) {
          clearInterval(interval);
          set({ timerActive: false });
          toast.error('Time is up! Submitting assessment...');
          // Auto-submit logic here
          return;
        }
        
        set({ timeRemaining: timeRemaining - 1 });
      }, 1000);
    },

    stopTimer: () => {
      set({ timerActive: false });
    },

    resetTimer: () => {
      set({ timeRemaining: null, timerActive: false });
    },

    // Clear current assessment
    clearCurrentAssessment: () => {
      set({
        currentAssessment: null,
        currentAttempt: null,
        timeRemaining: null,
        timerActive: false,
      });
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);
