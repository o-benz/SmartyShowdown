import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateGameComponent } from '@app/pages/create-game/create-game.component';
import { CreateQuizComponent } from '@app/pages/create-quiz/create-quiz.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { QuestionBankComponent } from '@app/pages/question-bank/question-bank.component';
import { TrueGameComponent } from '@app/pages/true-game/true-game.component';
import { AuthGuardService } from '@app/services/authguard/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'creategame', component: CreateGameComponent },
    { path: 'createquiz', component: CreateQuizComponent, canActivate: [AuthGuardService] },
    { path: 'admin', component: AdminPageComponent, canActivate: [AuthGuardService] },
    { path: 'game/lobby', component: LobbyPageComponent },
    { path: 'game/test/:id', component: TrueGameComponent },
    { path: 'game/play', component: TrueGameComponent },
    { path: 'questionbank', component: QuestionBankComponent, canActivate: [AuthGuardService] },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
