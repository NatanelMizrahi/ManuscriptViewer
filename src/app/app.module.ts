import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule, NgbDatepickerModule, NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material.module';
import {MatDialogModule} from '@angular/material';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { ManuscriptDetailsComponent } from './manuscript/manuscript-details/manuscript-details.component';
import { MyDatePickerModule } from 'mydatepicker';
import { ManuscriptFileListComponent } from './manuscript/manuscript-file-list/manuscript-file-list.component';
import { NgbdModalConfirmAutofocus } from './manuscript/manuscript-details/confirm';
import { AppRoutingModule } from './app-routing.module';
import { ManuscriptPageComponent } from './manuscript/manuscript-page/manuscript-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    UserPageComponent,
    ManuscriptDetailsComponent,
    ManuscriptFileListComponent,
    NgbdModalConfirmAutofocus,
    ManuscriptPageComponent
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
    BrowserAnimationsModule, MaterialModule, MatDialogModule, // Angular Material
    AppRoutingModule
  ],
  providers: [
    NgbActiveModal,
  ],
  entryComponents: [NgbdModalConfirmAutofocus],
  bootstrap: [AppComponent]
})
export class AppModule { }
