import { ApplyOptions } from "@sapphire/decorators";
import { KazagumoPlayer } from "kazagumo";
import { EmbedBuilder, Message } from "discord.js";
import { KoosColor } from "#utils/constants";
import { reply, send } from "@sapphire/plugin-editable-commands";
import { KoosCommand } from "#lib/extensions";

@ApplyOptions<KoosCommand.Options>({
    description: "Shuffle the queue.",
    preconditions: ["VoiceOnly", "DJ"],
    aliases: ["sh"],
})
export class ShuffleCommand extends KoosCommand {
    public override registerApplicationCommands(registery: KoosCommand.Registry) {
        registery.registerChatInputCommand(
            (builder) =>
                builder //
                    .setName(this.name)
                    .setDescription(this.description),
            { idHints: ["1050092754279088218", "1050094679527538780"] }
        );
    }

    public async chatInputRun(interaction: KoosCommand.ChatInputCommandInteraction) {
        const { kazagumo } = this.container;
        const player = kazagumo.getPlayer(`${interaction.guildId}`);

        if (!player || (player && !player.queue.current))
            return interaction.reply({
                embeds: [{ description: "There's nothing playing in this server", color: KoosColor.Warn }],
                ephemeral: true,
            });

        await interaction.deferReply();

        return interaction.followUp({ embeds: [this.shuffle(player)] });
    }

    public async messageRun(message: Message) {
        const { kazagumo } = this.container;
        const player = kazagumo.getPlayer(message.guildId!)!;

        if (!player || (player && !player.queue.current)) {
            return reply(message, {
                embeds: [{ description: "There's nothing playing in this server", color: KoosColor.Warn }],
            });
        }

        return send(message, { embeds: [this.shuffle(player)] });
    }

    private shuffle(player: KazagumoPlayer) {
        player.queue.shuffle();

        return new EmbedBuilder({ description: `Shuffled the queue`, color: KoosColor.Default });
    }
}
