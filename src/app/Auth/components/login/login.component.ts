import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import { setLoadingSpinner } from "src/app/store/shared/shared.action";
import { loginStart } from "../../state/auth.actions";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    constructor(private store: Store<AppState>) {}
    ngOnInit(): void {
        this.loginForm = new FormGroup({
            email: new FormControl("", [Validators.required, Validators.email]),
            password: new FormControl("", [
                Validators.required,
                Validators.minLength(7),
            ]),
        });
    }

    login() {
        const userCreds = {
            email: this.loginForm.value.email,
            password: this.loginForm.value.password,
        };
        this.store.dispatch(setLoadingSpinner({ status: true }));
        this.store.dispatch(loginStart(userCreds));
    }
}
