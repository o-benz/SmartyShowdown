export enum GameEvents {
    RoomMessage = 'roomMessage',
    CreateRoom = 'createRoom',
    JoinRoom = 'joinRoom',
    Login = 'login',
    Logout = 'logout',
    UpdateRoom = 'updateRoom',
    UpdateUsers = 'updateUsers',
    BanUser = 'banUser',
    AddAnswer = 'addAnswer',
    GetStats = 'getStats',
    DestroyRoom = 'destroyRoom',
    GetUserInfo = 'getUserInfo',
    LockRoom = 'lockRoom',
    UnlockRoom = 'unlockRoom',
    StartGame = 'startGame',
    GetAnswers = 'getAnswers',
    NextQuestion = 'nextQuestion',
    RoundOver = 'roundOver',
    EndGame = 'endGame',
    ConfirmAnswer = 'confirmAnswer',
    SendMessage = 'sendMessage',
    GetAllMessages = 'getAllMessages',
}

export enum GameClientEvents {
    JoinedRoom = 'joinedRoom',
    LeftRoom = 'leftRoom',
    RoomClosed = 'roomClosed',
    GetAnswers = 'getAnswers',
    GetStats = 'getStats',
    ChangeQuestion = 'changeQuestion',
    FinalizeAnswers = 'finalizeAnswers',
    ShowResults = 'showResults',
    EndRound = 'endRound',
}

export enum GameEnum {
    ROOMCODELENGTH = 4,
    Organizer = 'organisateur',
    ErrorMessage = "La salle n'existe pas ou est fermée",
    UserNotValidMessage = "Ce nom d'utilisateur n'est pas valide",
    RoomDoesNotExistMessage = "La salle n'existe pas",
}
