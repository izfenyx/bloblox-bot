import mongoose from 'mongoose';

const economySchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    cash: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    lastDaily: { type: Date, default: null }
});

economySchema.index({ guildId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Economy', economySchema);