Discord bot to notify my course ville assignments
# how it works:
- fetch courses to find added course
- fetch assignments of each course, see if it is a new assignment -> put it in stack
- pop each new assignments to create a message sent to notification channels

# database:
- my bot (myCourseVille FROOK bot) uses mongodb due to lack of money 😢
- I have created postgresql database branch feel free to fork it and make your own bot(the branch isn't updated though)

# my bot:
- to invite my bot, use this [link](https://discord.com/api/oauth2/authorize?client_id=1194885205765394512&permissions=2048&scope=bot)
- my server is ran by [Render](https://render.com/) completely free because I have no money nor life ☠

# commands:
- /setnotification -> set this channel as notification channel
- /unsetnotification -> unset guild's notification channel
- /update -> manually update assignments list

made by ggFROOK(NewBieCoderXD)
