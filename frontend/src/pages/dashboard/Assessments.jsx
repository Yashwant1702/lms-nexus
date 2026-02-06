import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Award,
  Calendar,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Loading,
  EmptyState,
  Badge,
  Button,
  Tabs,
  Progress,
} from '@components/common';
import { formatDate, formatDuration } from '@utils/helpers';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch assessments from API
    setTimeout(() => {
      setIsLoading(false);
      // Mock data
      setAssessments([
        {
          _id: '1',
          title: 'React Fundamentals Quiz',
          type: 'quiz',
          course: { title: 'React Mastery', _id: 'c1' },
          status: 'available',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          duration: 30,
          totalQuestions: 20,
          passingScore: 70,
        },
        {
          _id: '2',
          title: 'JavaScript Final Exam',
          type: 'exam',
          course: { title: 'JavaScript Deep Dive', _id: 'c2' },
          status: 'completed',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          duration: 60,
          totalQuestions: 50,
          passingScore: 75,
          score: 85,
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          _id: '3',
          title: 'CSS Grid Assignment',
          type: 'assignment',
          course: { title: 'Advanced CSS', _id: 'c3' },
          status: 'overdue',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          duration: 120,
          totalQuestions: 5,
          passingScore: 60,
        },
      ]);
    }, 1000);
  }, []);

  const tabs = [
    {
      label: 'All Assessments',
      content: <AssessmentsList assessments={assessments} />,
    },
    {
      label: 'Pending',
      content: (
        <AssessmentsList
          assessments={assessments.filter((a) => a.status === 'available')}
        />
      ),
    },
    {
      label: 'Completed',
      content: (
        <AssessmentsList
          assessments={assessments.filter((a) => a.status === 'completed')}
        />
      ),
    },
    {
      label: 'Overdue',
      content: (
        <AssessmentsList
          assessments={assessments.filter((a) => a.status === 'overdue')}
        />
      ),
    },
  ];

  if (isLoading) {
    return <Loading text="Loading assessments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Assessments
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          View and complete your assessments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileCheck2 className="w-5 h-5" />}
          label="Total"
          value={assessments.length}
          color="blue"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pending"
          value={assessments.filter((a) => a.status === 'available').length}
          color="yellow"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Completed"
          value={assessments.filter((a) => a.status === 'completed').length}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Overdue"
          value={assessments.filter((a) => a.status === 'overdue').length}
          color="red"
        />
      </div>

      {/* Assessments List */}
      {assessments.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No assessments"
          description="You don't have any assessments at the moment"
        />
      ) : (
        <Card>
          <Tabs tabs={tabs} />
        </Card>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </Card>
  );
};

const AssessmentsList = ({ assessments }) => {
  if (assessments.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        No assessments found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <AssessmentCard key={assessment._id} assessment={assessment} />
      ))}
    </div>
  );
};

const AssessmentCard = ({ assessment }) => {
  const statusConfig = {
    available: {
      color: 'blue',
      label: 'Available',
      icon: <Play className="w-4 h-4" />,
    },
    completed: {
      color: 'green',
      label: 'Completed',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    overdue: {
      color: 'red',
      label: 'Overdue',
      icon: <AlertCircle className="w-4 h-4" />,
    },
  };

  const typeConfig = {
    quiz: { icon: '❓', label: 'Quiz' },
    exam: { icon: '📝', label: 'Exam' },
    assignment: { icon: '📋', label: 'Assignment' },
  };

  const status = statusConfig[assessment.status];
  const type = typeConfig[assessment.type];

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{type.icon}</span>
            <Badge variant="info" size="sm">
              {type.label}
            </Badge>
            <Badge variant={status.color} size="sm">
              {status.label}
            </Badge>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {assessment.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Course: {assessment.course.title}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(assessment.duration)}
            </span>
            <span className="flex items-center gap-1">
              <FileCheck2 className="w-3 h-3" />
              {assessment.totalQuestions} questions
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due: {formatDate(assessment.dueDate, 'short')}
            </span>
          </div>

          {assessment.status === 'completed' && assessment.score && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Your Score
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {assessment.score}%
                </span>
              </div>
              <Progress
                value={assessment.score}
                variant={
                  assessment.score >= assessment.passingScore
                    ? 'success'
                    : 'danger'
                }
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {assessment.status === 'available' && (
            <Button variant="primary" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          )}
          {assessment.status === 'completed' && (
            <Button variant="outline" size="sm">
              <Award className="w-4 h-4 mr-2" />
              Results
            </Button>
          )}
          {assessment.status === 'overdue' && (
            <Button variant="danger" size="sm" disabled>
              <AlertCircle className="w-4 h-4 mr-2" />
              Overdue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
