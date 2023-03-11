import { Listener, container } from "@sapphire/framework";
import { KazagumoPlayer, KazagumoTrack, Events } from "kazagumo";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { embedColor } from "#utils/constants";
import { convertTime } from "#utils/functions";
import { Buttons } from "#lib/utils/constants";
import { oneLine } from "common-tags";

@ApplyOptions<Listener.Options>({
    emitter: container.kazagumo,
    name: `kazagumo:${Events.PlayerStart}`,
    event: Events.PlayerStart,
})
export class ClientListener extends Listener {
    public async run(player: KazagumoPlayer, track: KazagumoTrack) {
        const { client, db } = this.container;

        const data = await db.guild.findUnique({ where: { id: player.guildId } });
        const channel = client.channels.cache.get(player.textId) ?? (await client.channels.fetch(player.textId).catch(() => null));
        if (!channel) return;

        let title =
            track.sourceName == "youtube" ? `[${track.title}](${track.uri})` : `[${track.title} by ${track.author}](${track.uri})`;

        const embed = new MessageEmbed() //
            .setDescription(
                oneLine`
                    ${title} [${track.isStream ? `Live` : convertTime(Number(track.length))}]
                    ${data?.requester ? ` ~ ${track.requester}` : ""}
                `
            )
            .setColor(embedColor.default);
        const playerButtons = [
            new MessageButton().setLabel("Pause").setCustomId(Buttons.PauseOrResume).setStyle("SUCCESS"),
            new MessageButton().setLabel("Skip").setCustomId(Buttons.Skip).setStyle("PRIMARY"),
            new MessageButton().setLabel("Stop").setCustomId(Buttons.Stop).setStyle("DANGER"),
            new MessageButton().setLabel("Show Queue").setCustomId(Buttons.ShowQueue).setStyle("SECONDARY"),
        ];
        const row = new MessageActionRow().setComponents(playerButtons);

        if (channel.isText()) {
            const msg = await channel.send({ embeds: [embed], components: [row] });
            player.data.set("nowPlayingMessage", msg);
        }
    }
}
