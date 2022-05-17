import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES } from '../../components/sidebar/sidebar.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { RegistrationService } from 'src/app/services/registration.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './registration-layout.component.html',
  styleUrls: ['./registration-layout.component.scss']
})
export class RegistrationLayoutComponent implements OnInit {

  public disableButton: boolean = false;
  public registerForm: FormGroup;
  public registerCodeForm: FormGroup;
  public emailVerificationForm: FormGroup;
  public registerCodeIndicator: boolean =false;
  public emailVerificationIndicator: boolean=false;
  
  public emailCodeVerification: string;

  constructor(private toastr: ToastrService, private formBuilder: FormBuilder, private registerService: RegistrationService, private cookie: CookieService, private router: Router) {
    this.registerForm = formBuilder.group({
      firstname: ['', [Validators.required, Validators.pattern("^[A-Za-z]{2,20}")]],
      lastname: ['', [Validators.required, Validators.pattern("^[A-Za-z]{2,20}")]],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      username: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$")]],
      password: ['', [Validators.required, Validators.pattern("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,20}$")]],
      confirmPassword: ['', [Validators.required, Validators.pattern("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,20}$")]]
    })
    this.registerCodeForm = formBuilder.group({
      code: ""
    })
    this.emailVerificationForm = formBuilder.group({})
  }

  ngOnInit(): void {
  
  }

  public get m() {
    return this.registerForm.controls;
  }

  emailCode(form:FormGroup){
    if(form.value.code){
      this.registerService.verifyMail(form.value.code,this.emailCodeVerification).subscribe(token=>{
        let JSONtoken: string = JSON.stringify(token);
        let StringToken = JSON.parse(JSONtoken).token;
        this.registerCodeIndicator=false;
        this.emailVerificationIndicator=true;
      },err=>{
        let JSONtoken: string = JSON.stringify(err.error);
        let StringToken = JSON.parse(JSONtoken).responseMessage;
        if (StringToken == "Error: Username not found!") {
          this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> <b>Username not found</b>.', '', {
            disableTimeOut: false,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-info alert-with-icon",
            positionClass: 'toast-top-center'
          });
        }
        else if (StringToken == "Error: Wrong number!") {
          this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> <b>Wrong code</b>.', '', {
            disableTimeOut: false,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-info alert-with-icon",
            positionClass: 'toast-top-center'
          });
        }
        else if (StringToken == "Error: Mail already verified!") {
          this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> <b>Mail already verified!</b>.', '', {
            disableTimeOut: false,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-info alert-with-icon",
            positionClass: 'toast-top-center'
          });
        }

      }) 
      
    }
  }

  toLogin(){
    this.router.navigate(["login"]);
  }

  registration(form: FormGroup) {
    if (form.value.username && form.value.password && form.value.confirmPassword && form.value.firstname && form.value.lastname && form.value.email) {
      this.disableButton = true;
      this.registerService.register(form.value.username, form.value.password, form.value.firstname, form.value.lastname, form.value.email)
        .subscribe(token =>{
          this.disableButton = false;
          let JSONtoken: string = JSON.stringify(token);
          let StringToken = JSON.parse(JSONtoken).token;
          this.emailCodeVerification = form.value.email;
          if (form.value.password == form.value.confirmPassword) {
            this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> <b>Congratulations, your account has been successfully created </b>.', '', {
              disableTimeOut: false,
              closeButton: true,
              enableHtml: true,
              toastClass: "alert alert-info alert-with-icon",
              positionClass: 'toast-top-center'
            });
            this.registerCodeIndicator=true;
            this.emailVerificationIndicator=false;
          }
          else{
            this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> <b>Password mismatched!</b>.', '', {
              disableTimeOut: false,
              closeButton: true,
              enableHtml: true,
              toastClass: "alert alert-info alert-with-icon",
              positionClass: 'toast-top-center'
            });
          }
        }, err => {
          this.disableButton = false;
          let JSONtoken: string = JSON.stringify(err.error);
          let StringToken = JSON.parse(JSONtoken).responseMessage;
          if (StringToken == "Error: Email is taken!") {
            this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> <b>Email is already taken</b>.', '', {
              disableTimeOut: false,
              closeButton: true,
              enableHtml: true,
              toastClass: "alert alert-info alert-with-icon",
              positionClass: 'toast-top-center'
            });
          }
          else if (StringToken == "Error: Username already exists!") {
            this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> <b>Username already exists</b>.', '', {
              disableTimeOut: false,
              closeButton: true,
              enableHtml: true,
              toastClass: "alert alert-info alert-with-icon",
              positionClass: 'toast-top-center'
            });
          }
        })
    }
    else {
      this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> <b>Please enter all fields</b>.', '', {
        disableTimeOut: false,
        closeButton: true,
        enableHtml: true,
        toastClass: "alert alert-info alert-with-icon",
        positionClass: 'toast-top-center'
      });
    }
  }
}
 