import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '@hooks/useCourses';
import { useDebounce } from '@hooks/useDebounce';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Star,
  Users,
  TrendingUp,
  Award,
  X,
} from 'lucide-react';
import {
  Card,
  Input,
  Select,
  EmptyState,
  Button,
  Badge,
  Loading,
} from '@components/common';
import { COURSE_CATEGORIES, COURSE_LEVELS } from '@utils/constants';

const Courses = () => {
  const { courses, isLoading, fetchCourses, filters, setFilters } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setFilters({
      search: debouncedSearch,
      category: selectedCategory,
      level: selectedLevel,
    });
  }, [debouncedSearch, selectedCategory, selectedLevel]);

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = debouncedSearch
      ? course.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        course.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true;

    const matchesCategory = selectedCategory
      ? course.category === selectedCategory
      : true;

    const matchesLevel = selectedLevel
      ? course.level === selectedLevel
      : true;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLevel('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedLevel;

  if (isLoading) {
    return <Loading text="Loading courses..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Course Catalog
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="primary" size="sm" className="ml-2">
              {[searchTerm, selectedCategory, selectedLevel].filter(Boolean).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...COURSE_CATEGORIES.map((cat) => ({
                    value: cat.value,
                    label: `${cat.icon} ${cat.label}`,
                  })),
                ]}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                options={[
                  { value: '', label: 'All Levels' },
                  ...COURSE_LEVELS.map((level) => ({
                    value: level.value,
                    label: level.label,
                  })),
                ]}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap">
                {searchTerm && (
                  <FilterTag
                    label={`Search: "${searchTerm}"`}
                    onRemove={() => setSearchTerm('')}
                  />
                )}
                {selectedCategory && (
                  <FilterTag
                    label={`Category: ${
                      COURSE_CATEGORIES.find((c) => c.value === selectedCategory)
                        ?.label
                    }`}
                    onRemove={() => setSelectedCategory('')}
                  />
                )}
                {selectedLevel && (
                  <FilterTag
                    label={`Level: ${
                      COURSE_LEVELS.find((l) => l.value === selectedLevel)?.label
                    }`}
                    onRemove={() => setSelectedLevel('')}
                  />
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'No courses available at the moment'
          }
          action={hasActiveFilters ? handleClearFilters : undefined}
          actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course }) => {
  return (
    <Link to={`/courses/${course._id}`}>
      <Card hover className="h-full group">
        <div className="relative">
          <img
            src={course.thumbnail || '/placeholder-course.jpg'}
            alt={course.title}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          {course.level && (
            <div className="absolute top-2 right-2">
              <Badge
                variant={
                  course.level === 'beginner'
                    ? 'success'
                    : course.level === 'intermediate'
                    ? 'warning'
                    : 'danger'
                }
              >
                {course.level}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            {course.category && (
              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                {COURSE_CATEGORIES.find((c) => c.value === course.category)?.icon}{' '}
                {COURSE_CATEGORIES.find((c) => c.value === course.category)?.label}
              </span>
            )}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mt-1">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration || 0} min
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.modules?.length || 0} modules
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.enrollmentCount || 0}
            </span>
          </div>

          {course.instructor && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                By {course.instructor.firstName} {course.instructor.lastName}
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

const FilterTag = ({ label, onRemove }) => (
  <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md text-xs">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded p-0.5"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

export default Courses;
