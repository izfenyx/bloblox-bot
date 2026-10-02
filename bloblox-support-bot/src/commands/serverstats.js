import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import ServerStats from '../models/ServerStats.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('Configura o desactiva el sistema de estadísticas del servidor.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Crea y configura automáticamente los canales de estadísticas.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Desactiva y limpia las estadísticas del servidor.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guild = interaction.guild;

        if (sub === 'setup') {
            await interaction.deferReply({ ephemeral: true });

            try {
                // Crear categoría
                const category = await guild.channels.create({
                    name: '📊 ESTADÍSTICAS',
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                });

                const total = guild.memberCount;
                const bots = guild.members.cache.filter(m => m.user.bot).size;
                const humans = total - bots;
                const channelsCount = guild.channels.cache.size;

                // Crear canales de voz bloqueados
                const totalChan = await guild.channels.create({
                    name: `👥 Miembros: ${total}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                });

                const humanChan = await guild.channels.create({
                    name: `👤 Usuarios: ${humans}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                });

                const botChan = await guild.channels.create({
                    name: `🤖 Bots: ${bots}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                });

                const chanCount = await guild.channels.create({
                    name: `📁 Canales: ${channelsCount}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                });

                // Guardar en Base de Datos
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

                await interaction.editReply('¡Sistema de estadísticas configurado con éxito! Los canales se actualizarán automáticamente.');
            } catch (error) {
                console.error(error);
                await interaction.editReply('Hubo un error al crear los canales de estadísticas (¿tengo permisos de Administrador?): ' + error.message);
            }
        } else if (sub === 'disable') {
            const config = await ServerStats.findOne({ guildId: guild.id });
            if (!config) {
                return interaction.reply({ content: 'El sistema de estadísticas no está configurado en este servidor.', ephemeral: true });
            }

            await ServerStats.deleteOne({ guildId: guild.id });
            await interaction.reply({ content: 'Se ha desactivado el registro de estadísticas en la base de datos (puedes borrar los canales de voz manualmente si lo deseas).', ephemeral: true });
        }
    }
};