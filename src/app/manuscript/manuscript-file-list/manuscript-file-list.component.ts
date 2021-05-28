import { Component, Input, HostListener } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ManuscriptFile } from '../manuscript';
import { ManuscriptService } from '../manuscript.service';


@Component({
  selector: 'manuscript-file-list',
  templateUrl: './manuscript-file-list.component.html',
  styleUrls: ['./manuscript-file-list.component.css', './controls.css']
})
export class ManuscriptFileListComponent {
  @Input() files: ManuscriptFile[];
  @Input() markedForDelete: ManuscriptFile[];

  @HostListener('document:keyup', ['$event']) handleDeleteKeyboardEvent(e: KeyboardEvent) {
    switch (e.key) {
      case "Up":
      case "ArrowUp":
        this.selectPrevFile();
        break;
      case "Down":
      case "ArrowDown":
        this.selectNextFile();
        break;
      case 'Escape':
        this.fullscreen= false;
        break;
    }
  }

  selectedFile: ManuscriptFile;
  selectedIndex: number;
  fullscreen:boolean;
  fullscreenMessage:boolean;

  constructor() { }

  drop(event: CdkDragDrop<{name: string, url: string}[]>) {
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);
  }

  markForDelete(index:number){
    if (!this.markedForDelete) this.markedForDelete = [];
    this.markedForDelete.push(this.files.splice(index, 1)[0]);
    this.selectFile(index);
  }

  moveFile(from:number, to:number){
    this.files.splice(to, 0, this.files.splice(from, 1)[0]);
  }
  moveFileByOffset(offset){
    this.moveFile(this.selectedIndex,this.selectedIndex + offset);
    this.selectedIndex = this.selectedIndex + offset;
  }
  selectFile(i:number){
    this.selectedFile = this.files[i];
    this.selectedIndex = i;
  }
  selectPrevFile(){
    this.selectFile(Math.max(0, this.selectedIndex - 1))
  }
  selectNextFile(){
    this.selectFile(Math.min( this.files.length-1, this.selectedIndex + 1))
  }
  toggleFullScreen(){
    this.fullscreen= !this.fullscreen;
    this.fullscreenMessage = this.fullscreen;
    setTimeout(() => this.fullscreenMessage = false, 1500);
  }
}
