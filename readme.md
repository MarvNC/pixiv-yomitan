# Pixiv Encyclopedia for Yomitan

[![](https://img.shields.io/github/v/tag/marvnc/pixiv-yomitan?style=for-the-badge&label=Last%20Release)](https://github.com/MarvNC/pixiv-yomitan/releases/latest)

Pixiv Encyclopedia for Yomitan is a conversion of the public
[Pixiv Encyclopedia (ピクシブ百科事典)](https://dic.pixiv.net/) of over 630,000
entries for [Yomitan](https://github.com/themoeway/yomitan). The encyclopedia is
quite extensive, with a focus on popular culture but containing entries for many
proper nouns. For instance, 和泉妃愛 has an entry as does likely every notable
VTuber, media franchise, and mountain in Japan.

A new release of Pixiv for Yomitan is automatically created daily using data
sourced from the updated dumps at
[pixiv-dump](https://github.com/MarvNC/pixiv-dump).

Built using
[yomichan-dict-builder](https://github.com/MarvNC/yomichan-dict-builder).

## Usage

- You can download the latest release from the
  [releases page](https://github.com/MarvNC/pixiv-yomitan/releases).
  - The `Pixiv` release is the full version of the encyclopedia, containing both
    the short summary as well as the 概要 if applicable and 関連記事.
  - The `PixivLight` release is a lightweight version (though still quite large)
    of the encyclopedia, omitting the 概要 and 関連記事 to save on storage
    space.
  - An MDict version of the dictionary from 2024-02-20 converted by an anon is
    [available here](https://github.com/MarvNC/pixiv-yomitan/releases/tag/2024-02-20).

<!-- prettier-ignore -->
> [!IMPORTANT] 
> These dictionaries are quite large and may take 2-20+ minutes to
> import depending on your device. After import, as much as 500MB+ of 
> storage may be consumed by Yomitan.

## Screenshots

|                                                                                       Pixiv                                                                                       |                                                                                    PixivLight                                                                                     |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|       ![chrome_和泉妃愛_-_Yomitan_Search_-_Google_Chrome_2024-02-17_11-51-41](https://github.com/MarvNC/pixiv-yomitan/assets/17340496/b88dd10c-ddb7-4360-9d12-a0a072242ab5)       |       ![chrome_和泉妃愛_-_Yomitan_Search_-_Google_Chrome_2024-02-17_11-44-39](https://github.com/MarvNC/pixiv-yomitan/assets/17340496/a7ca3596-53dc-4a8b-a1af-d19c64a871cb)       |
| ![chrome_喫茶ステラと死神の蝶_-_Yomitan_Search_-_Google_Chrome_2024-02-17_11-51-48](https://github.com/MarvNC/pixiv-yomitan/assets/17340496/27e307f5-5711-46e2-9adc-76e9205756a2) | ![chrome_喫茶ステラと死神の蝶_-_Yomitan_Search_-_Google_Chrome_2024-02-17_11-44-49](https://github.com/MarvNC/pixiv-yomitan/assets/17340496/f3622e4d-3193-422b-9135-d89009eac54d) |
|         ![chrome_魔族_-_Yomitan_Search_-_Google_Chrome_2024-02-17_11-52-11](https://github.com/MarvNC/pixiv-yomitan/assets/17340496/8a2d2987-acae-4df8-aa72-fba23064885c)         |         ![chrome_魔族_-_Yomitan_Search_-_Google_Chrome_2024-02-17_11-45-17](https://github.com/MarvNC/pixiv-yomitan/assets/17340496/e39bc4d7-2864-4610-acb9-7dc5520514d1)         |
|     ![chrome_しちほうけん_-_Yomitan_Search_-_Google_Chrome_2024-02-17_11-52-18](https://github.com/MarvNC/pixiv-yomitan/assets/17340496/6d9af42d-50ef-47c3-ac06-94817d5a1a2f)     |     ![chrome_しちほうけん_-_Yomitan_Search_-_Google_Chrome_2024-02-17_11-45-23](https://github.com/MarvNC/pixiv-yomitan/assets/17340496/4e12da21-f8f7-449d-a60e-c9f7524a0feb)     |
|                                                                                     **MDict**                                                                                     |                                                                                                                                                                                   |
|                                      ![pixiv](https://github.com/MarvNC/pixiv-yomitan/assets/17340496/bbac0588-ccbf-4185-805a-2150121d35ea)                                       |                                                                                                                                                                                   |

## Development

This reads from `.env` (optional) for `NODE_ENV`. If it is set to `dev`, then
the exported dictionary will contain fewer entries for faster exports and faster
load times in Yomitan.
