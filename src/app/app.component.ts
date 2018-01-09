import { Subscription } from 'rxjs/Subscription';
import { RedirectService } from './redirect/redirect.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  redirect: boolean;
  redirectSubscription: Subscription;
  authtoken: string;
  email: string;

  constructor(private authService: AuthService,
              private redirectService: RedirectService){}

  ngOnInit(){
    this.redirect = this.redirectService.canRedirect;

    firebase.initializeApp({
      apiKey: "AIzaSyA16Mv1_4fGvVO05XY_M1G2WQ6gQ68wfKI",
      authDomain: "ng-alt-scheduler.firebaseapp.com"
    });

    this.checkTokenKey();

    this.redirectSubscription = this.redirectService.canRedirectSwitch
      .subscribe(
        (value: boolean) => {
          this.redirect = value;
          if (!value){
            // this.redirectService.redirectRoute = null;
            if (!this.redirectService.logout){
              console.log('Logged in');
              this.checkTokenKey();
            }
            else{
              console.log('Logged out');
              this.authService.userType = null;
            }
          }
        }
      )
  }

  ngOnDestroy(){
    if (this.redirectSubscription){
      this.redirectSubscription.unsubscribe();
    }
  }

  checkTokenKey(){
    const tokenKey = Object.keys(window.localStorage)
    .filter(it => it.startsWith('firebase:authUser'))[0];

    if (tokenKey){
      this.authtoken = JSON.parse(localStorage.getItem(tokenKey)).stsTokenManager.accessToken;
      this.email = JSON.parse(localStorage.getItem(tokenKey)).email;
  
      this.authService.token = this.authtoken;
      this.authService.authorizeEmail(this.email);
      console.log(this.authService.isAuthenticated());
      console.log(this.email);
      console.log(this.authService.userType);
    }
  }
}
