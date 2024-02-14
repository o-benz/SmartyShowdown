export interface AdminConnection {
    password: string;
}

export interface LoginToken {
    accessToken: string;
}

export interface AuthServiceMock {
    attemptLogin: jasmine.Spy;
}

export interface MatDialogRefMock {
    close: jasmine.Spy;
}
