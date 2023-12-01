# Multimedia_report_online_games
report/code for Csc461

The main idea with this page is to document my findings and insites in multimedia with regards to multiplayer games.
This will consist of two parts this github page documenting things I've lerned and a secondary website hosting a simple multiplayer game I've created.

Please note a large portion of the code upto this point (11/1/2023) was created following an online corse from this channel https://www.youtube.com/@ChrisCourses.
I plan to improve upon this code as well as implement a few feautures to better ilistrate different findings related to multimedia in relation to the code

Currently the game is being hosted at http://172.232.174.154:3000/ its a simple pvp game, you are welcome to try but it only fully works with more than 1 player

Multiple servers created: socket, http, io to create the necessary functions required for the multiplayer game. Socket, http and io are wrapped around eachother to allow for a varity of connections between both the front end and back end of the server.

Backend vs frontend
  - backend is the server side of the game, the hidden things you don't see while normaly interacting with the game. It mostly deals with any relation from one player to another.  

Reduce lag via client side prediction
 - Any server will have some level of latency associated with it use of clever workarounds to predict hot the player will move and reduce perceived lag (auto update where you are instantly on client side) illusionary movement not nessisarly 1:1 with the backend

Authoritative server movement.
 - Have the backend server control movement and projectiels this is to remove the chance of any cheating. if the movement and projectiels were created and authorized in the client side then it could be manipulated on the client side and pushed to other players

Event ticker (game tick) 
 - this is used to crontroll player broadcasts of events to reduce over use and clogging of the server. this does help reduce the chance of loss of player boradcasts but a ticker that is too large will be precived the same as lag as updates and refreshes to the players will take time. note according to Vale game studios recommended backend tick rate is 15ms giving a roughly 66tps game update speed

Server reconciliation 
 - used for syncing and updating backend if there are any missed reads of movements due to latency or other problems

Interpolation of back end player movement viewed by player 2. 
 - Needed to smooth out any lag related choppiness and helps lower the precived amount of lag experienced by the player on the client end


#things to research and add onto the game 
1. add a way to ilistrate effectivly how lag would effect a player (maybe artifical lag?)
2. add sounds to learn about syncing sound events
3. other (health bar, mobs, items, sprites)

Update
A better understanding of lag 
  Lag is something that will occur in every online medium often broadly categorized as any connective disruption in the flow of information. A large part of what I have done so far with the project revolves around mitigating this lag in each of its forms. Within any online game lag will often be perceived in three forms. 

Input lag
  - This lag takes place between the controller and the client device. This type of lag will often stem from physical problems with software or on occasion issues in the code. This type of lag can differ between relatively simple to incredibly complex to solve needing anywhere between a couple lines of code to a full predictive AI. Within my game it is solved relatively simply due to the fact there are very few moving parts to consider (see client side prediction)

Processing/graphical lag
 - This lag is usually seen within the client side device though on occasion can be seen in the backend also. It boils down to the device not having enough resources to properly process and display the game, think trying to run a game with 20+ chrome tabs open. Within the backend it will occur when there are more users or information sent to the backend then it's able to handle. This problem can be further exacerbated by inefficiencies within the game lowering performance.

Connection lag
 - This refers usualy to any lag/ delay experienced between client and server and vice versa. there is often no proper way to get fully rid of this type of lag due to it being sometimes a physical issue but, it is possible to midigate its visable effects and there a large amount of stratagies to do. client side prediction, server reconciliation and Interpolation of back end player movement are all ways to reduce the preception of this lag.

added front and back lagger
if you type in front_lagger as your given username when prompted all client side prediction will be removed from your player and back_lagger will remove back interplation seen by other players
