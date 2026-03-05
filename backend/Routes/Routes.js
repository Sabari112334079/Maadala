const express = require("express");
const router  = express.Router();

const {
  // Assets
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  updateCurrentValue,
  buyAsset,
  sellAsset,

  // Liabilities
  getAllLiabilities,
  getLiabilityById,
  createLiability,
  updateLiability,
  updateCurrentBalance,
  makePayment,
  deleteLiability,

  // Transactions
  getAllTransactions,
  getTransactionById,
  getTransactionSummary,
  deleteTransaction,
} = require("../Controllers/Controllers");

// ─── Assets ──────────────────────────────────────────────────────────────────
router.get   ("/api/assets",                    getAllAssets);
router.post  ("/api/assets",                    createAsset);
router.get   ("/api/assets/:id",                getAssetById);
router.put   ("/api/assets/:id",                updateAsset);
router.delete("/api/assets/:id",                deleteAsset);
router.patch ("/api/assets/:id/current-value",  updateCurrentValue);
router.post  ("/api/assets/:id/buy",            buyAsset);
router.post  ("/api/assets/:id/sell",           sellAsset);

// ─── Liabilities ─────────────────────────────────────────────────────────────
router.get   ("/api/liabilities",                       getAllLiabilities);
router.post  ("/api/liabilities",                       createLiability);
router.get   ("/api/liabilities/:id",                   getLiabilityById);
router.put   ("/api/liabilities/:id",                   updateLiability);
router.delete("/api/liabilities/:id",                   deleteLiability);
router.patch ("/api/liabilities/:id/current-balance",   updateCurrentBalance);
router.post  ("/api/liabilities/:id/pay",               makePayment);

// ─── Transactions ─────────────────────────────────────────────────────────────
// NOTE: /summary must be declared BEFORE /:id — otherwise Express matches
// the word "summary" as the :id param and calls getTransactionById instead.
router.get   ("/api/transactions/summary",  getTransactionSummary);
router.get   ("/api/transactions",          getAllTransactions);
router.get   ("/api/transactions/:id",      getTransactionById);
router.delete("/api/transactions/:id",      deleteTransaction);   // ← trailing space removed

module.exports = router;