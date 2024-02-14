import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AnswerZoneComponent } from './components/answer-zone/answer-zone.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ChoiceModificationComponent } from './components/choice-modification/choice-modification.component';
import { HeaderComponent } from './components/header/header.component';
import { ImportErrorComponent } from './components/import-quiz/import-error/import-error/import-error.component';
import { ImportQuizComponent } from './components/import-quiz/import-quiz.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { NewQcmComponent } from './components/new-qcm/new-qcm.component';
import { NewQuestionFormComponent } from './components/new-question-form/new-question-form.component';
import { QuestionListComponent } from './components/question-list/question-list.component';
import { QuestionModificationComponent } from './components/question-modification/question-modification.component';
import { QuestionZoneComponent } from './components/question-zone/question-zone.component';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';
import { ResultPopupComponent } from './components/result-popup/result-popup.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateGameComponent } from './pages/create-game/create-game.component';
import { CreateQuizComponent } from './pages/create-quiz/create-quiz.component';
import { LobbyPageComponent } from './pages/lobby-page/lobby-page.component';
import { QuestionBankComponent } from './pages/question-bank/question-bank.component';
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
        ChoiceModificationComponent,
        HeaderComponent,
        NewQcmComponent,
        ImportQuizComponent,
        ImportErrorComponent,
        ResultPopupComponent,
        QuestionBankComponent,
        QuestionListComponent,
        NewQuestionFormComponent,
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
