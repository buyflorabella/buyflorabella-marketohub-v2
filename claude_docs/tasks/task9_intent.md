Cross check the port setup for all worktrees: dev/ prod/ main with /opt/operations/site-management

We want a) what does site-management show for the PORTS setup
b) what is the **current configuration** for the domains in this codebase given how we manage the frontend/backend by:


cd dev/
./script/manage --frontend
./script/manage --backend

cd prod/
./script/manage --frontend
./script/manage --backend

to view / develop in "dev" or "prod"

We also want to understand the "production build" HTTPS hostnames when we have

a) the "built version of the frontend" for viewing in dev
b) the "build version of the frontend" for viewing in prod/


we **should have** the following

https://frontend.dev.buyflorabella.boardmansgame.com - dev version of react server (running in dev)
https://admin.dev.buyflorabella.boardmansgame.com - dev version of backend python


https://buyflorabella.boardmansgame.com - **built** version of react server in prod
https://frontend.buyflorabella.boardmansgame.com - dev version of react server (running in prod)
https://admin.buyflorabella.boardmansgame.com - dev version of backend python (running in prod (for debugging) and also systemd version of backend running in prod)

Goal is to get the "full development environment" up so that we can test / troubleshoot our versions in the dev/ and prod/ worktrees.  

There seem to be some gaps.  We are identifying those gaps in this intent now.