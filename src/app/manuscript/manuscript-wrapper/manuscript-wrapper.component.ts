import { Component, ViewChild } from '@angular/core';
import { ManuscriptListComponent } from '../manuscript-list/manuscript-list.component';
import { User } from './user';
import { test_users } from '../../../../test/users.js'

@Component({
  selector: 'manuscript-wrapper',
  templateUrl: './manuscript-wrapper.component.html',
  styleUrls: ['./manuscript-wrapper.component.css'],
})
export class ManuscriptWrapperComponent {
  @ViewChild(ManuscriptListComponent) child:ManuscriptListComponent;

  user: User;
  show: boolean = false;
  testUsers : User[] = test_users;

  constructor() { }

  setUser(user:User){
    this.show = true;
    this.user = user;
    console.log("Wrapper:: Changing to user ", this.user.username);
    this.child.setUser(user);
    this.child.ngOnInit();
  }
  setUserTest(i:number){
    this.setUser(this.testUsers[i])
  }
}

