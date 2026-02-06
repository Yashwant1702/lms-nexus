const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @desc    Create assessment
// @route   POST /api/assessments
// @access  Private/Trainer/Admin
exports.createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      module,
      lesson,
      assessmentType,
      questions,
      settings,
      availability
    } = req.body;

    const assessment = await Assessment.create({
      title,
      description,
      course,
      module,
      lesson,
      assessmentType,
      questions,
      settings,
      availability,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: { assessment }
    });

  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assessment',
      error: error.message
    });
  }
};

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private
exports.getAllAssessments = async (req, res) => {
  try {
    const { courseId, isPublished } = req.query;

    const filter = {};
    if (courseId) filter.course = courseId;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

    const assessments = await Assessment.find(filter)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { assessments }
    });

  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessments',
      error: error.message
    });
  }
};

// @desc    Get assessment by ID (without answers for learners)
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Remove correct answers for learners
    if (req.user.role === 'learner') {
      const sanitizedQuestions = assessment.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options.map(opt => ({ text: opt.text })), // Remove isCorrect
        points: q.points,
        order: q.order
      }));

      const sanitizedAssessment = assessment.toObject();
      sanitizedAssessment.questions = sanitizedQuestions;

      return res.status(200).json({
        success: true,
        data: { assessment: sanitizedAssessment }
      });
    }

    res.status(200).json({
      success: true,
      data: { assessment }
    });

  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessment',
      error: error.message
    });
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private/Trainer/Admin
exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check permission
    if (req.user.role === 'trainer' && assessment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assessment'
      });
    }

    Object.assign(assessment, updates);
    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: { assessment }
    });

  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assessment',
      error: error.message
    });
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private/Trainer/Admin
exports.deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check permission
    if (req.user.role === 'trainer' && assessment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assessment'
      });
    }

    // Delete all attempts
    await AssessmentAttempt.deleteMany({ assessment: id });

    await assessment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assessment',
      error: error.message
    });
  }
};

// @desc    Start assessment attempt
// @route   POST /api/assessments/:id/attempt
// @access  Private/Learner
exports.startAttempt = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: assessment.course,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to take this assessment'
      });
    }

    // Count existing attempts
    const attemptCount = await AssessmentAttempt.countDocuments({
      assessment: id,
      user: req.user.id
    });

    // Check if can attempt
    if (!assessment.canAttempt(attemptCount)) {
      return res.status(403).json({
        success: false,
        message: 'You have reached the maximum number of attempts or assessment is not available'
      });
    }

    // Create attempt
    const attempt = await AssessmentAttempt.create({
      assessment: id,
      user: req.user.id,
      enrollment: enrollment._id,
      attemptNumber: attemptCount + 1,
      score: {
        pointsEarned: 0,
        totalPoints: assessment.totalPoints,
        percentage: 0
      },
      startedAt: new Date()
    });

    // Update stats
    assessment.stats.totalAttempts += 1;
    await assessment.save();

    res.status(201).json({
      success: true,
      message: 'Assessment attempt started',
      data: { attempt }
    });

  } catch (error) {
    console.error('Start attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting assessment attempt',
      error: error.message
    });
  }
};

// @desc    Submit assessment attempt
// @route   POST /api/assessments/attempts/:attemptId/submit
// @access  Private/Learner
exports.submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedOption, answerText }

    const attempt = await AssessmentAttempt.findById(attemptId)
      .populate('assessment');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Assessment attempt not found'
      });
    }

    // Check permission
    if (attempt.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this attempt'
      });
    }

    // Check if already submitted
    if (attempt.status === 'submitted' || attempt.status === 'evaluated') {
      return res.status(400).json({
        success: false,
        message: 'This attempt has already been submitted'
      });
    }

    const assessment = attempt.assessment;

    // Evaluate answers
    const evaluatedAnswers = answers.map(ans => {
      const question = assessment.questions.id(ans.questionId);
      
      if (!question) {
        return {
          questionId: ans.questionId,
          selectedOption: ans.selectedOption,
          answerText: ans.answerText,
          isCorrect: false,
          pointsEarned: 0
        };
      }

      let isCorrect = false;
      let pointsEarned = 0;

      if (question.questionType === 'multiple_choice') {
        const selectedOpt = question.options.find(opt => opt.text === ans.selectedOption);
        isCorrect = selectedOpt && selectedOpt.isCorrect;
      } else if (question.questionType === 'true_false') {
        isCorrect = ans.answerText.toLowerCase() === question.correctAnswer.toLowerCase();
      } else if (question.questionType === 'short_answer') {
        // Manual evaluation needed
        isCorrect = null;
      }

      if (isCorrect) {
        pointsEarned = question.points;
      }

      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        answerText: ans.answerText,
        isCorrect,
        pointsEarned
      };
    });

    attempt.answers = evaluatedAnswers;
    attempt.submittedAt = new Date();
    
    // Calculate time spent
    attempt.timeSpent = Math.floor((attempt.submittedAt - attempt.startedAt) / 1000);

    // Calculate score
    attempt.calculateScore();

    // Check if passed
    attempt.passed = attempt.score.percentage >= assessment.settings.passingScore;

    attempt.status = evaluatedAnswers.some(a => a.isCorrect === null) ? 'submitted' : 'evaluated';

    await attempt.save();

    // Update enrollment
    const enrollment = await Enrollment.findById(attempt.enrollment);
    enrollment.assessmentResults.push({
      assessment: assessment._id,
      score: attempt.score.percentage,
      passed: attempt.passed,
      attemptNumber: attempt.attemptNumber,
      completedAt: attempt.submittedAt
    });
    await enrollment.save();

    // Award points
    if (attempt.passed) {
      const user = await User.findById(req.user.id);
      user.points += 50; // 50 points for passing assessment
      await user.save();

      // Check for badges
      const { checkAndAwardBadges } = require('../services/gamificationService');
      await checkAndAwardBadges(req.user.id);
    }

    // Send notification
    await createNotification({
      recipient: req.user.id,
      type: 'assessment_graded',
      title: 'Assessment Completed',
      message: `You ${attempt.passed ? 'passed' : 'did not pass'} the assessment with a score of ${attempt.score.percentage}%`,
      relatedEntity: {
        entityType: 'assessment',
        entityId: assessment._id
      }
    });

    // Update assessment stats
    const allAttempts = await AssessmentAttempt.find({ 
      assessment: assessment._id,
      status: 'evaluated'
    });
    
    if (allAttempts.length > 0) {
      const avgScore = allAttempts.reduce((sum, a) => sum + a.score.percentage, 0) / allAttempts.length;
      const passedCount = allAttempts.filter(a => a.passed).length;
      
      assessment.stats.averageScore = Math.round(avgScore);
      assessment.stats.passRate = Math.round((passedCount / allAttempts.length) * 100);
      await assessment.save();
    }

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        attempt: {
          id: attempt._id,
          score: attempt.score,
          passed: attempt.passed,
          answers: assessment.settings.showCorrectAnswers ? attempt.answers : undefined
        }
      }
    });

  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assessment',
      error: error.message
    });
  }
};

// @desc    Get user's attempts for an assessment
// @route   GET /api/assessments/:id/attempts
// @access  Private
exports.getUserAttempts = async (req, res) => {
  try {
    const { id } = req.params;

    const attempts = await AssessmentAttempt.find({
      assessment: id,
      user: req.user.id
    }).sort({ attemptNumber: -1 });

    res.status(200).json({
      success: true,
      data: { attempts }
    });

  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attempts',
      error: error.message
    });
  }
};

// @desc    Get attempt details
// @route   GET /api/assessments/attempts/:attemptId
// @access  Private
exports.getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await AssessmentAttempt.findById(attemptId)
      .populate('assessment')
      .populate('user', 'firstName lastName email');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Check permission
    if (req.user.role === 'learner' && attempt.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this attempt'
      });
    }

    res.status(200).json({
      success: true,
      data: { attempt }
    });

  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attempt details',
      error: error.message
    });
  }
};

module.exports = exports;
