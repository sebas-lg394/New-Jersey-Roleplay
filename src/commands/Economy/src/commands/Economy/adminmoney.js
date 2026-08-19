import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { addMoney, removeMoney } from '../../utils/economy.js';
import { withErrorHandling } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

const MONEY_ROLE_ID = '1522572234370056438';

export default {
    data: new SlashCommandBuilder()
        .setName('adminmoney')
        .setDescription('Administrar el dinero de un usuario')
        .setDMPermission(false)

        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Añadir dinero')
                .addUserOption(option =>
                    option
                        .setName('usuario')
                        .setDescription('Usuario')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('cantidad')
                        .setDescription('Cantidad')
                        .setRequired(true)
                        .setMinValue(1)
                )
                .addStringOption(option =>
                    option
                        .setName('cuenta')
                        .setDescription('Wallet o Bank')
                        .setRequired(true)
                        .addChoices(
                            { name: '💵 Wallet', value: 'wallet' },
                            { name: '🏦 Bank', value: 'bank' }
                        )
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Quitar dinero')
                .addUserOption(option =>
                    option
                        .setName('usuario')
                        .setDescription('Usuario')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('cantidad')
                        .setDescription('Cantidad')
                        .setRequired(true)
                        .setMinValue(1)
                )
                .addStringOption(option =>
                    option
                        .setName('cuenta')
                        .setDescription('Wallet o Bank')
                        .setRequired(true)
                        .addChoices(
                            { name: '💵 Wallet', value: 'wallet' },
                            { name: '🏦 Bank', value: 'bank' }
                        )
                )
        ),

    category: 'Economy',

    execute: withErrorHandling(async (interaction, config, client) => {
        const deferred = await InteractionHelper.safeDefer(interaction);
        if (!deferred) return;

        if (!interaction.member.roles.cache.has(MONEY_ROLE_ID)) {
            return InteractionHelper.safeEditReply(interaction, {
                embeds: [
                    createEmbed({
                        title: '❌ Sin permisos',
                        description: 'No tienes el rol necesario para usar este comando.'
                    })
                ]
            });
        }

        const action = interaction.options.getSubcommand();
        const user = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');
        const type = interaction.options.getString('cuenta');

        let result;

        if (action === 'add') {
            result = await addMoney(
                client,
                interaction.guildId,
                user.id,
                amount,
                type
            );
        } else {
            result = await removeMoney(
                client,
                interaction.guildId,
                user.id,
                amount,
                type
            );
        }

        const emoji = type === 'wallet' ? '💵' : '🏦';
        const actionText = action === 'add' ? 'añadido' : 'quitado';

        return InteractionHelper.safeEditReply(interaction, {
            embeds: [
                createEmbed({
                    title: '💰 Dinero actualizado',
                    description:
                        `${emoji} Se ha ${actionText} **$${amount.toLocaleString()}**.\n\n` +
                        `👤 **Usuario:** ${user}\n` +
                        `💳 **Cuenta:** ${type}\n` +
                        `💰 **Nuevo saldo:** $${result.newBalance.toLocaleString()}`
                })
            ]
        });
    }, { command: 'adminmoney' })
};
