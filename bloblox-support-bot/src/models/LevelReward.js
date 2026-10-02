import mongoose from 'mongoose';

const levelRewardSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    level: { type: Number, required: true },
    roleId: { type: String, required: true }
});

export default mongoose.model('LevelReward', levelRewardSchema);