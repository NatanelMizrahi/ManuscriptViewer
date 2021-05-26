import { Component, Input, Output, ViewChild, ElementRef, EventEmitter, HostListener } from '@angular/core';
import { Manuscript, ManuscriptFile } from '../manuscript';
import { ManuscriptService } from '../manuscript.service';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpEventType} from '@angular/common/http'
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmAutofocus } from './confirm'
import { deepEqual } from 'assert';
import { User } from '../user';

const ConfirmationWindow = { modal: NgbdModalConfirmAutofocus };

@Component({
  selector: 'manuscript-details',
  templateUrl: './manuscript-details.component.html',
  styleUrls: ['./manuscript-details.component.css'],
})

export class ManuscriptDetailsComponent {
  @HostListener('document:keyup', ['$event']) handleDeleteKeyboardEvent(e: KeyboardEvent) { 
    if(e.key === 's' && e.ctrlKey) { this.updateManuscript(this.manuscript) };
  }

  @Input() manuscript: Manuscript;
  @Input() showForm: boolean;
  @Input() user: User;

  @Input() createHandler: Function;
  @Input() updateHandler: Function;
  @Input() deleteHandler: Function;

  @ViewChild('form') form: NgForm;
  @ViewChild('folderInput') folderInput: ElementRef;
  @ViewChild('multFiles')   multFiles: ElementRef;

  @Output() resetEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() showFormChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  langs:string[] = ["English", "French", "Spanish", "Italian"];
  legalFormats:string[] = ["png", "jpeg", "jpg"]; 
  
  // CONFIG
  uploadState: "IDLE" | "PROGRESS" |  "DONE" = "IDLE";
  maxFileDisplay:number = 5;
  autoSave = false;

  showUploads: boolean;
  pendingFiles: File[]=[];
  markedForDelete: ManuscriptFile[] = [];
  uploadProgress:number;
  inProgress:boolean = false;
  originalManuscript:Manuscript;

  constructor ( private manuscriptService: ManuscriptService,
                private modalService: NgbModal,
              ) {}
  
  get diagnostic() { return JSON.stringify(this.manuscript) + this.showForm }
  get fileUploadEnabled() { return this.pendingFiles && this.pendingFiles.length != 0 && !this.inProgress }
  get isOriginalVersion() { return this.manuscript._id === this.manuscript.versionId }

  getDate(){
    var d= this.manuscript.date;
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear()};
  }

  setDate(e) {
    if(!e) console.log("invalid date format:", e);
    else this.manuscript.date= e.jsdate; 
  }

  lock(){ this.inProgress = true; }
  release(){ this.inProgress = false;}

  setVersion(versionId:string, updateFirst : boolean = this.autoSave){
    if(!updateFirst)
      this.setVersionPostUpdate(versionId);
    else
      this.updateManuscript(this.manuscript)
      .then(updatedManuscript => {
        this.setVersionPostUpdate(versionId);
      });
  }
  
  setVersionPostUpdate(versionId:string){
    this.lock();
    this.manuscriptService.getManuscriptbyId(versionId)
      .then( (manuscriptVersion: Manuscript) => { 
        this.manuscript = manuscriptVersion; 
        this.pendingFiles = [];
        this.showUploads = false;
        this.release(); 
      });
  }

  createManuscript(manuscript: Manuscript) :Promise<void|Manuscript>{
    this.lock();
    manuscript.ownerId = this.user._id;
    return this.manuscriptService.createManuscript(manuscript)
    .then(manuscript =>{ 
      this.createHandler.bind(this)(manuscript); 
      return manuscript; 
    })
    .then(this.updateManuscript.bind(this));
  }

  updateManuscript(manuscript: Manuscript, isNewManuscript = false): Promise<Manuscript> {
    this.lock();
    var updatePromise = 
      this.uploadFiles.bind(this)(manuscript)
      .then((files)=> this.addFilesToManuscript.bind(this)(files, manuscript))
      .then(this.deleteFiles.bind(this))
      .then(this.updateManuscriptInDB.bind(this));

    updatePromise
      .then(this.updateHandler.bind(this))
      .then(this.release.bind(this));
    return updatePromise;
    
  }

  updateManuscriptInDB(manuscript: Manuscript){
    return this.manuscriptService.updateManuscript(manuscript)
    .then((updatedManuscript: Manuscript) => {
      this.saveOriginal.bind(this)(updatedManuscript);
      return updatedManuscript;
    });
  }

  addFilesToManuscript(files: ManuscriptFile[], manuscript:Manuscript){
      if (!manuscript.files) 
        manuscript.files = [];
      manuscript.files = manuscript.files.concat(files);
      return manuscript;
  }

  deleteManuscript(manuscriptId: String): void {
    this.lock();
    this.manuscriptService.deleteManuscript(manuscriptId)
      .then((deletedManuscriptId: String) => {
        this.deleteHandler(deletedManuscriptId);
        this.saveOriginal(null);
        this.release();
      });
  }

  createVersion(updateFirst : boolean = this.autoSave){
    var copy: Manuscript = <Manuscript>JSON.parse(JSON.stringify(this.manuscript)); //deep copy. 
    let toRemoveFromList = this.manuscript._id;
    delete copy._id;
    var that = this;

    var replaceWithNewVersion = ()=>{
      this.createManuscript(copy).then((newManuscript)=> {
        console.log("after replace create1:", newManuscript);
        that.deleteHandler(toRemoveFromList);
        that.updateHandler(newManuscript);
        that.pendingFiles = [];
        that.showUploads = false;
      });
    };

    if(!updateFirst){
      replaceWithNewVersion();
    }
    else {
      that.updateManuscript(this.manuscript)  //save current version TODO add prompt
      .then(updatedManuscript=>{
        that.createManuscript(copy).then((newManuscript)=> {
          console.log("after replace create2:", newManuscript);
          that.deleteHandler(toRemoveFromList);
          that.updateHandler(newManuscript);
          that.pendingFiles = [];
          that.showUploads = false;
      });
    });
  }
}
  //Form Validation
  isValid(field){ return this.inProgress || ( field.valid || field.pristine ); }

  setClass(field){
    return {'alert alert-danger' : !this.isValid(field) && field.touched };
  }

  //File handling
  filterFiles(files) {
    return this.filesToArray(files).filter(file => this.legalFormats.includes(file.name.split(".").pop()));
  }
  filesValid(files = this.pendingFiles){
    return !files || files.length == this.filterFiles(files).length;
  }
  getFiles(files) {
    this.uploadProgress = 0;
    if (!this.pendingFiles) this.pendingFiles = [];
    this.pendingFiles = this.pendingFiles.concat(this.filterFiles(files));
  }
  filesToArray(files){
    return Array.from(new Array(files.length), (x,i) => files[i]);
  }
  displayFileNames(files:any[] = this.pendingFiles, max:number = this.maxFileDisplay){
    return files.length > max ? files.slice(0,max).concat([{name:`${files.length - max} more...`}]) : files;
  }
  removeFile(filename){
    this.pendingFiles= this.pendingFiles.filter(file => file.name != filename);
  }
  clearFiles(){
    this.folderInput.nativeElement.value="";
    this.multFiles.nativeElement.value="";
    this.pendingFiles=[];
  }

  uploadFiles(manuscript):Promise<ManuscriptFile[]> {
    return new Promise((resolve, reject)=>{
      this.uploadState="PROGRESS";
      this.manuscriptService.uploadFiles(this.pendingFiles, manuscript)
      .subscribe(event => { 
        if(event.type == HttpEventType.UploadProgress)
          this.uploadProgress = Math.floor(event.loaded/ event.total * 100);
        if(event.type == HttpEventType.Response){
          console.log('files uploaded successfully!');
          console.log(event);
          var fileResponse= event.body as ManuscriptFile[];
          // if (!newManuscript.files) 
          // newManuscript.files = [];
          // newManuscript.files = newManuscript.files.concat(response as ManuscriptFile[]);
          console.log("file resposne:",fileResponse.map(x=>x.url));
          this.pendingFiles = [];
          this.uploadState= "DONE";
          // resolve(fileResponse);
          resolve(fileResponse);
        }
      });
    });
  }

  deleteFiles(manuscript:Manuscript){
    return this.manuscriptService.deleteFiles(this.markedForDelete)
    .then(urls => manuscript);
  }

  resetHandler(){
    this.resetEvent.emit('resetting new manuscript form');
    this.form.resetForm();
  }

  toggleUpload(){
    this.uploadProgress = 0;
    this.showUploads = !this.showUploads;
  }
  
  toggleForm(){   
    this.showForm = false ;
    this.uploadProgress = 0;
    this.showUploads = false; 
    this.showFormChange.emit(false);
    console.log(this.manuscript); 
    console.log(this.manuscript.files);
  }

  confirmExecFunc(prompt, funcToExec:Function, ...args){
    var funcToExecBound = funcToExec.bind(this);
    if (this.autoSave || !this.isChanged() || this.isOriginalVersion)
      funcToExecBound(...args);
    else{
      this.modalService.open(prompt).result
      .then((doUpdateFirst) => { funcToExecBound(...args, doUpdateFirst); });
    }
  }

  //save a deep copy of the original manuscript
  saveOriginal(originalManuscript){
    this.originalManuscript = JSON.parse(JSON.stringify(originalManuscript)); 
  }
  isChanged(){
    // return deepEqual(this.originalManuscript,this.manuscript);
    return  this.pendingFiles.length !=0 || 
            JSON.stringify(this.originalManuscript) !== JSON.stringify(this.manuscript);
  }
}
