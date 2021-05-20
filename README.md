# discord-bot

This is DoomBot, our friendly neighborhood Doom slayer, who helps us keep Doom's [Discord server](https://doomemacs.org/disocrd) neat and tidy.

## Features

+ [X] Keeps a notice at the bottom of select channels.
+ [X] Auto-deletes messages in help channels that:
  + Do not ping `@helpme`
  + Aren't a reply to another user
  + Or isn't a direct (or near-enough) follow up to another message by the same
    user (within a timeframe of 10 minutes).
+ [ ] Auto-answers common questions.
+ [ ] Implements slash commands
  + [ ] `/describe THING` for looking up documentation on a symbol, Doom modules, or package (using the I-run-code bot)
  + [ ] `/wrongchannel messageID rightchannel` deletes a message and lets the user know it was posted in the wrong channel, and should be posted in RIGHTCHANNEL. (Due to technical restraints, this is preferred to other methods of "moving" the message).
