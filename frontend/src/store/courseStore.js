import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { courseService } from '@services/courseService';
import { enrollmentService } from '@services/enrollmentService';
import toast from 'react-hot-toast';

export const useCourseStore = create(
  devtools((set, get) => ({
    // State
    courses: [],
    currentCourse: null,
    enrollments: [],
    currentEnrollment: null,
    isLoading: false,
    error: null,
    filters: {
      search: '',
      category: '',
      level: '',
      status: '',
    },
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      pages: 0,
    },

    // Actions
    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    setCourses: (courses) => set({ courses }),

    setCurrentCourse: (course) => set({ currentCourse: course }),

    setEnrollments: (enrollments) => set({ enrollments }),

    setCurrentEnrollment: (enrollment) => set({ currentEnrollment: enrollment }),

    setFilters: (filters) => set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

    setPagination: (pagination) => set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

    // Fetch all courses
    fetchCourses: async (params = {}) => {
      set({ isLoading: true, error: null });
      try {
        const { filters, pagination } = get();
        const queryParams = {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
          ...params,
        };

        const response = await courseService.getAllCourses(queryParams);
        
        set({
          courses: response.courses,
          pagination: {
            page: response.page,
            limit: response.limit,
            total: response.total,
            pages: response.pages,
          },
          isLoading: false,
        });

        return response;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to fetch courses');
        throw error;
      }
    },

    // Fetch course by ID
    fetchCourseById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const response = await courseService.getCourseById(id);
        set({ currentCourse: response.course, isLoading: false });
        return response.course;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to fetch course');
        throw error;
      }
    },

    // Create course
    createCourse: async (courseData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await courseService.createCourse(courseData);
        
        set((state) => ({
          courses: [response.course, ...state.courses],
          isLoading: false,
        }));

        toast.success('Course created successfully! 🎉');
        return response.course;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to create course');
        throw error;
      }
    },

    // Update course
    updateCourse: async (id, courseData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await courseService.updateCourse(id, courseData);
        
        set((state) => ({
          courses: state.courses.map((course) =>
            course._id === id ? response.course : course
          ),
          currentCourse: state.currentCourse?._id === id ? response.course : state.currentCourse,
          isLoading: false,
        }));

        toast.success('Course updated successfully! ✅');
        return response.course;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to update course');
        throw error;
      }
    },

    // Delete course
    deleteCourse: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await courseService.deleteCourse(id);
        
        set((state) => ({
          courses: state.courses.filter((course) => course._id !== id),
          isLoading: false,
        }));

        toast.success('Course deleted successfully! 🗑️');
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to delete course');
        throw error;
      }
    },

    // Toggle publish
    togglePublish: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const response = await courseService.togglePublish(id);
        
        set((state) => ({
          courses: state.courses.map((course) =>
            course._id === id ? response.course : course
          ),
          currentCourse: state.currentCourse?._id === id ? response.course : state.currentCourse,
          isLoading: false,
        }));

        const status = response.course.status === 'published' ? 'published' : 'unpublished';
        toast.success(`Course ${status} successfully!`);
        return response.course;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to toggle publish status');
        throw error;
      }
    },

    // Enroll in course
    enrollCourse: async (courseId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await enrollmentService.enrollCourse(courseId);
        
        set((state) => ({
          enrollments: [response.enrollment, ...state.enrollments],
          isLoading: false,
        }));

        toast.success('Enrolled successfully! Start learning now 🚀');
        return response.enrollment;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Enrollment failed');
        throw error;
      }
    },

    // Fetch enrollments
    fetchEnrollments: async (params = {}) => {
      set({ isLoading: true, error: null });
      try {
        const response = await enrollmentService.getMyEnrollments(params);
        set({ enrollments: response.enrollments, isLoading: false });
        return response;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to fetch enrollments');
        throw error;
      }
    },

    // Fetch enrollment progress
    fetchEnrollmentProgress: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const response = await enrollmentService.getEnrollmentProgress(id);
        set({ currentEnrollment: response.enrollment, isLoading: false });
        return response.enrollment;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to fetch progress');
        throw error;
      }
    },

    // Unenroll from course
    unenrollCourse: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await enrollmentService.unenrollCourse(id);
        
        set((state) => ({
          enrollments: state.enrollments.filter((enrollment) => enrollment._id !== id),
          isLoading: false,
        }));

        toast.success('Unenrolled successfully');
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Unenrollment failed');
        throw error;
      }
    },

    // Search courses
    searchCourses: async (query) => {
      set((state) => ({
        filters: { ...state.filters, search: query },
      }));
      await get().fetchCourses();
    },

    // Filter by category
    filterByCategory: async (category) => {
      set((state) => ({
        filters: { ...state.filters, category },
      }));
      await get().fetchCourses();
    },

    // Filter by level
    filterByLevel: async (level) => {
      set((state) => ({
        filters: { ...state.filters, level },
      }));
      await get().fetchCourses();
    },

    // Reset filters
    resetFilters: () => {
      set({
        filters: {
          search: '',
          category: '',
          level: '',
          status: '',
        },
      });
      get().fetchCourses();
    },

    // Change page
    changePage: async (page) => {
      set((state) => ({
        pagination: { ...state.pagination, page },
      }));
      await get().fetchCourses();
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);
