import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '@hooks/useCourses';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Award,
  PlayCircle,
} from 'lucide-react';
import {
  Card,
  Loading,
  EmptyState,
  Input,
  Select,
  Badge,
  Progress,
  Button,
} from '@components/common';

const MyCourses = () => {
  const { enrollments, fetchEnrollments, isLoading } = useCourses(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = enrollment.course?.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || enrollment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <Loading text="Loading your courses..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Courses
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <Link to="/courses">
          <Button variant="primary">
            <BookOpen className="w-4 h-4 mr-2" />
            Browse Courses
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Courses' },
                { value: 'active', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Courses Grid */}
      {filteredEnrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={
            searchTerm
              ? 'Try adjusting your search or filters'
              : 'Start learning by enrolling in a course'
          }
          action={() => (window.location.href = '/courses')}
          actionLabel="Browse Courses"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => (
            <CourseCard key={enrollment._id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ enrollment }) => {
  const course = enrollment.course;
  const progress = enrollment.progress?.percentageComplete || 0;

  const statusColors = {
    active: 'blue',
    completed: 'green',
    suspended: 'red',
    pending: 'yellow',
  };

  return (
    <Card hover className="group">
      <Link to={`/courses/${course._id}`}>
        <div className="relative">
          <img
            src={course.thumbnail || '/placeholder-course.jpg'}
            alt={course.title}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={statusColors[enrollment.status]}>
              {enrollment.status}
            </Badge>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {course.instructor?.firstName} {course.instructor?.lastName}
            </p>
          </div>

          <Progress value={progress} size="sm" showLabel />

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration || 0} min
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.modules?.length || 0} modules
            </span>
          </div>

          <Button variant="primary" size="sm" fullWidth>
            <PlayCircle className="w-4 h-4 mr-2" />
            Continue Learning
          </Button>
        </div>
      </Link>
    </Card>
  );
};

export default MyCourses;
