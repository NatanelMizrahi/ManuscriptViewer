import { Component, OnInit, Input } from '@angular/core';
import { ManuscriptFile } from '../manuscript';

@Component({
  selector: 'file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.css']
})
export class FileViewerComponent implements OnInit {
  @Input() file: ManuscriptFile;
  constructor() { }

  ngOnInit() {
  }

}
