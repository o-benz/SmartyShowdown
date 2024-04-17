import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateGameComponent } from '@app/pages/create-game/create-game.component';
import { CreateQuizComponent } from '@app/pages/create-quiz/create-quiz.component';
import { JoinGameComponent } from '@app/pages/join-game/join-game.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ResultPageComponent } from '@app/pages/result-page/result-page.component';
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
    { path: 'joingame', component: JoinGameComponent },
    { path: 'game/result', component: ResultPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
