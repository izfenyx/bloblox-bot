import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    status: { type: String, default: 'abierto' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Ticket', ticketSchema);