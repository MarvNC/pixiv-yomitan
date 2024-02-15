# Pixiv Encyclopedia for Yomitan

Pixiv Encyclopedia for Yomitan is a conversion of the public
[Pixiv Encyclopedia (ピクシブ百科事典)](https://dic.pixiv.net/) of over 540,000
entries for [Yomitan](https://github.com/themoeway/yomitan). The encyclopedia is
quite extensive, with a focus on popular culture but containing entries for many
proper nouns. For instance, 和泉妃愛 has an entry as does likely every notable
VTuber, media franchise, and mountain in Japan.

A new release of Pixiv for Yomitan is automatically created daily using data
sourced from my [pixiv-dump](https://github.com/MarvNC/pixiv-dump) repository,
where the data from Pixiv is scraped and uploaded as a database every day.

Built using
[yomichan-dict-builder](https://github.com/MarvNC/yomichan-dict-builder),
[japanese-furigana-normalize](https://github.com/MarvNC/japanese-furigana-normalize).

## Usage

- You can download the latest release from the
  [releases page](https://github.com/MarvNC/pixiv-yomitan/releases).
  - The `Pixiv` release is the full version of the encyclopedia, containing both
    the short summary as well as the 概要 if applicable and 関連記事.
  - The `PixivLight` release is a lightweight version (though still quite large)
    of the encyclopedia, omitting the 概要 and 関連記事 to save on storage
    space.

<!-- prettier-ignore -->
> [!IMPORTANT] 
> These dictionaries are quite large and may take 2-20+ minutes to
> import depending on your device. After import, as much as 500MB+ of 
> storage may be consumed by Yomitan.

## Development

This reads from `.env` (optional) for `NODE_ENV`. If it is set to `dev`, then
the exported dictionary will contain fewer entries for faster exports and faster
load times in Yomitan.
