import { Component, Input, OnInit } from '@angular/core';
import { Manuscript } from '../manuscript';
import { ManuscriptService } from '../manuscript.service';
import { testDB, testFiles } from '../test/testFiles'
import { User } from '../manuscript-wrapper/user';

@Component({
  selector: 'manuscript-list',
  templateUrl: './manuscript-list.component.html',
  styleUrls: ['./manuscript-list.component.css'],
  providers: [ManuscriptService]
})

export class ManuscriptListComponent implements OnInit {
  @Input() user: User;
  
  testDB:boolean = false;
  testModel:boolean = true;
  testFiles:boolean = false;

  manuscripts: Manuscript[];
  selectedManuscript: Manuscript;

  showForm:boolean
  menuActive:boolean
  showManuscripts: boolean


  constructor(private manuscriptService: ManuscriptService) {  }

  setUser(user:User){
    this.user = user;
    console.log("Set the user to", this.user.username);
  }

  ngOnInit() {
    this.showManuscripts = false;
    this.menuActive = true;
    if(this.testDB){
      this.manuscripts = testDB;
      return;
    }
    if (this.user){
      this.getUserManuscripts();
    }
  }
  private getIndexOfManuscript = (manuscriptId: String) => {
    return this.manuscripts.findIndex((manuscript) => {
      return manuscript._id === manuscriptId;
    });
  }

  getUserManuscripts(){
    this.manuscriptService
    .getManuscripts(this.user._id)
    .then((manuscripts: Manuscript[]) => {
      this.manuscripts = manuscripts;
      console.log(`${this.user.username}'s manuscripts:`);
      console.dir(this.manuscripts);
    })
    .catch(err=> {
      console.error("Server GET error:"+ err.toString());
      this.manuscripts = [];
    });
  }

  selectManuscript(manuscript: Manuscript) {
    this.selectedManuscript = manuscript;
    this.showForm = Boolean(manuscript);
  }

  getDummyManuscript(){
    return <Manuscript>JSON.parse(JSON.stringify(testDB[0])); //deep copy from testDB
  }
  createNewManuscript() {
    this.selectManuscript(new Manuscript('','', new Date(),'English','','', [], []));
  }
  autofillNewManuscript(){
    this.selectManuscript(this.getDummyManuscript())
  }
  deleteManuscript = (manuscriptId: String) => {
    var idx = this.getIndexOfManuscript(manuscriptId);
    if (idx !== -1) {
      this.manuscripts.splice(idx, 1);
      this.selectManuscript(null);
    }
    return this.manuscripts;
  }

  addManuscript = (manuscript: Manuscript) => {
    this.manuscripts.push(manuscript);
    this.selectManuscript(manuscript);
    return this.manuscripts;
  }

  updateManuscript = (manuscript: Manuscript) => {
    let idx = this.getIndexOfManuscript(manuscript._id);
    if (idx !== -1) {
      this.manuscripts[idx] = manuscript;
      this.selectManuscript(manuscript);
    }
    return this.manuscripts;
  }
  toggleMenu(){
    this.menuActive = !this.menuActive;
  }
  toggleList(){
    this.showManuscripts = !this.showManuscripts;
    if (this.showManuscripts){
      this.getUserManuscripts();
    }
  }
  close(){
    //TODO
  }

}
