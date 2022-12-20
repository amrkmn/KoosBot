import { envParseString } from "#env";
import { KoosCommand } from "#lib/extensions";
import { embedColor } from "#utils/constants";
import { chunk, cutText, decodeEntities, isString, pagination } from "#utils/functions";
import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { isNullish, isNullishOrEmpty } from "@sapphire/utilities";
import { Message, MessageEmbed, MessageSelectOptionData, MessageActionRow, MessageSelectMenu, TextChannel } from "discord.js";
import { Client as GeniusClient } from "genius-lyrics";
import ms from "ms";

@ApplyOptions<KoosCommand.Options>({
    description: "Get the lyrics of a song.",
    aliases: ["ly"],
})
export class UserCommand extends KoosCommand {
    genius = new GeniusClient(envParseString("GENIUS_TOKEN"));

    public override registerApplicationCommands(registery: KoosCommand.Registry) {
        registery.registerChatInputCommand(
            (builder) =>
                builder //
                    .setName(this.name)
                    .setDescription(this.description)
                    .addStringOption((option) =>
                        option //
                            .setName("query")
                            .setDescription("The song name to search")
                            .setAutocomplete(true)
                            .setRequired(false)
                    ),
            { idHints: ["1054747570422947931"] }
        );
    }

    public async chatInputRun(interaction: KoosCommand.ChatInputInteraction) {
        const { kazagumo } = this.container;
        const player = kazagumo.getPlayer(interaction.guildId!)!;

        let query = interaction.options.getString("query") ?? undefined;
        if (isNullish(query)) {
            if (!player || (player && !player.queue.current)) query = undefined;
            else query = `${player.queue.current?.title}`;
        }
        if (isNullish(query))
            return interaction.reply({
                embeds: [new MessageEmbed().setDescription("Please provide a song title").setColor(embedColor.error)],
                ephemeral: true,
            });
        await interaction.deferReply();

        if (isNaN(Number(query))) {
            const songs = await this.genius.songs.search(query);
            if (isNullishOrEmpty(songs))
                return interaction.followUp({ embeds: [{ description: "No result", color: embedColor.error }] });
            const song = songs[0];
            const lyrics = await song.lyrics();

            const lyric = chunk(lyrics.split("\n"), 25);

            const embeds = lyric.reduce((prev: MessageEmbed[], curr) => {
                prev.push(
                    new MessageEmbed()
                        .setDescription(`${decodeEntities(curr.map((x) => x.replace(/^\[[^\]]+\]$/g, "**$&**")).join("\n"))}`)
                        .setTitle(`${cutText(song.title, 128)}`)
                        .setThumbnail(song.thumbnail)
                        .setURL(song.url)
                        .setColor(embedColor.default)
                );
                return prev;
            }, []);

            pagination({ channel: interaction, embeds, target: interaction.user, fastSkip: true });
        } else {
            const song = await this.genius.songs.get(Number(query));
            const lyrics = await song.lyrics();

            const lyric = chunk(lyrics.split("\n"), 25);

            const embeds = lyric.reduce((prev: MessageEmbed[], curr) => {
                prev.push(
                    new MessageEmbed()
                        .setDescription(`${decodeEntities(curr.map((x) => x.replace(/^\[[^\]]+\]$/g, "**$&**")).join("\n"))}`)
                        .setTitle(`${cutText(song.title, 128)}`)
                        .setThumbnail(song.thumbnail)
                        .setURL(song.url)
                        .setColor(embedColor.default)
                );
                return prev;
            }, []);

            pagination({ channel: interaction, embeds, target: interaction.user, fastSkip: true });
        }
    }

    public async messageRun(message: Message, args: Args) {
        const { kazagumo } = this.container;
        const player = kazagumo.getPlayer(message.guildId!)!;
        const query = await args.rest("string").catch(() => {
            if (!player || (player && !player.queue.current)) {
                return undefined;
            }
            return `${player.queue.current?.title}`;
        });

        const { embed, row } = await this.lyrics(message, query);

        const msg = await send(message, { embeds: [embed], components: row ? [row] : undefined });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => {
                if (i.user.id !== message.author.id) {
                    i.reply({
                        embeds: [{ description: `This select menu can only be use by ${message.author}`, color: embedColor.error }],
                        ephemeral: true,
                    });
                    return false;
                }
                return true;
            },
            componentType: "SELECT_MENU",
            idle: ms("1m"),
        });

        collector.on("collect", async (i) => {
            if (!i.isSelectMenu()) return;
            await i.deferUpdate();
            const id = i.customId;
            if (id !== "lyricsOptions") return;

            await send(message, { embeds: [{ description: "Fetching lyrics...", color: embedColor.default }] });
            const song = await this.genius.songs.get(Number(i.values[0]));
            const lyrics = await song.lyrics();

            const lyric = chunk(lyrics.split("\n"), 25);

            const embeds = lyric.reduce((prev: MessageEmbed[], curr) => {
                prev.push(
                    new MessageEmbed()
                        .setDescription(`${decodeEntities(curr.map((x) => x.replace(/^\[[^\]]+\]$/g, "**$&**")).join("\n"))}`)
                        .setTitle(`${cutText(song.title, 128)}`)
                        .setThumbnail(song.thumbnail)
                        .setURL(song.url)
                        .setColor(embedColor.default)
                );
                return prev;
            }, []);

            await i.deleteReply();
            pagination({ channel: message.channel as TextChannel, embeds, target: message.author, fastSkip: true });
            collector.stop("selected");
            return;
        });
    }

    private async lyrics(message: Message | KoosCommand.ChatInputInteraction, query?: string) {
        if (!query) return { embed: new MessageEmbed().setDescription("Please provide a song title").setColor(embedColor.error) };
        let result = await this.genius.songs.search(query);

        result = result.slice(0, 10);

        if (isNullishOrEmpty(result)) return { embed: new MessageEmbed().setDescription("No result").setColor(embedColor.error) };

        const options: MessageSelectOptionData[] = [];

        for (let i = 0; i < result.length; i++) {
            const song = result[i];
            options.push({
                label: cutText(`${i + 1}. ${song.fullTitle}`, 100),
                value: `${song.id}`,
            });
        }

        const selectMenu = new MessageSelectMenu().setCustomId("lyricsOptions").setOptions(options).setPlaceholder("Make a selection");
        const row = new MessageActionRow().setComponents(selectMenu);

        const description: string[] = [];

        let i = 0;
        for (let { fullTitle, url } of result) {
            description.push(`**${i++ + 1}.** [${fullTitle}](${url})`);
        }
        return {
            embed: new MessageEmbed().setDescription(description.join("\n")).setColor(embedColor.default),
            row,
        };
    }
}
