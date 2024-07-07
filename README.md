Discord bot to notify my course ville assignments

basically mcv web scraper
# how it works:
- fetch courses to find added course
- fetch assignments of each course, see if it is a new assignment
- use the new assignments to create a message sent to each notification channels

# database:
- postgres with prisma as ORM

# our bot:
- you can use our [bot](https://discord.com/oauth2/authorize?client_id=1196200401582686248) ran by HRNPH 's server
(old one ran by Render.com has retired)

# commands:
- /setnotification -> set this channel as notification channel
- /unsetnotification -> unset guild's notification channel
- /update -> manually update assignments list

made by ggFROOK(NewBieCoderXD)
