Palun kasutada avamiseks **Dockerit**:

Prerequisite: have Docker installed and running on your computer.
1.	Open a Terminal (Command Prompt, PowerShell, or similar).
2.	Pull the Image: **docker pull ttimma/my-java-app**
3.	Run the Container: **docker run -p 8080:8080 ttimma/my-java-app**
4.	Open in a Browser:  http://localhost:8080  

<br>

Proovitöö tegemine oli minu jaoks väga põnev ja õpetlik. Eriti andis nuputada, kuidas lahendada istekohtade automaatne pakkumine kliendile tema eelistuste järgi (seda nii äriloogiliselt kui ka koodis). 

Eks töö käigus tekkis ka takistusi ja vigu mida troubleshootida, nt alguses kohe oli probleeme CORSiga, et brauseris kõik töötaks. Üks hetk avastasin ka, et istekohad olid valesti nummerdatud, sest java loendab ju nullist, aga tavainimesed siiski esimesest istmereast #rookiemistake.  

Dockerit polnud kunagi varem kasutanud, veidi pusimist oli alguses, aga vähemalt nüüd üks oskus juures. 

Dokumenteerimise osa annab ilmselt oluliselt parandada, seni lihtsalt koode eelkõige enda jaoks teinud ja pole vajadust olnud Githubis midagi järjepidevalt jagada/kommenteerida. Viimasel hetkel panin vähemalt koodis kõigele kommentaarid juurde, et oleks lihtsamini loetav ja hallatav. 

Ühesõnaga lahendus pole kindlasti laitmatu, aga õppisin palju juurde ning positiivne on see, et siit saab ainult ülesmäge minna :)
