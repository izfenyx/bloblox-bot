antenimiento..)import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, Partials, MessageFlags } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Ticket from './models/Ticket.js';
import Infraction from './models/Infraction.js';
import Level from './models/Level.js';
import GuildConfig from './models/GuildConfig.js';
import Giveaway from './models/Giveaway.js';
import ServerStats from './models/ServerStats.js';
import LevelReward from './models/LevelReward.js';
import Economy from './models/Economy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildModeration
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('¡Conectado a MongoDB con éxito!'))
    .catch((err) => console.error('Error al conectar a MongoDB:', err));

const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra el menú de ayuda interactivo del bot.'),
    new SlashCommandBuilder()
        .setName('setup-support')
        .setDescription('Envía el panel permanente de tickets de soporte.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option.setName('usuario').setDescription('El usuario que deseas banear').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('La razón del baneo').setRequired(false)),
    new SlashCommandBuilder()
        .setName('desban')
        .setDescription('Desbanea a un usuario mediante su ID.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option => option.setName('userid').setDescription('El ID del usuario a desbanear').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('La razón del desbaneo').setRequired(false)),
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => option.setName('usuario').setDescription('El usuario que deseas expulsar').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('La razón de la expulsión').setRequired(false)),
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Silencia temporalmente a un usuario (Timeout).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('usuario').setDescription('El usuario a silenciar').setRequired(true))
        .addIntegerOption(option => option.setName('minutos').setDescription('Duración del silencio en minutos').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('La razón del silencio').setRequired(false)),
    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Quita el silencio a un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('usuario').setDescription('El usuario al que quitar el silencio').setRequired(true)),
    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advierte a un usuario y registra la infracción.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('usuario').setDescription('El usuario a advertir').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('Motivo de la advertencia').setRequired(true)),
    new SlashCommandBuilder()
        .setName('warns')
        .setDescription('Muestra las advertencias de un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('usuario').setDescription('El usuario cuyas advertencias deseas ver').setRequired(true)),
    new SlashCommandBuilder()
        .setName('delwarn')
        .setDescription('Elimina una advertencia o nota específica por su ID de infracción.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option => option.setName('id').setDescription('El ID de la infracción en MongoDB').setRequired(true)),
    new SlashCommandBuilder()
        .setName('note')
        .setDescription('Añade una nota interna sobre un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('usuario').setDescription('El usuario sobre el que quieres dejar una nota').setRequired(true))
        .addStringOption(option => option.setName('texto').setDescription('El contenido de la nota').setRequired(true)),
    new SlashCommandBuilder()
        .setName('notes')
        .setDescription('Muestra las notas internas guardadas sobre un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('usuario').setDescription('El usuario cuyas notas deseas ver').setRequired(true)),
    new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Borra una cantidad específica de mensajes de un canal.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option.setName('cantidad').setDescription('Número de mensajes a borrar (1-100)').setRequired(true)),
    new SlashCommandBuilder()
        .setName('purgeblox')
        .setDescription('Borra únicamente los mensajes enviados por el bot en este canal.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option.setName('cantidad').setDescription('Número de mensajes del bot a borrar').setRequired(true)),
    new SlashCommandBuilder()
        .setName('members')
        .setDescription('Muestra una lista paginada de los miembros del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Muestra tu nivel actual y experiencia en el servidor.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario cuyo rango deseas ver').setRequired(false)),
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Muestra la tabla de clasificación de niveles del servidor.'),
    new SlashCommandBuilder()
        .setName('set-level-channel')
        .setDescription('Configura el canal donde se enviarán las notifications de subida de nivel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName('canal')
                .setDescription('El canal de texto donde se anunciarán los niveles')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('reward-level')
        .setDescription('Asigna un rol automático al alcanzar cierto nivel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option => option.setName('nivel').setDescription('Nivel requerido para obtener el rol').setRequired(true))
        .addRoleOption(option => option.setName('rol').setDescription('El rol que se otorgará').setRequired(true)),
    new SlashCommandBuilder()
        .setName('set-welcome-channel')
        .setDescription('Configura el canal actual para las bienvenidas y opcionalmente copia un mensaje existente por ID.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('mensaje_id').setDescription('ID del mensaje redactado para copiar el texto exacto').setRequired(false)),
    new SlashCommandBuilder()
        .setName('set-bye-channel')
        .setDescription('Configura el canal actual para las despedidas y opcionalmente copia un mensaje existente por ID.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('mensaje_id').setDescription('ID del mensaje redactado para copiar el texto exacto').setRequired(false)),
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Hace que el bot envíe un mensaje de texto en este canal.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('mensaje').setDescription('El contenido del mensaje que enviará el bot').setRequired(true)),
    new SlashCommandBuilder()
        .setName('add-role')
        .setDescription('Vincula un emoji a un rol en un mensaje específico del bot para autoroles.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('mensaje_id').setDescription('ID del mensaje del bot donde está el panel').setRequired(true))
        .addStringOption(option => option.setName('emoji').setDescription('El emoji (ej: 🎮 o el nombre/ID si es personalizado)').setRequired(true))
        .addRoleOption(option => option.setName('rol').setDescription('El rol que se asignará al reaccionar').setRequired(true)),
    new SlashCommandBuilder()
        .setName('set-bump-channel')
        .setDescription('Configura el canal actual para recibir los recordatorios automáticos de /bump de Disboard.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('set-log-channel')
        .setDescription('Configura el canal actual como el canal oficial de logs del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('test-log')
        .setDescription('Comprueba si el canal de logs funciona enviando un mensaje de prueba.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('sortear')
        .setDescription('Inicia un nuevo sorteo.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('duracion').setDescription('Duración del sorteo (ej: 10s, 5m, 2h, 1d)').setRequired(true))
        .addStringOption(option => option.setName('premio').setDescription('El premio que se va a sortear').setRequired(true))
        .addIntegerOption(option => option.setName('ganadores').setDescription('Cantidad de ganadores').setRequired(true)),
    new SlashCommandBuilder()
        .setName('re-sortear')
        .setDescription('Elige un nuevo ganador al azar para un sorteo existente usando el ID del mensaje.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('mensaje_id').setDescription('El ID del mensaje del sorteo').setRequired(true)),
    new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('Configura o desactiva el sistema de estadísticas del servidor.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Crea y configura automáticamente los canales de estadísticas arriba del todo.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Desactiva y limpia las estadísticas del servidor.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Muestra tu dinero en efectivo y en el banco.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario cuyo balance deseas ver').setRequired(false)),
    new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Reclama tu recompensa diaria de dinero.'),
    new SlashCommandBuilder()
        .setName('work')
        .setDescription('Trabaja para ganar algo de dinero con un tiempo de espera.'),
    new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposita dinero de tu cartera al banco.')
        .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a depositar').setRequired(true)),
    new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Retira dinero del banco a tu cartera.')
        .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a retirar').setRequired(true)),
    new SlashCommandBuilder()
        .setName('dar')
        .setDescription('Transfiere dinero de tu cartera a otro usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('A quién deseas enviar el dinero').setRequired(true))
        .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad de dinero a transferir').setRequired(true)),
    new SlashCommandBuilder()
        .setName('economy-add')
        .setDescription('Añade o quita dinero a un usuario (Solo Administradores).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option.setName('usuario').setDescription('El usuario').setRequired(true))
        .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad (usa números negativos para quitar)').setRequired(true)),
    new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Juega una partida de Blackjack contra el bot.')
        .addIntegerOption(option => option.setName('apuesta').setDescription('Cantidad de dinero a apostar').setRequired(true)),
    new SlashCommandBuilder()
        .setName('ruleta')
        .setDescription('Juega a la ruleta apostando a un color o número.')
        .addIntegerOption(option => option.setName('apuesta').setDescription('Cantidad de dinero a apostar').setRequired(true))
        .addStringOption(option => 
            option.setName('opcion')
                .setDescription('Elige rojo, negro, verde o un número del 0 al 36')
                .setRequired(true)
        )
].map(command => command.toJSON());

client.once('clientReady', async () => {
    console.log(`¡Bot encendido con éxito como ${client.user.tag}!`);
    client.user.setActivity('Bloblox IA | Moderación', { type: 3 });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Registrando comandos de barra...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('¡Comandos registrados con éxito!');
    } catch (error) {
        console.error('Error al registrar comandos:', error);
    }
});

const reactionRolesMap = new Map();
const cooldowns = new Map();
const workCooldowns = new Map();
const messageCache = new Map();

async function updateServerStats(guild) {
    try {
        const config = await ServerStats.findOne({ guildId: guild.id });
        if (!config) return;

        await guild.members.fetch();
        const total = guild.memberCount;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const humans = total - bots;
        const channelsCount = guild.channels.cache.size;

        if (config.totalMembersChannelId) {
            const chan = guild.channels.cache.get(config.totalMembersChannelId);
            if (chan) await chan.setName(`👥 Miembros: ${total}`).catch(() => {});
        }
        if (config.humansChannelId) {
            const chan = guild.channels.cache.get(config.humansChannelId);
            if (chan) await chan.setName(`👤 Usuarios: ${humans}`).catch(() => {});
        }
        if (config.botsChannelId) {
            const chan = guild.channels.cache.get(config.botsChannelId);
            if (chan) await chan.setName(`🤖 Bots: ${bots}`).catch(() => {});
        }
        if (config.channelsCountChannelId) {
            const chan = guild.channels.cache.get(config.channelsCountChannelId);
            if (chan) await chan.setName(`📁 Canales: ${channelsCount}`).catch(() => {});
        }
    } catch (err) {
        console.error('Error actualizando ServerStats:', err);
    }
}

function parseDuration(durationStr) {
    const match = durationStr.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

setInterval(async () => {
    try {
        const now = new Date();
        const activeGiveaways = await Giveaway.find({ ended: false, endTime: { $lte: now } });

        for (const giveaway of activeGiveaways) {
            const guild = client.guilds.cache.get(giveaway.guildId);
            if (!guild) continue;
            const channel = guild.channels.cache.get(giveaway.channelId);
            if (!channel) continue;

            const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);

            giveaway.ended = true;
            
            let winnersText = '';
            const chosenWinners = [];

            if (giveaway.participants.length > 0) {
                const shuffled = [...giveaway.participants].sort(() => 0.5 - Math.random());
                const count = Math.min(giveaway.winnerCount, shuffled.length);
                for (let i = 0; i < count; i++) {
                    chosenWinners.push(shuffled[i]);
                }
                giveaway.winners = chosenWinners;
                winnersText = chosenWinners.map(id => `<@${id}>`).join(', ');
            }

            await giveaway.save();

            const endedEmbed = new EmbedBuilder()
                .setTitle('🎉 ¡SORTEO FINALIZADO! 🎉')
                .setColor('Red')
                .setDescription(`**Premio:** ${giveaway.prize}\n**Ganador(es):** ${winnersText || 'Nadie participó 😢'}`)
                .setTimestamp();

            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('unirse_sorteo').setLabel('🎁 Participar').setStyle(ButtonStyle.Primary).setDisabled(true)
            );

            if (message) {
                await message.edit({ embeds: [endedEmbed], components: [disabledRow] }).catch(() => {});
            }

            if (chosenWinners.length > 0) {
                await channel.send(`🎊 ¡Felicidades ${winnersText}! Has ganado **${giveaway.prize}**.`);
            } else {
                await channel.send(`😢 El sorteo de **${giveaway.prize}** ha terminado, pero no hubo participantes.`);
            }
        }
    } catch (err) {
        console.error('Error en el verificador de sorteos:', err);
    }
}, 5000);

async function sendModLog(guild, title, description, color = 'Blue') {
    try {
        const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
        const logChannelId = guildConfig?.logChannelId;

        let logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;

        if (!logChannel) {
            logChannel = guild.channels.cache.find(c => c.name === 'mod-logs' && c.type === ChannelType.GuildText);
        }

        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('❌ Error al enviar log:', err);
    }
}

client.on('messageCreate', async message => {
    if (!message.guild || message.author.bot) return;

    messageCache.set(message.id, {
        content: message.content || '[Contenido multimedia o embed]',
        authorTag: message.author.tag,
        authorId: message.author.id,
        channelName: message.channel.name
    });

    if (messageCache.size > 500) {
        const firstKey = messageCache.keys().next().value;
        messageCache.delete(firstKey);
    }

    if (message.author.id === '302050872383242240' && message.embeds.length > 0) {
        const embed = message.embeds[0];
        if (embed.description && (embed.description.toLowerCase().includes('bump done') || embed.description.toLowerCase().includes('bump realizado') || embed.description.toLowerCase().includes('bump'))) {
            try {
                const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
                if (guildConfig && guildConfig.bumpChannelId) {
                    const bumpChannel = message.guild.channels.cache.get(guildConfig.bumpChannelId);
                    if (bumpChannel) {
                        setTimeout(async () => {
                            await bumpChannel.send(`⏰ ¡Han pasado 2 horas! Ya puedes volver a usar el comando \`/bump\` para promocionar **${message.guild.name}** en Disboard. 🚀`);
                        }, 2 * 60 * 60 * 1000);
                    }
                }
            } catch (err) {
                console.error('Error al programar el recordatorio de bump:', err);
            }
        }
    }

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        if (urlRegex.test(message.content)) {
            try {
                await message.delete();
                const warningMsg = await message.channel.send(`⚠️ ${message.author}, está prohibido enviar enlaces en este servidor.`);
                setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
                await sendModLog(message.guild, '🛡️ Enlace bloqueado por Automod', `**Autor:** ${message.author.tag}\n**Canal:** ${message.channel}`, 'Orange');
                return; 
            } catch (error) {
                console.error('Error al eliminar enlace con Automod:', error);
            }
        }
    }

    const userId = message.author.id;
    const guildId = message.guild.id;
    const cooldownKey = `${guildId}-${userId}`;

    if (cooldowns.has(cooldownKey)) return;

    cooldowns.set(cooldownKey, true);
    setTimeout(() => cooldowns.delete(cooldownKey), 60000);

    try {
        const xpToAdd = Math.floor(Math.random() * 15) + 10;
        let userLevel = await Level.findOne({ guildId, userId });

        if (!userLevel) {
            userLevel = await Level.create({ guildId, userId, xp: xpToAdd, level: 0 });
        } else {
            userLevel.xp += xpToAdd;
            const neededXp = (userLevel.level * 100) + 150;
            if (userLevel.xp >= neededXp) {
                userLevel.xp -= neededXp;
                userLevel.level += 1;

                let targetChannel = message.channel;
                const guildConfig = await GuildConfig.findOne({ guildId });
                if (guildConfig && guildConfig.levelChannelId) {
                    const customChannel = message.guild.channels.cache.get(guildConfig.levelChannelId);
                    if (customChannel) targetChannel = customChannel;
                }

                await targetChannel.send(`🎉 ¡Felicidades <@${userId}>! Has subido al **nivel ${userLevel.level}**. 🚀`);

                const reward = await LevelReward.findOne({ guildId, level: userLevel.level });
                if (reward) {
                    const member = await message.guild.members.fetch(userId).catch(() => null);
                    if (member) {
                        await member.roles.add(reward.roleId).catch(() => {});
                        await targetChannel.send(`🎁 ¡Has obtenido el rol <@&${reward.roleId}> por alcanzar el nivel ${userLevel.level}!`);
                    }
                }
            }
            await userLevel.save();
        }
    } catch (err) {
        console.error('Error al procesar XP:', err);
    }
});

client.on('messageDelete', async message => {
    try {
        if (!message.guild) return;
        
        let cachedData = messageCache.get(message.id);
        let authorInfo = 'Usuario desconocido';
        let content = '[Contenido no disponible o multimedia]';

        if (cachedData) {
            authorInfo = `${cachedData.authorTag} (<@${cachedData.authorId}>)`;
            content = cachedData.content;
        } else if (message.author) {
            authorInfo = `${message.author.tag} (<@${message.author.id}>)`;
            content = message.content || '[Contenido multimedia o embed]';
        }

        const channelName = message.channel ? message.channel.name : 'canal-desconocido';

        await sendModLog(message.guild, '🗑️ Mensaje Eliminado', `**Autor:** ${authorInfo}\n**Canal:** #${channelName}\n**Contenido:**\n\`\`\`${content.slice(0, 900)}\`\`\``, 'Red');
    } catch (err) {
        console.error('Error en messageDelete log:', err);
    }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    try {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const oldText = oldMessage.content || '[Sin contenido previo]';
        const newText = newMessage.content || '[Sin contenido nuevo]';

        await sendModLog(oldMessage.guild, '✏️ Mensaje Editado', `**Autor:** ${oldMessage.author.tag} (<@${oldMessage.author.id}>)\n**Canal:** ${oldMessage.channel}\n\n**Antes:**\n\`\`\`${oldText.slice(0, 450)}\`\`\`\n**Después:**\n\`\`\`${newText.slice(0, 450)}\`\`\``, 'Yellow');
    } catch (err) {
        console.error('Error en messageUpdate log:', err);
    }
});

client.on('guildMemberAdd', async member => {
    await updateServerStats(member.guild);
    await sendModLog(member.guild, '📥 Nuevo Miembro', `**Usuario:** ${member.user.tag} (<@${member.id}>)\n**Creado el:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, 'Green');

    try {
        const config = await GuildConfig.findOne({ guildId: member.guild.id });
        const welcomeId = config?.welcomeChannelId;
        const welcomeTemplate = config?.welcomeMessage;

        const welcomeChannel = welcomeId ? member.guild.channels.cache.get(welcomeId) : member.guild.systemChannel;
        if (welcomeChannel) {
            let msgText = welcomeTemplate || '¡Bienvenido/a {user} a **{server}**! 🎉';
            msgText = msgText
                .replace(/{user}/g, `<@${member.id}>`)
                .replace(/{user_tag}/g, member.user.tag)
                .replace(/{server}/g, member.guild.name)
                .replace(/{members}/g, member.guild.memberCount);

            await welcomeChannel.send(msgText);
        }
    } catch (err) {
        console.error('Error al enviar bienvenida:', err);
    }
});

client.on('guildMemberRemove', async member => {
    await updateServerStats(member.guild);
    await sendModLog(member.guild, '📤 Miembro Salió', `**Usuario:** ${member.user.tag} (<@${member.id}>)`, 'Orange');

    try {
        const config = await GuildConfig.findOne({ guildId: member.guild.id });
        const byeId = config?.byeChannelId;
        const byeTemplate = config?.byeMessage;

        const byeChannel = byeId ? member.guild.channels.cache.get(byeId) : member.guild.systemChannel;
        if (byeChannel) {
            let msgText = byeTemplate || '**{user_tag}** ha abandonado el servidor. ¡Esperamos verte pronto!';
            msgText = msgText
                .replace(/{user}/g, `<@${member.id}>`)
                .replace(/{user_tag}/g, member.user.tag)
                .replace(/{server}/g, member.guild.name)
                .replace(/{members}/g, member.guild.memberCount);

            await byeChannel.send(msgText);
        }
    } catch (err) {
        console.error('Error al enviar despedida:', err);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch().catch(() => {});

    const messageId = reaction.message.id;
    const emoji = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;
    const key = `${messageId}_${emoji}`;

    const roleId = reactionRolesMap.get(key);
    if (!roleId) return;

    try {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        if (member && !member.roles.cache.has(roleId)) {
            await member.roles.add(roleId);
        }
    } catch (err) {
        console.error('Error al asignar rol por reacción:', err);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch().catch(() => {});

    const messageId = reaction.message.id;
    const emoji = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;
    const key = `${messageId}_${emoji}`;

    const roleId = reactionRolesMap.get(key);
    if (!roleId) return;

    try {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        if (member && member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
        }
    } catch (err) {
        console.error('Error al retirar rol por reacción:', err);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName, options, guild, user, channel } = interaction;

        if (commandName === 'help') {
            const homeEmbed = new EmbedBuilder()
                .setTitle('🤖 Comandos de Bloblox Support')
                .setColor('Blurple')
                .setDescription('» **Menú de ayuda**\nTengo **6 categorías** y comandos para explorar.\n\n» **Categorías**\nUsa el menú desplegable de abajo para navegar entre las diferentes categorías de comandos y ver su información detallada.')
                .setFooter({ text: `Solicitado por ${user.tag}`, iconURL: user.displayAvatarURL() })
                .setTimestamp();

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder('📂 Selecciona una categoría...')
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel('Inicio').setDescription('Volver a la página principal').setValue('home').setEmoji('🏠'),
                    new StringSelectMenuOptionBuilder().setLabel('Moderación').setDescription('Herramientas de baneo, expulsión, warns y automod').setValue('moderation').setEmoji('🛡️'),
                    new StringSelectMenuOptionBuilder().setLabel('Soporte & Tickets').setDescription('Gestión de tickets de ayuda').setValue('tickets').setEmoji('🎟️'),
                    new StringSelectMenuOptionBuilder().setLabel('Niveles & Social').setDescription('Sistema de XP, rangos, economía y casino').setValue('social').setEmoji('🏆'),
                    new StringSelectMenuOptionBuilder().setLabel('Bienvenidas & Despedidas').setDescription('Configuración de mensajes personalizados').setValue('welcomes').setEmoji('👋'),
                    new StringSelectMenuOptionBuilder().setLabel('Sorteos & Utilidades').setDescription('Sorteos interactivos, autoroles y serverstats').setValue('utils').setEmoji('🎁')
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);
            const closeButtonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_close').setLabel('🔒 Cerrar Menú').setStyle(ButtonStyle.Danger)
            );

            return interaction.reply({ embeds: [homeEmbed], components: [row, closeButtonRow], flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'balance') {
            const targetUser = options.getUser('usuario') || user;
            let account = await Economy.findOne({ guildId: guild.id, userId: targetUser.id });
            if (!account) {
                account = await Economy.create({ guildId: guild.id, userId: targetUser.id, cash: 0, bank: 0 });
            }

            const total = account.cash + account.bank;
            const embed = new EmbedBuilder()
                .setTitle(`💰 Balance de ${targetUser.tag}`)
                .setColor('Gold')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '💵 Efectivo', value: `\`$${account.cash.toLocaleString()}\``, inline: true },
                    { name: '🏦 Banco', value: `\`$${account.bank.toLocaleString()}\``, inline: true },
                    { name: '💎 Total', value: `\`$${total.toLocaleString()}\``, inline: false }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'daily') {
            let account = await Economy.findOne({ guildId: guild.id, userId: user.id });
            if (!account) {
                account = await Economy.create({ guildId: guild.id, userId: user.id, cash: 0, bank: 0 });
            }

            const now = new Date();
            const cooldownTime = 24 * 60 * 60 * 1000;

            if (account.lastDaily && (now - account.lastDaily < cooldownTime)) {
                const nextTime = new Date(account.lastDaily.getTime() + cooldownTime);
                return interaction.reply({ content: `⏱️ Ya has reclamado tu recompensa diaria. Vuelve <t:${Math.floor(nextTime.getTime() / 1000)}:R>.`, flags: [MessageFlags.Ephemeral] });
            }

            const reward = 500;
            account.cash += reward;
            account.lastDaily = now;
            await account.save();

            return interaction.reply({ content: `✅ ¡Has reclamado tu recompensa diaria de **$${reward}** en efectivo!` });
        }

        if (commandName === 'work') {
            const cooldownKey = `work-${guild.id}-${user.id}`;
            if (workCooldowns.has(cooldownKey)) {
                const expiration = workCooldowns.get(cooldownKey);
                return interaction.reply({ content: `⏱️ Estás cansado. Podrás volver a trabajar <t:${Math.floor(expiration / 1000)}:R>.`, flags: [MessageFlags.Ephemeral] });
            }

            const expirationTime = Date.now() + 60 * 60 * 1000;
            workCooldowns.set(cooldownKey, expirationTime);
            setTimeout(() => workCooldowns.delete(cooldownKey), 60 * 60 * 1000);

            const earnings = Math.floor(Math.random() * 200) + 50;
            let account = await Economy.findOne({ guildId: guild.id, userId: user.id });
            if (!account) {
                account = await Economy.create({ guildId: guild.id, userId: user.id, cash: 0, bank: 0 });
            }

            account.cash += earnings;
            await account.save();

            const jobs = ['programador', 'moderador', 'streamer', 'diseñador', 'repartidor'];
            const randomJob = jobs[Math.floor(Math.random() * jobs.length)];

            return interaction.reply({ content: `💼 Trabajaste como **${randomJob}** y ganaste **$${earnings}** en efectivo.` });
        }

        if (commandName === 'deposit') {
            const amountInput = options.getInteger('cantidad');
            let account = await Economy.findOne({ guildId: guild.id, userId: user.id });
            if (!account || account.cash <= 0) {
                return interaction.reply({ content: '❌ No tienes dinero en efectivo para depositar.', flags: [MessageFlags.Ephemeral] });
            }

            const amount = amountInput > account.cash ? account.cash : amountInput;
            if (amount <= 0) {
                return interaction.reply({ content: '❌ Cantidad inválida.', flags: [MessageFlags.Ephemeral] });
            }

            account.cash -= amount;
            account.bank += amount;
            await account.save();

            return interaction.reply({ content: `🏦 Has depositado **$${amount.toLocaleString()}** en tu banco.` });
        }

        if (commandName === 'withdraw') {
            const amountInput = options.getInteger('cantidad');
            let account = await Economy.findOne({ guildId: guild.id, userId: user.id });
            if (!account || account.bank <= 0) {
                return interaction.reply({ content: '❌ No tienes dinero en el banco para retirar.', flags: [MessageFlags.Ephemeral] });
            }

            const amount = amountInput > account.bank ? account.bank : amountInput;
            if (amount <= 0) {
                return interaction.reply({ content: '❌ Cantidad inválida.', flags: [MessageFlags.Ephemeral] });
            }

            account.bank -= amount;
            account.cash += amount;
            await account.save();

            return interaction.reply({ content: `💵 Has retirado **$${amount.toLocaleString()}** de tu banco a tu cartera.` });
        }

        if (commandName === 'dar') {
            const targetUser = options.getUser('usuario');
            const amount = options.getInteger('cantidad');

            if (targetUser.id === user.id) {
                return interaction.reply({ content: '❌ No puedes enviarte dinero a ti mismo.', flags: [MessageFlags.Ephemeral] });
            }
            if (amount <= 0) {
                return interaction.reply({ content: '❌ La cantidad debe ser mayor a 0.', flags: [MessageFlags.Ephemeral] });
            }

            let senderAccount = await Economy.findOne({ guildId: guild.id, userId: user.id });
            if (!senderAccount || senderAccount.cash < amount) {
                return interaction.reply({ content: '❌ No tienes suficiente dinero en efectivo en tu cartera.', flags: [MessageFlags.Ephemeral] });
            }

            let targetAccount = await Economy.findOne({ guildId: guild.id, userId: targetUser.id });
            if (!targetAccount) {
                targetAccount = await Economy.create({ guildId: guild.id, userId: targetUser.id, cash: 0, bank: 0 });
            }

            senderAccount.cash -= amount;
            targetAccount.cash += amount;

            await senderAccount.save();
            await targetAccount.save();

            return interaction.reply({ content: `💸 Has transferido **$${amount.toLocaleString()}** a <@${targetUser.id}>.` });
        }

        if (commandName === 'economy-add') {
            const targetUser = options.getUser('usuario');
            const amount = options.getInteger('cantidad');

            let account = await Economy.findOne({ guildId: guild.id, userId: targetUser.id });
            if (!account) {
                account = await Economy.create({ guildId: guild.id, userId: targetUser.id, cash: 0, bank: 0 });
            }

            account.cash += amount;
            await account.save();

            return interaction.reply({ content: `✅ Se han actualizado los fondos de <@${targetUser.id}> en **$${amount.toLocaleString()}**.` });
        }

        if (commandName === 'blackjack') {
            const bet = options.getInteger('apuesta');
            let account = await Economy.findOne({ guildId: guild.id, userId: user.id });

            if (!account || account.cash < bet || bet <= 0) {
                return interaction.reply({ content: '❌ No tienes suficiente dinero en efectivo o la apuesta es inválida.', flags: [MessageFlags.Ephemeral] });
            }

            account.cash -= bet;
            await account.save();

            const deck = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
            const getCardValue = (card, currentTotal) => {
                if (['J','Q','K'].includes(card)) return 10;
                if (card === 'A') return currentTotal + 11 > 21 ? 1 : 11;
                return parseInt(card);
            };

            const drawCard = () => deck[Math.floor(Math.random() * deck.length)];

            let playerCards = [drawCard(), drawCard()];
            let dealerCards = [drawCard(), drawCard()];

            let playerTotal = playerCards.reduce((acc, card) => acc + getCardValue(card, acc), 0);
            let dealerTotal = dealerCards.reduce((acc, card) => acc + getCardValue(card, acc), 0);

            const embed = new EmbedBuilder()
                .setTitle(`🃏 Blackjack de ${user.username}`)
                .setColor('Blurple')
                .addFields(
                    { name: 'Tus Cartas', value: `${playerCards.join(', ')} (Total: **${playerTotal}**)`, inline: true },
                    { name: 'Carta del Dealer', value: `${dealerCards[0]}, ?`, inline: true }
                )
                .setFooter({ text: `Apuesta: $${bet.toLocaleString()}` });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('bj_hit').setLabel('Pedir (Hit)').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('bj_stand').setLabel('Plantarse (Stand)').setStyle(ButtonStyle.Success)
            );

            const response = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            const collector = response.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== user.id) return i.reply({ content: 'No puedes controlar esta partida.', flags: [MessageFlags.Ephemeral] });

                if (i.customId === 'bj_hit') {
                    playerCards.push(drawCard());
                    playerTotal = playerCards.reduce((acc, card) => acc + getCardValue(card, acc), 0);

                    if (playerTotal > 21) {
                        collector.stop();
                        const lostEmbed = new EmbedBuilder()
                            .setTitle('🃏 Blackjack - ¡Te pasaste!')
                            .setColor('Red')
                            .addFields(
                                { name: 'Tus Cartas', value: `${playerCards.join(', ')} (Total: **${playerTotal}**)`, inline: true },
                                { name: 'Resultado', value: `Has perdido **$${bet.toLocaleString()}**.`, inline: false }
                            );
                        return i.update({ embeds: [lostEmbed], components: [] });
                    }

                    const updateEmbed = new EmbedBuilder()
                        .setTitle(`🃏 Blackjack de ${user.username}`)
                        .setColor('Blurple')
                        .addFields(
                            { name: 'Tus Cartas', value: `${playerCards.join(', ')} (Total: **${playerTotal}**)`, inline: true },
                            { name: 'Carta del Dealer', value: `${dealerCards[0]}, ?`, inline: true }
                        );
                    return i.update({ embeds: [updateEmbed], components: [row] });
                }

                if (i.customId === 'bj_stand') {
                    collector.stop();
                    while (dealerTotal < 17) {
                        dealerCards.push(drawCard());
                        dealerTotal = dealerCards.reduce((acc, card) => acc + getCardValue(card, acc), 0);
                    }

                    let resultText = '';
                    let color = 'Blurple';

                    if (dealerTotal > 21 || playerTotal > dealerTotal) {
                        const winnings = bet * 2;
                        account.cash += winnings;
                        resultText = `🎉 ¡Has ganado **$${winnings.toLocaleString()}**!`;
                        color = 'Green';
                    } else if (playerTotal === dealerTotal) {
                        account.cash += bet;
                        resultText = `🤝 ¡Empate (Push)! Se te devuelve tu apuesta.`;
                        color = 'Yellow';
                    } else {
                        resultText = `😢 El dealer gana. Perdiste **$${bet.toLocaleString()}**.`;
                        color = 'Red';
                    }

                    await account.save();

                    const finalEmbed = new EmbedBuilder()
                        .setTitle('🃏 Blackjack - Resultado Final')
                        .setColor(color)
                        .addFields(
                            { name: `Tus Cartas (${playerTotal})`, value: playerCards.join(', '), inline: true },
                            { name: `Cartas del Dealer (${dealerTotal})`, value: dealerCards.join(', '), inline: true },
                            { name: 'Resultado', value: resultText, inline: false }
                        );

                    return i.update({ embeds: [finalEmbed], components: [] });
                }
            });
            return;
        }

        if (commandName === 'ruleta') {
            const bet = options.getInteger('apuesta');
            const choice = options.getString('opcion').toLowerCase();

            let account = await Economy.findOne({ guildId: guild.id, userId: user.id });
            if (!account || account.cash < bet || bet <= 0) {
                return interaction.reply({ content: '❌ No tienes suficiente dinero en efectivo o la apuesta es inválida.', flags: [MessageFlags.Ephemeral] });
            }

            const validChoices = ['rojo', 'negro', 'verde'];
            const numChoice = parseInt(choice);
            const isNum = !isNaN(numChoice) && numChoice >= 0 && numChoice <= 36;

            if (!validChoices.includes(choice) && !isNum) {
                return interaction.reply({ content: '❌ Opción inválida. Elige `rojo`, `negro`, `verde` o un número del `0` al `36`.', flags: [MessageFlags.Ephemeral] });
            }

            account.cash -= bet;

            const winningNumber = Math.floor(Math.random() * 37);
            let winningColor = 'verde';
            if (winningNumber !== 0) {
                const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
                winningColor = reds.includes(winningNumber) ? 'rojo' : 'negro';
            }

            let won = false;
            let multiplier = 0;

            if (isNum && numChoice === winningNumber) {
                won = true;
                multiplier = 35;
            } else if (choice === winningColor) {
                won = true;
                multiplier = winningColor === 'verde' ? 14 : 2;
            }

            let winnings = 0;
            if (won) {
                winnings = bet * multiplier;
                account.cash += winnings;
            }

            await account.save();

            const embed = new EmbedBuilder()
                .setTitle('🎰 Ruleta del Casino')
                .setColor(won ? 'Green' : 'Red')
                .setDescription(`La bola cayó en el **${winningNumber}** (${winningColor.toUpperCase()})`)
                .addFields(
                    { name: 'Tu Apuesta', value: `$${bet.toLocaleString()} a **${choice}**`, inline: true },
                    { name: 'Resultado', value: won ? `🎉 ¡Has ganado **$${winnings.toLocaleString()}**!` : `😢 Has perdido **$${bet.toLocaleString()}**.`, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'serverstats') {
            const sub = options.getSubcommand();

            if (sub === 'setup') {
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

                try {
                    const category = await guild.channels.create({
                        name: '📊 ESTADÍSTICAS',
                        type: ChannelType.GuildCategory,
                        position: 0,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    });

                    await guild.members.fetch();
                    const total = guild.memberCount;
                    const bots = guild.members.cache.filter(m => m.user.bot).size;
                    const humans = total - bots;
                    const channelsCount = guild.channels.cache.size;

                    const totalChan = await guild.channels.create({
                        name: `👥 Miembros: ${total}`,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        position: 0
                    });

                    const humanChan = await guild.channels.create({
                        name: `👤 Usuarios: ${humans}`,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        position: 1
                    });

                    const botChan = await guild.channels.create({
                        name: `🤖 Bots: ${bots}`,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        position: 2
                    });

                    const chanCount = await guild.channels.create({
                        name: `📁 Canales: ${channelsCount}`,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        position: 3
                    });

                    await ServerStats.findOneAndUpdate(
                        { guildId: guild.id },
                        {
                            totalMembersChannelId: totalChan.id,
                            humansChannelId: humanChan.id,
                            botsChannelId: botChan.id,
                            channelsCountChannelId: chanCount.id
                        },
                        { upsert: true, new: true }
                    );

                    await interaction.editReply('✅ ¡Sistema de estadísticas configurado con éxito!');
                } catch (error) {
                    console.error(error);
                    await interaction.editReply('❌ Hubo un error al crear los canales de estadísticas: ' + error.message);
                }
            } else if (sub === 'disable') {
                const config = await ServerStats.findOne({ guildId: guild.id });
                if (!config) {
                    return interaction.reply({ content: '❌ El sistema de estadísticas no está configurado en este servidor.', flags: [MessageFlags.Ephemeral] });
                }

                await ServerStats.deleteOne({ guildId: guild.id });
                await interaction.reply({ content: '✅ Se ha desactivado el registro de estadísticas.', flags: [MessageFlags.Ephemeral] });
            }
            return;
        }

        if (commandName === 'sortear') {
            const durationStr = options.getString('duracion');
            const prize = options.getString('premio');
            const winnerCount = options.getInteger('ganadores');

            const durationMs = parseDuration(durationStr);
            if (!durationMs) {
                return interaction.reply({ content: '❌ Duración inválida. Usa formatos como `30s`, `10m`, `2h` o `1d`.', flags: [MessageFlags.Ephemeral] });
            }

            const endTime = new Date(Date.now() + durationMs);

            const giveawayEmbed = new EmbedBuilder()
                .setTitle('🎉 ¡NUEVO SORTEO! 🎉')
                .setColor('Gold')
                .setDescription(`Premio: **${prize}**\nGanadores: **${winnerCount}**\nTermina: <t:${Math.floor(endTime.getTime() / 1000)}:R>\nParticipantes: **0**`)
                .setTimestamp(endTime);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('unirse_sorteo').setLabel('🎁 Participar').setStyle(ButtonStyle.Primary)
            );

            const giveawayMessage = await channel.send({ embeds: [giveawayEmbed], components: [row] });

            await Giveaway.create({
                guildId: guild.id,
                channelId: channel.id,
                messageId: giveawayMessage.id,
                prize,
                winnerCount,
                endTime,
                participants: [],
                winners: [],
                ended: false
            });

            return interaction.reply({ content: '✅ ¡Sorteo iniciado con éxito!', flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 're-sortear') {
            const messageId = options.getString('mensaje_id');

            const giveaway = await Giveaway.findOne({ messageId });
            if (!giveaway) {
                return interaction.reply({ content: '❌ No se encontró ningún sorteo registrado con ese ID.', flags: [MessageFlags.Ephemeral] });
            }

            if (giveaway.participants.length === 0) {
                return interaction.reply({ content: '❌ Nadie participó en este sorteo.', flags: [MessageFlags.Ephemeral] });
            }

            const availableParticipants = giveaway.participants.filter(id => !giveaway.winners.includes(id));
            if (availableParticipants.length === 0) {
                return interaction.reply({ content: '❌ Todos los participantes ya han sido seleccionados.', flags: [MessageFlags.Ephemeral] });
            }

            const newWinnerId = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
            giveaway.winners.push(newWinnerId);
            await giveaway.save();

            const channel = guild.channels.cache.get(giveaway.channelId);
            if (channel) {
                await channel.send(`🔄 ¡Nuevo ganador re-sorteado para **${giveaway.prize}**! Felicidades <@${newWinnerId}> 🎉`);
            }

            return interaction.reply({ content: `✅ Nuevo ganador seleccionado: <@${newWinnerId}>`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'test-log') {
            await sendModLog(guild, '🧪 Prueba de Logs', `Prueba enviada por **${user.tag}**.`, 'Blue');
            return interaction.reply({ content: '✅ Mensaje de prueba enviado.', flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'setup-support') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('crear_ticket').setLabel('🎟️ Abrir Ticket de Soporte').setStyle(ButtonStyle.Primary)
            );

            await channel.send({
                content: '**SOPORTE OFICIAL BLOBLOX IA**\nHaz clic en el botón de abajo para abrir un ticket privado.',
                components: [row]
            });

            await interaction.reply({ content: '¡Panel de tickets enviado con éxito!', flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'say') {
            const text = options.getString('mensaje');
            await channel.send(text);
            await interaction.reply({ content: '✅ Mensaje enviado.', flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'add-role') {
            const messageId = options.getString('mensaje_id');
            const emojiInput = options.getString('emoji');
            const role = options.getRole('rol');

            try {
                const targetMessage = await channel.messages.fetch(messageId).catch(() => null);
                if (!targetMessage) {
                    return interaction.reply({ content: '❌ No se encontró el mensaje.', flags: [MessageFlags.Ephemeral] });
                }

                await targetMessage.react(emojiInput);
                const emojiParsed = targetMessage.reactions.cache.last()?.emoji.id || targetMessage.reactions.cache.last()?.emoji.name || emojiInput;
                const key = `${messageId}_${emojiParsed}`;

                reactionRolesMap.set(key, role.id);
                await interaction.reply({ content: `✅ ¡Reaction-role vinculado para ${role.name}!`, flags: [MessageFlags.Ephemeral] });
            } catch (error) {
                await interaction.reply({ content: '❌ Emoji inválido o error al reaccionar.', flags: [MessageFlags.Ephemeral] });
            }
        }

        if (commandName === 'set-level-channel') {
            const selectedChannel = options.getChannel('canal');
            await GuildConfig.findOneAndUpdate({ guildId: guild.id }, { levelChannelId: selectedChannel.id }, { upsert: true, new: true });
            await interaction.reply({ content: `✅ Canal de niveles configurado en ${selectedChannel}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'reward-level') {
            const levelNum = options.getInteger('nivel');
            const role = options.getRole('rol');
            await LevelReward.findOneAndUpdate({ guildId: guild.id, level: levelNum }, { roleId: role.id }, { upsert: true, new: true });
            await interaction.reply({ content: `✅ Recompensa establecida: Nivel ${levelNum} otorga el rol ${role.name}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'set-welcome-channel') {
            const messageId = options.getString('mensaje_id');
            let customText = null;
            if (messageId) {
                const fetchedMsg = await channel.messages.fetch(messageId).catch(() => null);
                if (fetchedMsg) customText = fetchedMsg.content;
            }
            const updateData = { welcomeChannelId: channel.id };
            if (customText) updateData.welcomeMessage = customText;
            await GuildConfig.findOneAndUpdate({ guildId: guild.id }, updateData, { upsert: true, new: true });
            await interaction.reply({ content: `✅ Canal de bienvenidas configurado en ${channel}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'set-bye-channel') {
            const messageId = options.getString('mensaje_id');
            let customText = null;
            if (messageId) {
                const fetchedMsg = await channel.messages.fetch(messageId).catch(() => null);
                if (fetchedMsg) customText = fetchedMsg.content;
            }
            const updateData = { byeChannelId: channel.id };
            if (customText) updateData.byeMessage = customText;
            await GuildConfig.findOneAndUpdate({ guildId: guild.id }, updateData, { upsert: true, new: true });
            await interaction.reply({ content: `✅ Canal de despedidas configurado en ${channel}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'set-bump-channel') {
            await GuildConfig.findOneAndUpdate({ guildId: guild.id }, { bumpChannelId: channel.id }, { upsert: true, new: true });
            await interaction.reply({ content: `✅ Canal de bump configurado.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'set-log-channel') {
            await GuildConfig.findOneAndUpdate({ guildId: guild.id }, { logChannelId: channel.id }, { upsert: true, new: true });
            await interaction.reply({ content: `✅ Canal de logs configurado.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'ban') {
            const targetUser = options.getUser('usuario');
            const reason = options.getString('razon') || 'Sin razón';
            await guild.members.ban(targetUser.id, { reason });
            await interaction.reply({ content: `✅ Usuario ${targetUser.tag} baneado.`, flags: [MessageFlags.Ephemeral] });
            await sendModLog(guild, '🔨 Baneado', `Usuario: ${targetUser.tag}\nRazón: ${reason}`, 'Red');
        }

        if (commandName === 'desban') {
            const userId = options.getString('userid');
            const reason = options.getString('razon') || 'Sin razón';
            await guild.members.unban(userId, reason);
            await interaction.reply({ content: `✅ Usuario con ID ${userId} desbaneado.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'kick') {
            const targetUser = options.getUser('usuario');
            const reason = options.getString('razon') || 'Sin razón';
            const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
            await targetMember.kick(reason);
            await interaction.reply({ content: `✅ Usuario ${targetUser.tag} expulsado.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'mute') {
            const targetUser = options.getUser('usuario');
            const minutes = options.getInteger('minutos');
            const reason = options.getString('razon') || 'Sin razón';
            const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
            await targetMember.timeout(minutes * 60 * 1000, reason);
            await interaction.reply({ content: `✅ Silenciado por ${minutes} min.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'unmute') {
            const targetUser = options.getUser('usuario');
            const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
            await targetMember.timeout(null);
            await interaction.reply({ content: `✅ Silencio retirado a ${targetUser.tag}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'warn') {
            const targetUser = options.getUser('usuario');
            const reason = options.getString('razon');
            await Infraction.create({ guildId: guild.id, userId: targetUser.id, moderatorId: user.id, type: 'warn', reason });
            await interaction.reply({ content: `⚠️ Advertencia registrada a ${targetUser.tag}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'warns') {
            const targetUser = options.getUser('usuario');
            const warns = await Infraction.find({ guildId: guild.id, userId: targetUser.id, type: 'warn' });
            const embed = new EmbedBuilder().setTitle(`Warns de ${targetUser.tag}`).setDescription(warns.map(w => `• ${w.reason}`).join('\n') || 'Sin warns');
            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'delwarn') {
            const infractionId = options.getString('id');
            await Infraction.findByIdAndDelete(infractionId);
            await interaction.reply({ content: `✅ Infracción eliminada.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'note') {
            const targetUser = options.getUser('usuario');
            const text = options.getString('texto');
            await Infraction.create({ guildId: guild.id, userId: targetUser.id, moderatorId: user.id, type: 'note', reason: text });
            await interaction.reply({ content: `📝 Nota guardada.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'notes') {
            const targetUser = options.getUser('usuario');
            const notes = await Infraction.find({ guildId: guild.id, userId: targetUser.id, type: 'note' });
            const embed = new EmbedBuilder().setTitle(`Notas de ${targetUser.tag}`).setDescription(notes.map(n => `• ${n.reason}`).join('\n') || 'Sin notas');
            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'rank') {
            const targetUser = options.getUser('usuario') || user;
            const userLevel = await Level.findOne({ guildId: guild.id, userId: targetUser.id });
            const embed = new EmbedBuilder().setTitle(`Nivel de ${targetUser.tag}`).setDescription(`Nivel: **${userLevel?.level || 0}**\nXP: **${userLevel?.xp || 0}**`);
            await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'leaderboard') {
            const topUsers = await Level.find({ guildId: guild.id }).sort({ level: -1, xp: -1 }).limit(10);
            const embed = new EmbedBuilder().setTitle('🏆 Leaderboard').setDescription(topUsers.map((u, i) => `#${i + 1} <@${u.userId}> — Nivel ${u.level}`).join('\n') || 'Vacío');
            await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'purge') {
            const amount = options.getInteger('cantidad');
            const deleted = await channel.bulkDelete(amount, true);
            await interaction.reply({ content: `✅ Borrados ${deleted.size} mensajes.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'purgeblox') {
            const amount = options.getInteger('cantidad');
            const messages = await channel.messages.fetch({ limit: 100 });
            const botMessages = messages.filter(m => m.author.id === client.user.id).first(amount);
            await channel.bulkDelete(botMessages, true);
            await interaction.reply({ content: `✅ Purgados ${botMessages.length} mensajes del bot.`, flags: [MessageFlags.Ephemeral] });
        }

        if (commandName === 'members') {
            await guild.members.fetch();
            const membersArray = Array.from(guild.members.cache.values());
            const embed = new EmbedBuilder()
                .setTitle(`Miembros (${membersArray.length})`)
                .setDescription(membersArray.slice(0, 10).map(m => `• ${m.user.tag}`).join('\n'));
            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'help_menu') {
        const selected = interaction.values[0];
        let embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

        if (selected === 'home') {
            embed.setTitle('🤖 Comandos de Bloblox Support')
                 .setDescription('» **Menú de ayuda**\nTengo **6 categorías** de comandos para explorar.\n\n» **Categorías**\nUsa el menú desplegable de abajo para navegar entre las diferentes categorías de comandos y ver su información detallada.');
        } else if (selected === 'moderation') {
            embed.setTitle('🛡️ Moderación')
                 .setDescription('Herramientas de control y seguridad para el servidor:\n\n`/ban` - Banea a un usuario.\n`/desban` - Desbanea por ID.\n`/kick` - Expulsa a un usuario.\n`/mute` - Silencia temporalmente (Timeout).\n`/unmute` - Quita el silencio.\n`/warn` - Registra una advertencia.\n`/warns` - Muestra advertencias.\n`/delwarn` - Borra una infracción.\n`/note` - Añade una nota interna.\n`/notes` - Muestra notas internas.\n`/purge` - Borra mensajes masivamente.\n`/purgeblox` - Borra mensajes del bot.');
        } else if (selected === 'tickets') {
            embed.setTitle('🎟️ Soporte & Tickets')
                 .setDescription('Sistema automatizado de asistencia privada:\n\n`/setup-support` - Envía el panel permanente de creación de tickets en el canal actual.');
        } else if (selected === 'social') {
            embed.setTitle('🏆 Niveles, Social & Economía')
                 .setDescription('Sistema de experiencia, rangos, economía y minijuegos de casino:\n\n`/rank` - Muestra tu nivel y XP.\n`/leaderboard` - Tabla de clasificación general.\n`/set-level-channel` - Canal de avisos de nivel.\n`/reward-level` - Asigna roles por nivel.\n`/balance` - Revisa tu dinero en efectivo y banco.\n`/daily` - Reclama tu dinero diario.\n`/work` - Trabaja para ganar dinero.\n`/deposit` - Deposita dinero en el banco.\n`/withdraw` - Retira dinero del banco.\n`/dar` - Transfiere dinero a otro usuario.\n`/economy-add` - Añade o quita dinero (Admin).\n`/blackjack` - Juega al Blackjack apostando dinero.\n`/ruleta` - Juega a la ruleta del casino.');
        } else if (selected === 'welcomes') {
            embed.setTitle('👋 Bienvenidas & Despedidas')
                 .setDescription('Mensajes automáticos personalizados para nuevos miembros:\n\n`/set-welcome-channel` - Configura el canal de bienvenidas.\n`/set-bye-channel` - Configura el canal de despedidas.');
        } else if (selected === 'utils') {
            embed.setTitle('🎁 Sorteos & Utilidades')
                 .setDescription('Herramientas de utilidad y entretenimiento:\n\n`/sortear` - Crea un nuevo sorteo.\n`/re-sortear` - Elige un nuevo ganador.\n`/serverstats` - Estadísticas en vivo del servidor en canales de voz.\n`/add-role` - Crea autoroles por reacciones.\n`/set-bump-channel en mantenimiento` - Recordatorios automáticos de Disboard.\n`/set-log-channel` - Canal de registros de moderación.\n`/say` - Envía un anuncio como bot.');
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('📂 Selecciona una categoría...')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('Inicio').setValue('home').setEmoji('🏠').setDefault(selected === 'home'),
                new StringSelectMenuOptionBuilder().setLabel('Moderación').setValue('moderation').setEmoji('🛡️').setDefault(selected === 'moderation'),
                new StringSelectMenuOptionBuilder().setLabel('Soporte & Tickets').setValue('tickets').setEmoji('🎟️').setDefault(selected === 'tickets'),
                new StringSelectMenuOptionBuilder().setLabel('Niveles & Social').setValue('social').setEmoji('🏆').setDefault(selected === 'social'),
                new StringSelectMenuOptionBuilder().setLabel('Bienvenidas').setValue('welcomes').setEmoji('👋').setDefault(selected === 'welcomes'),
                new StringSelectMenuOptionBuilder().setLabel('Sorteos & Utilidades').setValue('utils').setEmoji('🎁').setDefault(selected === 'utils')
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);
        const closeButtonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('help_close').setLabel('🔒 Cerrar Menú').setStyle(ButtonStyle.Danger)
        );

        return interaction.update({ embeds: [embed], components: [row, closeButtonRow] });
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'help_close') {
            return interaction.update({ content: '🔒 Menú cerrado.', embeds: [], components: [] });
        }

        if (interaction.customId === 'unirse_sorteo') {
            const giveaway = await Giveaway.findOne({ messageId: interaction.message.id, ended: false });
            if (!giveaway) return interaction.reply({ content: '❌ Sorteo finalizado.', flags: [MessageFlags.Ephemeral] });

            if (giveaway.participants.includes(interaction.user.id)) {
                giveaway.participants = giveaway.participants.filter(id => id !== interaction.user.id);
                await giveaway.save();
                return interaction.reply({ content: '❌ Te has retirado del sorteo.', flags: [MessageFlags.Ephemeral] });
            } else {
                giveaway.participants.push(interaction.user.id);
                await giveaway.save();
                return interaction.reply({ content: '🎁 ¡Te has unido al sorteo!', flags: [MessageFlags.Ephemeral] });
            }
        }

        if (interaction.customId === 'crear_ticket') {
            const guild = interaction.guild;
            const user = interaction.user;

            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ],
            });

            await Ticket.create({ guildId: guild.id, userId: user.id, channelId: ticketChannel.id, status: 'abierto' });

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('cerrar_ticket').setLabel('🔒 Cerrar Ticket').setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ content: `¡Hola ${user}! Un administrador te atenderá pronto.`, components: [closeRow] });
            await interaction.reply({ content: 'Ticket creado: ' + ticketChannel, flags: [MessageFlags.Ephemeral] });
        }

        if (interaction.customId === 'cerrar_ticket') {
            const channel = interaction.channel;
            await Ticket.findOneAndUpdate({ channelId: channel.id }, { status: 'cerrado' });
            await interaction.reply({ content: 'Cerrando ticket...', flags: [MessageFlags.Ephemeral] });
            setTimeout(() => channel.delete().catch(() => {}), 5000);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

// --- SISTEMA ANTI-CRASH (Evita que el bot se apague por errores sueltos) ---
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ [Anti-Crash] Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('⚠️ [Anti-Crash] Excepción no capturada:', error);
});

process.on('uncaughtExceptionMonitor', (error, origin) => {
    console.error('⚠️ [Anti-Crash] Monitor de excepción:', error, origin);
});
