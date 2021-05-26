import { Injectable } from '@angular/core';
import { Manuscript, ManuscriptFile } from './manuscript';
import { HttpClient, HttpEventType, HttpEvent, HttpHeaders} from '@angular/common/http';
import { Http, Response, RequestOptions } from '@angular/http';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { testFiles, testDB } from './test/testFiles';

@Injectable()
export class ManuscriptService {
    private manuscriptsUrl = '/api/manuscripts';
    private usersUrl = '/api/users';
    uploadProgress:number;
    uploadDone: boolean;

    constructor (private http: HttpClient) {   }

    // get("/api/manuscripts")
    getManuscripts(userID: string | number): Promise<void | Manuscript[]> {
      return this.http.get(`${this.usersUrl}/${userID}`)
                 .toPromise()
                 .then(response => response as Manuscript[])
                 .catch(this.handleError);
    }

    // post("/api/manuscripts")
    createManuscript(newManuscript: Manuscript): Promise<void | Manuscript> {
      console.log("(1.1) serivce ", newManuscript);
      return this.http.post(this.manuscriptsUrl, newManuscript)
                 .toPromise()
                 .then(response => { console.log("(1.9) after service", response);return response as Manuscript})
                 .catch(this.handleError);
    }

    // get("/api/manuscripts/:id") endpoint not used by Angular app
    getManuscriptbyId(id:string): Promise<void | Manuscript> {
      return this.http.get(this.manuscriptsUrl + "/" + id)
                 .toPromise()
                 .then(response => response as Manuscript)
                 .catch(this.handleError);
    }
    // delete("/api/manuscripts/:id")
    deleteManuscript(delManuscriptId: String): Promise<void | String> {
      return this.http.delete(this.manuscriptsUrl + '/' + delManuscriptId)
                 .toPromise()
                 .then(response => response as String)
                 .catch(this.handleError);
    }

    // put("/api/manuscripts/:id")
    updateManuscript(putManuscript: Manuscript): Promise<void | Manuscript> {
      var putUrl = this.manuscriptsUrl + '/' + putManuscript._id;
      return this.http.put(putUrl, putManuscript)
                 .toPromise()
                 .then(response => response as Manuscript)
                 .catch(this.handleError);
    }

    uploadFiles(filesToUpload:Array<File>, manuscript:Manuscript = testDB[0]){
      var version = Math.max(0, manuscript.versions.indexOf(manuscript._id));
      var uploadURL = `/upload/${manuscript.ownerId}/${manuscript.versionId}/${version}`;
      console.log("version:",version);
      const formData: any = new FormData();
      for(let i =0; i < filesToUpload.length; i++)
          formData.append("uploads[]", filesToUpload[i], filesToUpload[i].name);
      return this.http.post<ManuscriptFile[]>(uploadURL, formData,
      {
        observe:'events',
        reportProgress:true
      });
    }

    deleteFiles(filesToDelete:Array<ManuscriptFile>){
      var uploadURL = `/upload/`;
      let options = {
        headers: new HttpHeaders({'Content-Type': 'application/json',}),
        body: filesToDelete 
      };
      return this.http.delete(uploadURL, options).toPromise()
      .then(response => response as String[])
      .catch(this.handleError);;
    }

    private handleError (error: any) {
      let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
    }
}
