export class Manuscript {
    constructor(
       public title: string,
       public author: string,
       public date: Date ,
       public language: string,
       public description: string,
       public content: string,
       public versions: string[],
       public files?: ManuscriptFile[],
       public versionId?:string,
       public _id?:string,
       public ownerId?:string,
 ) {  }
  get version(){ return Math.max(0, this.versions.indexOf(this._id)); }
}

export type ManuscriptFile = {
    _id?:string,
    name?:string,
    modified?: Date,
    url:string,
}
