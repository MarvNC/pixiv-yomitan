# Pixiv Encyclopedia for Yomitan

Pixiv Encyclopedia for Yomitan is a a complete scrape of the public
[dic.pixiv.net](https://dic.pixiv.net/) encyclopedia of over 540,000 entries,
containing a brief summary and links to related articles for each entry. The
Pixiv encyclopedia is quite extensive, with a particular focus on popular
culture but containing entries for most things. For instance, 和泉妃愛 has an
entry as does likely every notable VTuber, media franchise, and mountain in
Japan.

## Development

This reads from `.env` (optional) for `NODE_ENV`. If it is set to `dev`, then
the exported dictionary will contain only five entries for the purpose of
development.
