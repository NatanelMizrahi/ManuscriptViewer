import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule, NgbDatepickerModule, NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { ManuscriptDetailsComponent } from './manuscript/manuscript-details/manuscript-details.component';
import { ManuscriptListComponent } from './manuscript/manuscript-list/manuscript-list.component';
import { MyDatePickerModule } from 'mydatepicker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ManuscriptFileListComponent } from './manuscript/manuscript-file-list/manuscript-file-list.component';
import { NgbdModalConfirmAutofocus } from './manuscript/manuscript-details/confirm';
import { ManuscriptWrapperComponent } from './manuscript/manuscript-wrapper/manuscript-wrapper.component';

@NgModule({
  declarations: [
    AppComponent,
    ManuscriptDetailsComponent,
    ManuscriptListComponent,
    ManuscriptFileListComponent,
    NgbdModalConfirmAutofocus,
    ManuscriptWrapperComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule, 
    NgbDatepickerModule,
    HttpClientModule,
    MyDatePickerModule,
    DragDropModule,
  ],
  providers: [
    NgbActiveModal,
  ],
  entryComponents: [NgbdModalConfirmAutofocus],
  bootstrap: [AppComponent]
})
export class AppModule { }
