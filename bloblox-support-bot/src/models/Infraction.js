import { Schema, model } from 'mongoose';

const infractionSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    type: { type: String, enum: ['warn', 'note'], required: true },
    reason: { type: String, default: 'Sin razón especificada' },
    createdAt: { type: Date, default: Date.now }
});

export default model('Infraction', infractionSchema);