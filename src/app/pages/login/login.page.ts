import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { RegisterPage } from '../register/register.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
    public modalController: ModalController
  ) {}

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: RegisterPage,
      swipeToClose: true,
    });
    return await modal.present();
  }

  async login() {
    const loading = await this.loadingController.create();

    await loading.present();

    (await this.authService.login(this.credentials.value)).subscribe(
      async (res) => {
        if (res) {
          await loading.dismiss();
          this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
        } else {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Login failed',
            buttons: ['OK'],
          });

          await alert.present();
        }
      }
    );
  }

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }
}
