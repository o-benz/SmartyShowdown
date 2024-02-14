# Serveur NestJS

Ce projet est une implémentation du serveur de départ utilisant le cadriciel [NestJS](https://nestjs.com/). Ceci est une alternative à serveur de base qui vous est fournie et qui utilise NodeJS/Express. Vous pouvez utiliser le serveur NodeJS/Express fourni ou ce serveur pour votre projet.

## NestJS

NestJS est un cadriciel de développement de serveurs dynamiques utilisant NodeJS et Expess avec une architecture très similaire à celle d'Angular. Vous remarquerez l'utilisation de termes tels que `service`,`module` et autres similaires à Angular.

NestJS utilise des décorateurs (annotations avec le symbole `@`) pour attacher des fonctionnalités supplémentaires au code. Par exemple, la configuration d'un gestionnaire de route en NestJS :

```ts
@Get('/')
dateInfo(): Message {
    return {
        body: this.dateService.currentTime(),
    };
}
```

est équivalente à la configuration suivante avec Express :

```ts
this.router.get('/', (req: Request, res: Response) => {
    this.dateService.currentTime().then((time: Message) => {
        res.json(time);
    });
});
```

## Intégration avec les autres exemples du cours

Afin de vous aider, ce projet inclut également le code nécessaire pour présenter les fonctionnalités de communication avec une base de données `MongoDB` et la communication avec `SocketIO`. Le code se base sur les projets suivants disponibles sur GitLab :

-   [`MongoDB`](https://gitlab.com/nikolayradoev/mongodb-example) : la route `/api/docs` du serveur NodeJS offre une interface qui vous permet de tester la connexion avec la base de données. Notez que NestJS utilise la librairie `Mongoose` pour la communication avec MongoDB.

    **Important**: vous devez configurer la variable d'environnement `DATABASE_CONNECTION_STRING` disponible dans le fichier `.env` avant de pouvoir vous connecter à une base de données.

-   [`SocketIO`](https://gitlab.com/nikolayradoev/socket-io-exemple) : vous pouvez utiliser le site web (client) de cet exemple pour tester la communication par WebSocket avec le serveur NestJS. Notez que cet exemple assume que le serveur est disponible sur le port `5000` : vous devez modifier l'URI de vos requêtes.

NestJS utilise la librairie `Jest` pour ses tests. L'ensemble du code qui est fourni est déjà testé avec plusieurs exemples de tests unitaires. Vous pouvez vous baser sur ces exemples pour tester vos propres fonctionnalités.

# Choix de serveur à utiliser

Vous devez choisir le serveur à utiliser dans votre projet : NodeJS/Express de base ou NestJS. Dans les deux cas, vous devez apporter quelques changements à votre entrepôt.

Notez que les configurations pour le déploiement et le pipeline de validation assument qu'il a seulement un répertoire `/server` dans votre entrepôt. Peu importe votre choix, le répertoire de votre serveur doit porter ce nom.

### Serveur NodeJS de base

Si vous avez décidé de garder le serveur NodeJS de base, vous n'avez qu'à supprimer le répertoire `/server-nestjs` et pousser vos changements sur Git.

**Note : il est important de retirer le répertoire du serveur non utilisé pour ne pas avoir du _code mort_ qui n'est jamais utilisé dans votre entrepôt.**

### Serveur NestJS

Si vous avez décidé de prendre le serveur NestJS, vous devez :

- Supprimer le répertoire `/server` et renommer `/server-nestjs` à `/server`.
- Modifier la valeur du champ `entryFile` pour `server/app/index` dans le fichier `nest-cli.json`.
- Modifier la valeur du champ `@app` à `out/server/app` dans le fichier `/server/package.json`.

N'oubliez pas de pousser vos changements sur Git.

**Note : il est important de retirer le répertoire du serveur non utilisé pour ne pas avoir du _code mort_ qui n'est jamais utilisé dans votre entrepôt.**

### Serveur NestJS sans base de données

Si vous voulez débuter avec le serveur NestJS sans une connexion à une instance MongoDB configurée, vous devez modifier le fichier [app.module.ts](./app/app.module.ts) et retirer les références à `MongooseModule`, `CourseController` et `CourseService`. Votre configuration devraient être la suivante :

```ts
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true })
    ],
    controllers: [DateController, ExampleController],
    providers: [ChatGateway, DateService, ExampleService, Logger],
})
export class AppModule {}
```

**Note : l'utilisation de MongoDB sera éventuellement requise dans le projet. Il est recommandé de simplement mettre la configuration de `MongooseModule` en commentaire et retirer le contrôleur et le service d'exemple. Lorsque vous avez besoin de la base de données, vous pouvez simplement réactiver la configuration.**