import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { GroupControllerService } from 'src/app/services/api/group-controller.service';
import { UserControllerService } from 'src/app/services/api/user-controller.service';
import { TargetGroup } from 'src/app/shared/interfaces/groups/target-group';
import { CreatePost } from 'src/app/shared/interfaces/posts/create-post';
import { CreationUtils } from 'src/app/shared/interfaces/posts/creation-utils';

@Component({
  selector: 'idea-create-settings',
  templateUrl: './create-settings.component.html',
  styleUrls: ['./create-settings.component.scss'],
})
export class CreateSettingsComponent implements OnInit {

  //id of the public group
  private publicGroupId: string;

  //id of the current user
  private userProfileId: string;

  //the user's groups
  private myGroups: TargetGroup[];

  private settingsForm: FormGroup;
  
  @Input() vm: CreatePost;
  @Input() utils: CreationUtils;

  @Output() changes = new EventEmitter<CreatePost>();
  @Output() utilsChange = new EventEmitter<CreationUtils>();

  constructor(
    public _groupController: GroupControllerService,
    public _toastCtrl: ToastController,
    public _translateService: TranslateService,
    private formBuilder: FormBuilder,
    public _userController: UserControllerService
  ) {
    this.userProfileId = this._userController.getUserProfileId();
    
  }

  public ngOnInit(): void{
    this.settingsForm = this.formBuilder.group({
      publicationDate: [this.vm.publicationDate, Validators.required],
      endDate: [this.vm.endDate, Validators.required],
      targetGroups: [this.vm.targetGroupsIds, Validators.required]
    });
    this.getTargetGroups(this.userProfileId);

    this.settingsForm.valueChanges.subscribe(changes => this.emitChanges(changes));
  }

  emitChanges(changes: any) {
    if (!!changes.publicationDate)
      this.vm.publicationDate = changes.publicationDate;
    
    if (!!changes.endDate)
      this.vm.endDate = changes.endDate;

    if (!!changes.targetGroups) {
      this.vm.targetGroupsIds = changes.targetGroups;
      this.checkSelectedGroups();
      this.utilsChange.emit({...this.utils, targets: this.getTargetString()});
    }

    this.changes.emit(this.vm);
  }

  /**
   * Retrieves the user's groups to choose post target(s)
   */
  public getTargetGroups(userProfileId: string) {
    return this._groupController.listTargetableGroups(
      userProfileId
    ).subscribe(data => {
      this.myGroups = data;

      //Test the groups to find the public group, retrieve its id and select it by default as target
      this.myGroups.forEach(element => 
      {
        if(element.name.toLowerCase() == "public")
          this.publicGroupId = element.id;

        this.vm.targetGroupsIds = [ this.publicGroupId ];
        this.settingsForm.controls.targetGroups.setValue(this.vm.targetGroupsIds, { emitEvent: false });
      });
    });
  }

  /**
   * Create targetGroups string
   */
  private getTargetString(): string {
    var targetGroupsString: string = "";
    this.vm.targetGroupsIds.forEach(groupId => {
      targetGroupsString += this.myGroups.find(g => g.id == groupId).name + ", ";
    })
    targetGroupsString = targetGroupsString.slice(0, targetGroupsString.length - 2);
    return targetGroupsString;
  }

  /**
   * Check that at least a group is selected, select the public one if not
   * If several groups are selected, including the public one, select only the public one
   */
  public checkSelectedGroups() {
    if(this.vm.targetGroupsIds.length == 0 || this.vm.targetGroupsIds.find(groupId => groupId === this.publicGroupId))
    {
      this.vm.targetGroupsIds = [
        this.publicGroupId
      ];
      this.settingsForm.controls.targetGroups.setValue(this.vm.targetGroupsIds, { emitEvent: false });
      return;
    }
  }
}
