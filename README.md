simpleHTTP
==========

Simple web server for any project which Apache, or similar would be overkill.

simpleHTTP is a conceptual subset of the Express.js way of creating and handling a web server.
For many server-side scripting tasks, it's desirable to have a web server, but not necessisarily one as full-featured as Apache or nginX. The toil required in configuring such powerful web servers outweighs the simple and light use required for the task. In a typical scenario, it is necessary to restart the server everytime a crucial file is changed. In the case of an error, the server simply crashes. SimpleHTTP is perfect for cases when code changes, breakages, and server restarts are necessary and frequent.

SimpleHTTP is aimed at providing a web server for those tasks with an emphasis on ease of configuration, and convenience while developing.
