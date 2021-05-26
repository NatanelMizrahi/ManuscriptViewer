import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'confirm-modal',
  template: `
  <div class="modal-header">
    <h4 class="modal-title" id="modal-title">Upate Manuscript</h4>
    <button type="button" class="close" aria-label="Close button" aria-describedby="modal-title" (click)="modal.dismiss('Cross click')">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="modal-body">
    <p><strong>Would you like to save changes in <span class="text-primary">{{title}}</span> profile?</strong></p>
    <p>Any unsaved changes to this version will be permanently deleted.
    <span class="text-danger">This operation can not be undone.</span>
    </p>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-outline-secondary" (click)="modal.dismiss('cancel click')">Ignore</button>
    <button type="button" ngbAutofocus class="btn btn-danger" (click)="modal.close('Ok click')">Save</button>
  </div>
  `
})
export class NgbdModalConfirmAutofocus {
  constructor(public modal: NgbActiveModal) {}
}
