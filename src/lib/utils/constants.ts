export const zws = "\u200B";
export const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36";

export const regex = {
    youtube: /(youtu\.be\/|youtube\.com\/)/g,
    spotify: /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track)(?:[/:])([A-Za-z0-9]+).*$/g,
};

export enum KoosColor {
    Error = 0xf21100,
    Success = 0x3fb97c,
    Warn = 0xffb132,
    Default = 0xda6c56,
}

export enum PermissionLevel {
    Everyone = 0,
    DJ = 3,
    Administrator = 6,
    ServerOwner = 7,
    BotOwner = 10,
}

export enum Emoji {
    Yes = "<:yes:896571151315255366>",
    No = "<:no:926367736794341428>",
    Blank = "<:blank:1020712225616445561> ",
    Loading = "<a:loading:1027594528460386495>",
    Play = "<:play:1113811613082980492>",
    Pause = "<:pause:1113811608645406740>",
    Previous = "<:previous:1113811599858339860>",
    Skip = "<:skip:1113811604203638856>",
    Stop = "<:stop:1113811615628931072>",
}

export enum ButtonId {
    // Dashboard
    PauseOrResume = "bPauseOrResume",
    Previous = "bPrevious",
    Skip = "bSkip",
    Stop = "bStop",

    // Paginations
    First = "bFirst",
    Back = "bBack",
    Jump = "bJump",
    Next = "bNext",
    Last = "bLast",
    Close = "bClose",

    // Playlist
    Return = "bReturn",
    PlayPlaylist = "bPlayPlaylist",
    ManagePlaylist = "bManagePlaylist",
    Rename = "bRename",
    Delete = "bDelete",

    // Others
    Cancel = "bCancel",
    Votes = "bVotes",
    VotesInfo = "bVotesInfo",
    Refresh = "bRefresh",
}

export enum SelectMenuId {
    Lyrics = "sMLyrics",
    Search = "sMSearch",
    Playlist = "sMPlaylist",
    PlaylistManage = "sMPlaylistManage",
    NewPlaylist = "sMNewPlaylist",
}

export enum SelectMenuValue {
    PlaylistManage = "sMVPlaylistManage",
    NewPlaylist = "sMVNewPlaylist",
}

export enum TextInputId {
    PageInput = "tIPageInput",
    PlaylistName = "tIPlaylistName",
    AddTracks = "tIAddTracks",
    RenamePlaylist = "tIRenamePlaylist",
}
