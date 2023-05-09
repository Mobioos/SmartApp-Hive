import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CardTypes } from 'src/app/shared/interfaces/posts/card-types.enum';
import { CreatePost } from 'src/app/shared/interfaces/posts/create-post';
import { UserControllerService } from 'src/app/services/api/user-controller.service';
import { CreationUtils } from 'src/app/shared/interfaces/posts/creation-utils';

export enum QuestionSteps {
  CREATE_QUESTION = 0,
  CREATE_ANSWERS = 1,
  CREATE_SETTINGS = 2,
  PREVIEW = 3
}

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnInit {

  public step: QuestionSteps = QuestionSteps.CREATE_QUESTION;

  public steps = QuestionSteps;

  private userId: string;
  public createQuestionVm: CreatePost;
  public picture: any = null;

  public utils: CreationUtils;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastCtrl: ToastController,
    private translateService: TranslateService,
    public _userController: UserControllerService
  ) { }

  ngOnInit() {
    this.userId = this._userController.getUserProfileId();
    this.createQuestionVm = {
      authorId: this.userId,
      choices: [],
      type: CardTypes.Question
    };
    this.utils = {pictureSelected: false};
  }

  applyChanges(event: CreatePost) {
    this.createQuestionVm = event;
  }

  setPicture(picture: any) {
    this.picture = picture;
  }

  onDiscard() {
    if (this.step === QuestionSteps.PREVIEW) {
      this.previousStep();
      return;
    }
    this.router.navigate(['../../newPost'], { relativeTo: this.activatedRoute });
  }

  nextStep() {
    switch(this.step) {
      case QuestionSteps.CREATE_QUESTION: 
        if (!this.createQuestionVm.content) {
          this.showMissingDataToast();
          break;
        }
        this.step++;
        break;
      case QuestionSteps.CREATE_ANSWERS: 
        if (this.createQuestionVm.choices.length < 2) {
          this.showMissingDataToast(this.translateService.instant('question.minAnswers'));
          break;
        }
        this.step++;
        break;
      case QuestionSteps.CREATE_SETTINGS: 
        if (!(this.createQuestionVm.publicationDate && this.createQuestionVm.endDate && this.createQuestionVm.targetGroupsIds)) {
          this.showMissingDataToast();
          break;
        }
        this.step++;
        break;
      default: 
        console.warn("we should not see this...");
    }
  }

  private async showMissingDataToast(msg: string = this.translateService.instant('commons.missingData')) {
    const toast = await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }

  previousStep() {
    if (this.step === QuestionSteps.CREATE_QUESTION) {
      this.onDiscard();
      return;
    }
    this.step--;
  }

}
