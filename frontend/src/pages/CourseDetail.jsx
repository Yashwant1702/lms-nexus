import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourses } from '@hooks/useCourses';
import { useAuth } from '@hooks/useAuth';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  Users,
  Star,
  Play,
  Check,
  Lock,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Loading,
  Tabs,
  Progress,
} from '@components/common';
import { formatDuration } from '@utils/helpers';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { currentCourse, fetchCourseById, enrollCourse, isEnrolled, isLoading } =
    useCourses();

  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseById(id);
    }
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in this course');
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      await enrollCourse(id);
      toast.success('Successfully enrolled in course!');
    } catch (error) {
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading) {
    return <Loading text="Loading course details..." />;
  }

  if (!currentCourse) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Course not found</p>
        <Link to="/courses" className="mt-4">
          <Button variant="primary">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const enrolled = isEnrolled(currentCourse._id);

  const tabs = [
    {
      label: 'Overview',
      content: <OverviewTab course={currentCourse} />,
    },
    {
      label: 'Curriculum',
      content: <CurriculumTab modules={currentCourse.modules} enrolled={enrolled} />,
    },
    {
      label: 'Instructor',
      content: <InstructorTab instructor={currentCourse.instructor} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/courses">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </Link>

      {/* Course Header */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{currentCourse.category}</Badge>
              <Badge
                variant={
                  currentCourse.level === 'beginner'
                    ? 'success'
                    : currentCourse.level === 'intermediate'
                    ? 'warning'
                    : 'danger'
                }
              >
                {currentCourse.level}
              </Badge>
              {currentCourse.status === 'published' && (
                <Badge variant="success">Published</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {currentCourse.title}
            </h1>

            <p className="text-gray-600 dark:text-gray-400">
              {currentCourse.description}
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDuration(currentCourse.duration)}
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {currentCourse.modules?.length || 0} modules
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {currentCourse.enrollmentCount || 0} enrolled
              </span>
            </div>
          </div>

          <div>
            <img
              src={currentCourse.thumbnail || '/placeholder-course.jpg'}
              alt={currentCourse.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="mt-4">
              {enrolled ? (
                <Button variant="success" fullWidth disabled>
                  <Check className="w-4 h-4 mr-2" />
                  Enrolled
                </Button>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleEnroll}
                  loading={enrolling}
                  disabled={enrolling}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Enroll Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs tabs={tabs} />
      </Card>
    </div>
  );
};

const OverviewTab = ({ course }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        What You'll Learn
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {course.learningObjectives?.map((objective, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">{objective}</span>
          </li>
        )) || (
          <li className="text-gray-500 dark:text-gray-400">
            No learning objectives specified
          </li>
        )}
      </ul>
    </div>

    {course.prerequisites && course.prerequisites.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Prerequisites
        </h3>
        <ul className="space-y-2">
          {course.prerequisites.map((prereq, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary-500">•</span>
              <span className="text-gray-700 dark:text-gray-300">{prereq}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const CurriculumTab = ({ modules, enrolled }) => (
  <div className="space-y-4">
    {modules && modules.length > 0 ? (
      modules.map((module, index) => (
        <Card key={module._id || index} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold">
                  {index + 1}
                </span>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {module.title}
                </h4>
              </div>
              {module.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
                  {module.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2 ml-11">
                <span>{module.lessons?.length || 0} lessons</span>
                <span>•</span>
                <span>{formatDuration(module.duration)}</span>
              </div>
            </div>
            {!enrolled && (
              <Lock className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </Card>
      ))
    ) : (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        No curriculum available
      </p>
    )}
  </div>
);

const InstructorTab = ({ instructor }) => {
  if (!instructor) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        No instructor information available
      </p>
    );
  }

  return (
    <div className="flex items-start gap-6">
      <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-3xl font-bold text-primary-600 dark:text-primary-400">
        {instructor.firstName?.[0]}{instructor.lastName?.[0]}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {instructor.firstName} {instructor.lastName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {instructor.role || 'Instructor'}
        </p>
        {instructor.bio && (
          <p className="text-gray-700 dark:text-gray-300">
            {instructor.bio}
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
