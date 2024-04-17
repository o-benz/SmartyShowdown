import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterOutlet } from '@angular/router';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { AnswerZoneComponent } from './components/answer-zone/answer-zone.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { DialogAlertComponent } from './components/dialog-alert/dialog-alert.component';
import { HeaderComponent } from './components/header/header.component';
import { HistoricComponent } from './components/historic/historic.component';
import { ImportErrorComponent } from './components/import-error/import-error.component';
import { ImportQuizComponent } from './components/import-quiz/import-quiz.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { NewQuestionFormComponent } from './components/new-question-form/new-question-form.component';
import { NewQuestionComponent } from './components/new-question/new-question.component';
import { PlayerListOrganiserComponent } from './components/player-list-organiser/player-list-organiser.component';
import { PlayerListResultComponent } from './components/player-list-result/player-list-result.component';
import { QuestionListComponent } from './components/question-list/question-list.component';
import { QuestionModificationComponent } from './components/question-modification/question-modification.component';
import { QuestionStatsComponent } from './components/question-stats/question-stats.component';
import { QuestionZoneComponent } from './components/question-zone/question-zone.component';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';
import { ResultPopupComponent } from './components/result-popup/result-popup.component';
import { RightAnswerPopupComponent } from './components/right-answer-popup/right-answer-popup.component';
import { UsernamePickerComponent } from './components/username-picker/username-picker.component';
import { WaitingRoomListComponent } from './components/waiting-room-list/waiting-room-list.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateGameComponent } from './pages/create-game/create-game.component';
import { CreateQuizComponent } from './pages/create-quiz/create-quiz.component';
import { JoinGameComponent } from './pages/join-game/join-game.component';
import { LobbyPageComponent } from './pages/lobby-page/lobby-page.component';
import { OrganizerViewComponent } from './pages/organizer-view/organizer-view.component';
import { ResultPageComponent } from './pages/result-page/result-page.component';
import { TrueGameComponent } from './pages/true-game/true-game.component';
import { AuthInterceptor } from './services/auth-interceptor/auth.interceptor';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        AdminPageComponent,
        LoginFormComponent,
        QuizListComponent,
        CreateGameComponent,
        ChatBoxComponent,
        LobbyPageComponent,
        QuestionZoneComponent,
        TrueGameComponent,
        AnswerZoneComponent,
        CreateQuizComponent,
        QuestionModificationComponent,
        HeaderComponent,
        NewQuestionComponent,
        ImportQuizComponent,
        ImportErrorComponent,
        ResultPopupComponent,
        QuestionListComponent,
        NewQuestionFormComponent,
        JoinGameComponent,
        WaitingRoomListComponent,
        ResultPageComponent,
        QuestionStatsComponent,
        PlayerListResultComponent,
        OrganizerViewComponent,
        UsernamePickerComponent,
        RightAnswerPopupComponent,
        PlayerListOrganiserComponent,
        HistoricComponent,
        DialogAlertComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatFormFieldModule,
        MatDialogModule,
        ReactiveFormsModule,
        CommonModule,
        RouterOutlet,
        CanvasJSAngularChartsModule,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
