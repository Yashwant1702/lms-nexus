import React, { useEffect, useState } from 'react';
import { Award, Download, Share2, ExternalLink } from 'lucide-react';
import {
  Card,
  Loading,
  EmptyState,
  Button,
  Badge,
} from '@components/common';
import { formatDate } from '@utils/helpers';
import toast from 'react-hot-toast';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch certificates from API
    setIsLoading(false);
    setCertificates([]);
  }, []);

  const handleDownload = (certificateId) => {
    toast.success('Certificate download started');
    // TODO: Implement download
  };

  const handleShare = (certificateId) => {
    toast.success('Certificate link copied to clipboard');
    // TODO: Implement share
  };

  if (isLoading) {
    return <Loading text="Loading certificates..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Certificates
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Your earned certificates and achievements
        </p>
      </div>

      {/* Certificates */}
      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete courses to earn certificates and showcase your achievements"
          action={() => (window.location.href = '/courses')}
          actionLabel="Browse Courses"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert._id}
              certificate={cert}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CertificateCard = ({ certificate, onDownload, onShare }) => {
  return (
    <Card hover>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {certificate.course?.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Issued {formatDate(certificate.issuedAt, 'short')}
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            Verified
          </Badge>
        </div>

        <div className="text-sm space-y-1">
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
            <span>Certificate ID:</span>
            <span className="font-mono text-xs">{certificate.certificateNumber}</span>
          </div>
          {certificate.grade && (
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
              <span>Grade:</span>
              <span className="font-semibold">{certificate.grade}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onDownload(certificate._id)}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onShare(certificate._id)}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Certificates;
