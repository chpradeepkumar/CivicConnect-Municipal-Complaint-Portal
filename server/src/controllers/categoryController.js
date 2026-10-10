import Category from '../models/Category.js';
import Complaint from '../models/Complaint.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { recordAudit } from '../services/auditService.js';

export const listCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user?.role !== 'admin') filter.isActive = true;
  if (req.query.active === 'true') filter.isActive = true;

  const categories = await Category.find(filter).sort({ name: 1 }).lean();

  // Attach complaint counts for the category cards.
  const counts = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const withCounts = categories.map((c) => ({ ...c, complaintCount: countMap.get(String(c._id)) || 0 }));

  return sendSuccess(res, { data: { categories: withCounts } });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  return sendSuccess(res, { data: { category } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const existing = await Category.findOne({ name: req.body.name });
  if (existing) throw ApiError.conflict('A category with this name already exists');
  const category = await Category.create(req.body);
  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'category.create',
    entityType: 'Category',
    entityId: category._id,
    description: `Created category ${category.name}`,
    req,
  });
  return sendSuccess(res, { statusCode: 201, message: 'Category created', data: { category } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  Object.assign(category, req.body);
  await category.save();
  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'category.update',
    entityType: 'Category',
    entityId: category._id,
    description: `Updated category ${category.name}`,
    metadata: req.body,
    req,
  });
  return sendSuccess(res, { message: 'Category updated', data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const inUse = await Complaint.countDocuments({ category: category._id });
  if (inUse > 0) {
    // Soft-delete to preserve complaint integrity.
    category.isActive = false;
    await category.save();
    return sendSuccess(res, {
      message: `Category has ${inUse} complaint(s); it was deactivated instead of deleted`,
      data: { category },
    });
  }

  await category.deleteOne();
  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'category.delete',
    entityType: 'Category',
    entityId: category._id,
    description: `Deleted category ${category.name}`,
    req,
  });
  return sendSuccess(res, { message: 'Category deleted' });
});

export default { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
