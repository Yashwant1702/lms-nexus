const KnowledgeBase = require('../models/KnowledgeBase');

// @desc    Create knowledge article
// @route   POST /api/knowledge
// @access  Private/Trainer/Admin
exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      relatedArticles,
      relatedCourses,
      visibility,
      allowedRoles,
      seo,
      isFeatured
    } = req.body;

    const article = await KnowledgeBase.create({
      title,
      content,
      excerpt,
      category,
      tags,
      relatedArticles,
      relatedCourses,
      author: req.user.id,
      organization: req.user.organization,
      visibility,
      allowedRoles,
      seo,
      isFeatured,
      status: 'draft',
      versions: [{
        versionNumber: 1,
        content,
        editedBy: req.user.id,
        changeLog: 'Initial version'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article }
    });

  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating article',
      error: error.message
    });
  }
};

// @desc    Get all articles
// @route   GET /api/knowledge
// @access  Public/Private
exports.getAllArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      tags = '',
      status = 'published',
      isFeatured
    } = req.query;

    const filter = {};

    // Search
    if (search) {
      filter.$text = { $search: search };
    }

    // Filters
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    // Visibility based on user role
    if (!req.user || req.user.role === 'learner') {
      filter.visibility = 'public';
      filter.status = 'published';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const articles = await KnowledgeBase.find(filter)
      .populate('author', 'firstName lastName avatar')
      .select('-versions') // Exclude version history
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ isFeatured: -1, createdAt: -1 });

    const total = await KnowledgeBase.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        articles,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles',
      error: error.message
    });
  }
};

// @desc    Get article by ID or slug
// @route   GET /api/knowledge/:identifier
// @access  Public/Private
exports.getArticle = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Try to find by ID first, then by slug
    let article = await KnowledgeBase.findById(identifier)
      .populate('author', 'firstName lastName avatar')
      .populate('relatedArticles', 'title slug')
      .populate('relatedCourses', 'title slug thumbnail');

    if (!article) {
      article = await KnowledgeBase.findOne({ slug: identifier })
        .populate('author', 'firstName lastName avatar')
        .populate('relatedArticles', 'title slug')
        .populate('relatedCourses', 'title slug thumbnail');
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check visibility permissions
    if (article.visibility === 'private') {
      if (!req.user || !article.allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this article'
        });
      }
    }

    // Increment view count
    await article.incrementViews();

    res.status(200).json({
      success: true,
      data: { article }
    });

  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching article',
      error: error.message
    });
  }
};

// @desc    Update article
// @route   PUT /api/knowledge/:id
// @access  Private/Trainer/Admin
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { changeLog, ...updates } = req.body;

    const article = await KnowledgeBase.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check permission
    if (req.user.role === 'trainer' && article.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this article'
      });
    }

    // Create version if content changed
    if (updates.content && updates.content !== article.content) {
      await article.createVersion(req.user.id, changeLog || 'Content updated');
    }

    Object.assign(article, updates);
    await article.save();

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: { article }
    });

  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating article',
      error: error.message
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/knowledge/:id
// @access  Private/Admin
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await KnowledgeBase.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting article',
      error: error.message
    });
  }
};

// @desc    Publish/Unpublish article
// @route   PUT /api/knowledge/:id/publish
// @access  Private/Trainer/Admin
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const article = await KnowledgeBase.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    article.status = status;
    if (status === 'published' && !article.publishedAt) {
      article.publishedAt = new Date();
    }
    await article.save();

    res.status(200).json({
      success: true,
      message: `Article ${status} successfully`,
      data: { article }
    });

  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating article status',
      error: error.message
    });
  }
};

// @desc    Get article version history
// @route   GET /api/knowledge/:id/versions
// @access  Private/Trainer/Admin
exports.getVersionHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await KnowledgeBase.findById(id)
      .populate('versions.editedBy', 'firstName lastName');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        currentVersion: article.currentVersion,
        versions: article.versions
      }
    });

  } catch (error) {
    console.error('Get version history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching version history',
      error: error.message
    });
  }
};

// @desc    Mark article as helpful/not helpful
// @route   POST /api/knowledge/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body; // true or false

    const article = await KnowledgeBase.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    if (helpful) {
      article.stats.helpfulCount += 1;
    } else {
      article.stats.notHelpfulCount += 1;
    }

    await article.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

// @desc    Search articles
// @route   GET /api/knowledge/search
// @access  Public/Private
exports.searchArticles = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 3 characters'
      });
    }

    const articles = await KnowledgeBase.find(
      { 
        $text: { $search: q },
        status: 'published'
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .select('title excerpt category slug')
      .populate('author', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: { articles }
    });

  } catch (error) {
    console.error('Search articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching articles',
      error: error.message
    });
  }
};

module.exports = exports;
