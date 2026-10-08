import mongoose from 'mongoose';

const guildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannelId: { type: String, default: null },
    levelChannelId: { type: String, default: null },
    bumpChannelId: { type: String, default: null },
    welcomeChannelId: { type: String, default: null },
    welcomeMessage: { type: String, default: '{user} Nos alegra tenerte en **{server}** ! Ya que pasaste a formar parte de nuestra comunidad. • Te recomendamos pasarte por el canal de <#1550626069986676736> para evitar sanciones. • Informate sobre nuestros roles y beneficios en <#1550626072112930946> y <#1550698454563553331>. • Chatea un rato con la comunidad en <#1550626081948704842>.  ¡Que disfrutes tu estancia! 🎉 🎉' },
    byeChannelId: { type: String, default: null },
    byeMessage: { type: String, default: '**{user_tag}** ha abandonado el servidor. ¡Esperamos verte pronto!' }
});

export default mongoose.model('GuildConfig', guildConfigSchema);
