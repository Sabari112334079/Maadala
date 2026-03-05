const Asset       = require("../Models/AssetModel");
const Liability   = require("../Models/LiabilityModel");
const Transaction = require("../Models/TransactionModel");

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNAL HELPER — log a transaction record
//  Never throws — a logging failure must never crash the parent operation.
// ─────────────────────────────────────────────────────────────────────────────

const _log = async ({
  type,
  entity_type,
  entity_id,
  entity_model,
  entity_name,
  amount,
  value_after        = null,
  realized_gain      = null,
  net_worth_snapshot = null,
  note               = "",
  transaction_date   = new Date(),
}) => {
  try {
    await new Transaction({
      type,
      entity_type,
      entity_id,
      entity_model,
      entity_name,
      amount,
      value_after,
      realized_gain,
      net_worth_snapshot,
      note,
      transaction_date,
    }).save();
  } catch (err) {
    console.error("[Transaction Log Error]", err.message);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  ASSET CONTROLLERS
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/assets
const getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assets", error: error.message });
  }
};

// GET /api/assets/:id
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch asset", error: error.message });
  }
};

// POST /api/assets
const createAsset = async (req, res) => {
  try {
    const { asset_name, institution, invested_value, invested_date, notes } = req.body;

    const asset = new Asset({
      asset_name,
      institution,
      invested_value,
      current_value: invested_value,
      invested_date: invested_date || null,
      notes: notes || "",
      value_history: [
        { value: invested_value, recorded_at: invested_date || Date.now() },
      ],
    });

    const saved = await asset.save();

    await _log({
      type:             "asset_create",
      entity_type:      "asset",
      entity_id:        saved._id,
      entity_model:     "Asset",
      entity_name:      saved.asset_name,
      amount:           saved.invested_value,
      value_after:      saved.current_value,
      note:             notes || "",
      transaction_date: invested_date ? new Date(invested_date) : new Date(),
    });

    res.status(201).json(saved);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }
    res.status(500).json({ message: "Failed to create asset", error: error.message });
  }
};

// PUT /api/assets/:id
const updateAsset = async (req, res) => {
  try {
    const { asset_name, institution, invested_value, current_value, invested_date, notes } = req.body;

    const existing = await Asset.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Asset not found" });

    const previousValue     = existing.current_value;
    existing.asset_name     = asset_name;
    existing.institution    = institution;
    existing.invested_value = invested_value;
    existing.invested_date  = invested_date || null;
    existing.notes          = notes || "";

    if (current_value !== undefined && current_value !== existing.current_value) {
      existing.current_value = current_value;
      existing.value_history.push({ value: current_value, recorded_at: new Date() });

      await _log({
        type:         "asset_value_update",
        entity_type:  "asset",
        entity_id:    existing._id,
        entity_model: "Asset",
        entity_name:  existing.asset_name,
        amount:       current_value - (previousValue || 0),
        value_after:  current_value,
        note:         "Value updated via edit",
      });
    }

    const saved = await existing.save();
    res.status(200).json(saved);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }
    res.status(500).json({ message: "Failed to update asset", error: error.message });
  }
};

// PATCH /api/assets/:id/current-value
const updateCurrentValue = async (req, res) => {
  try {
    const { current_value } = req.body;

    if (current_value === undefined || current_value < 0) {
      return res.status(400).json({ message: "A valid current_value is required." });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    const previousValue  = asset.current_value;
    asset.current_value  = current_value;
    asset.value_history.push({ value: current_value, recorded_at: new Date() });

    const saved = await asset.save();

    await _log({
      type:         "asset_value_update",
      entity_type:  "asset",
      entity_id:    saved._id,
      entity_model: "Asset",
      entity_name:  saved.asset_name,
      amount:       current_value - previousValue,
      value_after:  current_value,
      note:         "Inline value update",
    });

    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to update current value", error: error.message });
  }
};

// POST /api/assets/:id/buy
const buyAsset = async (req, res) => {
  try {
    const { amount, date } = req.body;
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "A positive buy amount is required." });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    // Safety fallback for records created before current_value was tracked
    if (asset.current_value == null) asset.current_value = asset.invested_value;

    asset.invested_value += parsedAmount;
    asset.current_value  += parsedAmount;
    asset.value_history.push({
      value:       asset.current_value,
      recorded_at: date ? new Date(date) : new Date(),
    });

    const saved = await asset.save();

    await _log({
      type:             "asset_buy",
      entity_type:      "asset",
      entity_id:        saved._id,
      entity_model:     "Asset",
      entity_name:      saved.asset_name,
      amount:           parsedAmount,
      value_after:      saved.current_value,
      note:             `Bought additional $${parsedAmount.toFixed(2)}`,
      transaction_date: date ? new Date(date) : new Date(),
    });

    res.status(200).json(saved);
  } catch (error) {
    console.error("BUY ERROR:", error);
    res.status(500).json({ message: "Failed to process buy", error: error.message });
  }
};

// POST /api/assets/:id/sell
const sellAsset = async (req, res) => {
  try {
    const { proceeds, date } = req.body;

    if (!proceeds || proceeds <= 0) {
      return res.status(400).json({ message: "A positive sell proceeds amount is required." });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    if (proceeds > asset.current_value) {
      return res.status(400).json({
        message: `Sell proceeds ($${proceeds}) exceed current value ($${asset.current_value}).`,
      });
    }

    const sellRatio          = proceeds / asset.current_value;
    const costBasisReduction = asset.invested_value * sellRatio;
    const realizedGain       = proceeds - costBasisReduction;

    asset.invested_value = Math.max(0, asset.invested_value - costBasisReduction);
    asset.current_value  = Math.max(0, asset.current_value  - proceeds);
    asset.value_history.push({
      value:       asset.current_value,
      recorded_at: date ? new Date(date) : new Date(),
    });

    const saved = await asset.save();

    await _log({
      type:             "asset_sell",
      entity_type:      "asset",
      entity_id:        saved._id,
      entity_model:     "Asset",
      entity_name:      saved.asset_name,
      amount:           proceeds,
      value_after:      saved.current_value,
      realized_gain:    realizedGain,
      note:             `Sold for $${Number(proceeds).toFixed(2)}`,
      transaction_date: date ? new Date(date) : new Date(),
    });

    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to process sell", error: error.message });
  }
};

// DELETE /api/assets/:id
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.status(200).json({ message: "Asset deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete asset", error: error.message });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  LIABILITY CONTROLLERS
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/liabilities
const getAllLiabilities = async (req, res) => {
  try {
    const liabilities = await Liability.find().sort({ createdAt: -1 });
    res.status(200).json(liabilities);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch liabilities", error: error.message });
  }
};

// GET /api/liabilities/:id
const getLiabilityById = async (req, res) => {
  try {
    const liability = await Liability.findById(req.params.id);
    if (!liability) return res.status(404).json({ message: "Liability not found" });
    res.status(200).json(liability);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch liability", error: error.message });
  }
};

// POST /api/liabilities
const createLiability = async (req, res) => {
  try {
    const {
      liability_name, lender, liability_type, original_amount,
      current_balance, interest_rate, monthly_payment,
      due_date, start_date, notes,
    } = req.body;

    const initialBalance = current_balance ?? original_amount;

    const liability = new Liability({
      liability_name,
      lender,
      liability_type:  liability_type  || "loan",
      original_amount,
      current_balance: initialBalance,
      interest_rate:   interest_rate   || 0,
      monthly_payment: monthly_payment || 0,
      due_date:        due_date        || null,
      start_date:      start_date      || null,
      notes:           notes           || "",
      payment_history: [{
        amount_paid:   0,
        balance_after: initialBalance,
        recorded_at:   start_date || Date.now(),
        note:          "Initial balance",
      }],
    });

    const saved = await liability.save();

    await _log({
      type:             "liability_create",
      entity_type:      "liability",
      entity_id:        saved._id,
      entity_model:     "Liability",
      entity_name:      saved.liability_name,
      amount:           initialBalance,
      value_after:      initialBalance,
      note:             notes || "New liability added",
      transaction_date: start_date ? new Date(start_date) : new Date(),
    });

    res.status(201).json(saved);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }
    res.status(500).json({ message: "Failed to create liability", error: error.message });
  }
};

// PUT /api/liabilities/:id
const updateLiability = async (req, res) => {
  try {
    const {
      liability_name, lender, liability_type, original_amount,
      interest_rate, monthly_payment, due_date, start_date, notes,
    } = req.body;

    const existing = await Liability.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Liability not found" });

    existing.liability_name  = liability_name;
    existing.lender          = lender;
    existing.liability_type  = liability_type  || existing.liability_type;
    existing.original_amount = original_amount;
    existing.interest_rate   = interest_rate   ?? existing.interest_rate;
    existing.monthly_payment = monthly_payment ?? existing.monthly_payment;
    existing.due_date        = due_date        || null;
    existing.start_date      = start_date      || null;
    existing.notes           = notes           || "";

    const saved = await existing.save();
    res.status(200).json(saved);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }
    res.status(500).json({ message: "Failed to update liability", error: error.message });
  }
};

// PATCH /api/liabilities/:id/current-balance
const updateCurrentBalance = async (req, res) => {
  try {
    const { current_balance } = req.body;

    if (current_balance === undefined || current_balance < 0) {
      return res.status(400).json({ message: "A valid current_balance is required." });
    }

    const liability = await Liability.findById(req.params.id);
    if (!liability) return res.status(404).json({ message: "Liability not found" });

    const previousBalance     = liability.current_balance;
    liability.current_balance = current_balance;
    liability.payment_history.push({
      amount_paid:   Math.max(0, previousBalance - current_balance),
      balance_after: current_balance,
      recorded_at:   new Date(),
      note:          "Manual balance update",
    });

    const saved = await liability.save();

    await _log({
      type:         "liability_balance_update",
      entity_type:  "liability",
      entity_id:    saved._id,
      entity_model: "Liability",
      entity_name:  saved.liability_name,
      amount:       Math.max(0, previousBalance - current_balance),
      value_after:  current_balance,
      note:         "Manual balance correction",
    });

    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to update balance", error: error.message });
  }
};

// POST /api/liabilities/:id/pay
const makePayment = async (req, res) => {
  try {
    const { amount, date, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "A positive payment amount is required." });
    }

    const liability = await Liability.findById(req.params.id);
    if (!liability) return res.status(404).json({ message: "Liability not found" });

    if (amount > liability.current_balance) {
      return res.status(400).json({
        message: `Payment ($${amount}) exceeds current balance ($${liability.current_balance}).`,
      });
    }

    liability.current_balance = Math.max(0, liability.current_balance - amount);
    liability.payment_history.push({
      amount_paid:   amount,
      balance_after: liability.current_balance,
      recorded_at:   date ? new Date(date) : new Date(),
      note:          note || "",
    });

    const saved = await liability.save();

    await _log({
      type:             "liability_payment",
      entity_type:      "liability",
      entity_id:        saved._id,
      entity_model:     "Liability",
      entity_name:      saved.liability_name,
      amount:           amount,
      value_after:      saved.current_balance,
      note:             note || "Payment made",
      transaction_date: date ? new Date(date) : new Date(),
    });

    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to process payment", error: error.message });
  }
};

// DELETE /api/liabilities/:id
const deleteLiability = async (req, res) => {
  try {
    const liability = await Liability.findByIdAndDelete(req.params.id);
    if (!liability) return res.status(404).json({ message: "Liability not found" });
    res.status(200).json({ message: "Liability deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete liability", error: error.message });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  TRANSACTION CONTROLLERS
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/transactions/summary
const getTransactionSummary = async (req, res) => {
  try {
    const [typeBreakdown, recentActivity, totalCount] = await Promise.all([
      Transaction.aggregate([
        {
          $group: {
            _id:          "$type",
            count:        { $sum: 1 },
            total_amount: { $sum: "$amount" },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Transaction.find().sort({ transaction_date: -1 }).limit(5),
      Transaction.countDocuments(),
    ]);

    res.status(200).json({ typeBreakdown, recentActivity, totalCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summary", error: error.message });
  }
};

// GET /api/transactions
// Query params: entity_type, type (comma-sep), entity_id, from, to, limit, page
const getAllTransactions = async (req, res) => {
  try {
    const {
      entity_type,
      type,
      entity_id,
      from,
      to,
      limit = 20,
      page  = 1,
    } = req.query;

    const filter = {};
    if (entity_type) filter.entity_type = entity_type;
    if (entity_id)   filter.entity_id   = entity_id;
    if (type)        filter.type        = { $in: type.split(",") };

    if (from || to) {
      filter.transaction_date = {};
      if (from) filter.transaction_date.$gte = new Date(from);
      if (to)   filter.transaction_date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .sort({ transaction_date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

// GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json(tx);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transaction", error: error.message });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndDelete(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json({ message: "Transaction deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete transaction", error: error.message });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  EXPORTS
// ═════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Assets
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  updateCurrentValue,
  buyAsset,
  sellAsset,
  deleteAsset,

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
};