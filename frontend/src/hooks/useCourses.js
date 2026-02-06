import { useCourseStore } from '@store/courseStore';
import { useEffect } from 'react';

export const useCourses = (autoFetch = true) => {
  const {
    courses,
    currentCourse,
    enrollments,
    currentEnrollment,
    isLoading,
    error,
    filters,
    pagination,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    togglePublish,
    enrollCourse,
    fetchEnrollments,
    fetchEnrollmentProgress,
    unenrollCourse,
    searchCourses,
    filterByCategory,
    filterByLevel,
    resetFilters,
    changePage,
    setFilters,
    clearError,
  } = useCourseStore();

  // Auto-fetch courses on mount
  useEffect(() => {
    if (autoFetch && courses.length === 0) {
      fetchCourses();
    }
  }, [autoFetch]);

  // Get enrolled course IDs
  const enrolledCourseIds = enrollments.map((e) => e.course?._id || e.course);

  // Check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrolledCourseIds.includes(courseId);
  };

  // Get enrollment by course ID
  const getEnrollmentByCourseId = (courseId) => {
    return enrollments.find((e) => (e.course?._id || e.course) === courseId);
  };

  // Get course progress
  const getCourseProgress = (courseId) => {
    const enrollment = getEnrollmentByCourseId(courseId);
    return enrollment?.progress?.percentageComplete || 0;
  };

  return {
    courses,
    currentCourse,
    enrollments,
    currentEnrollment,
    isLoading,
    error,
    filters,
    pagination,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    togglePublish,
    enrollCourse,
    fetchEnrollments,
    fetchEnrollmentProgress,
    unenrollCourse,
    searchCourses,
    filterByCategory,
    filterByLevel,
    resetFilters,
    changePage,
    setFilters,
    clearError,
    isEnrolled,
    getEnrollmentByCourseId,
    getCourseProgress,
    enrolledCourseIds,
  };
};
