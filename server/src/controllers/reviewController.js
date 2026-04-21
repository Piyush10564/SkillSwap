import Review from '../models/Review.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { CREDIT_RULES, TRANSACTION_DESCRIPTIONS } from '../config/creditRules.js';

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
export const createReview = async (req, res, next) => {
  try {
    const { receiverId, sessionId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    // Validate required fields
    if (!receiverId || !sessionId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiverId, sessionId, and rating',
      });
    }

    // Check if review already exists for this session
    const existingReview = await Review.findOne({
      reviewerId,
      receiverId,
      sessionId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this user for this session',
      });
    }

    // Create review
    const review = await Review.create({
      reviewerId,
      receiverId,
      sessionId,
      rating,
      comment: comment || '',
    });

    // Update receiver's average rating
    const reviews = await Review.find({ receiverId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const receiver = await User.findByIdAndUpdate(
      receiverId,
      {
        averageRating: avgRating,
        totalReviews: reviews.length,
      },
      { new: true }
    );

    // Award bonus credits if positive review (4-5 stars)
    if (rating >= CREDIT_RULES.POSITIVE_REVIEW_THRESHOLD && receiver) {
      receiver.credits += CREDIT_RULES.POSITIVE_REVIEW_EARNED;
      await receiver.save();

      // Create transaction record
      await Transaction.create({
        userId: receiverId,
        type: 'earn',
        credits: CREDIT_RULES.POSITIVE_REVIEW_EARNED,
        sessionId,
        description: TRANSACTION_DESCRIPTIONS.positive_review,
        balance: receiver.credits,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get all reviews for a user
 * @access  Public
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const reviews = await Review.find({ receiverId: userId })
      .populate('reviewerId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalCount = await Review.countDocuments({ receiverId: userId });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reviews/session/:sessionId
 * @desc    Get reviews for a specific session
 * @access  Public
 */
export const getSessionReviews = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const reviews = await Review.find({ sessionId })
      .populate('reviewerId', 'name avatarUrl')
      .populate('receiverId', 'name avatarUrl');

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/reviews/:reviewId
 * @desc    Update a review
 * @access  Private
 */
export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Check if review exists and user is the reviewer
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this review',
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Recalculate average rating
    const reviews = await Review.find({ receiverId: review.receiverId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await User.findByIdAndUpdate(review.receiverId, {
      averageRating: avgRating,
      totalReviews: reviews.length,
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete a review
 * @access  Private
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review',
      });
    }

    const receiverId = review.receiverId;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate average rating
    const reviews = await Review.find({ receiverId });
    if (reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await User.findByIdAndUpdate(receiverId, {
        averageRating: avgRating,
        totalReviews: reviews.length,
      });
    } else {
      await User.findByIdAndUpdate(receiverId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
