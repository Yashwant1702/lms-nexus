import api from './api';

export const certificateService = {
  // Get all certificates
  getMyCertificates: async (params = {}) => {
    try {
      const response = await api.get('/certificates', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get certificate by ID
  getCertificateById: async (id) => {
    try {
      const response = await api.get(`/certificates/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Download certificate
  downloadCertificate: async (id) => {
    try {
      const response = await api.get(`/certificates/${id}/download`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify certificate
  verifyCertificate: async (verificationCode) => {
    try {
      const response = await api.get(`/certificates/verify/${verificationCode}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Share certificate
  shareCertificate: async (id, platform) => {
    const certificate = await certificateService.getCertificateById(id);
    const shareUrl = `${window.location.origin}/certificates/${id}`;
    const text = `I earned a certificate for ${certificate.courseTitle}!`;

    switch (platform) {
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      default:
        // Copy link to clipboard
        navigator.clipboard.writeText(shareUrl);
    }
  },
};
