'use strict';

const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  created_on: { type: Date, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false }
}, { versionKey: false });

const threadSchema = new mongoose.Schema({
  board: { type: String, required: true, index: true },
  text: { type: String, required: true },
  created_on: { type: Date, required: true },
  bumped_on: { type: Date, required: true, index: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false },
  replies: { type: [replySchema], default: [] }
}, { versionKey: false });

threadSchema.index({ board: 1, bumped_on: -1 });

module.exports = mongoose.models.Thread || mongoose.model('Thread', threadSchema);
