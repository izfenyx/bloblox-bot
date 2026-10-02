import mongoose from 'mongoose';

const serverStatsSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    totalMembersChannelId: { type: String, default: null },
    humansChannelId: { type: String, default: null },
    botsChannelId: { type: String, default: null },
    channelsCountChannelId: { type: String, default: null }
});

export default mongoose.model('ServerStats', serverStatsSchema);