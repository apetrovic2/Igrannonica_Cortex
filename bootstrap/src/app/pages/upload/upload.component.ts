import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { LoginService } from 'src/app/services/login.service';
import { FilesService } from 'src/app/services/upload/files.service';
import { UserService } from 'src/app/services/user.service';
import files from 'src/files.json';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  loggedUser: boolean;
  files: any[];
  token : string;
  listOfFilesAuthorized : any=[];
  selectedPrivacyType : string = "all";
  publicFiles:any = [];
  privateFiles:any = [];

  public FilesList:{fileId:number, fileName:string, userId:number, username:string, isPublic:boolean}[];

  constructor(private filesService:FilesService,private http: HttpClient, private loginService: LoginService, private userService: UserService, private cookie : CookieService) {
    
  }

  ngOnInit(): void {
    this.loggedUser = this.loginService.isAuthenticated();
    if (!(this.get())) {
      console.log("1245");
    }

    let pubFiles = [];
    let privFiles = [];
    this.listOfFilesAuthorized = this.filesService.filesAuthorized().subscribe(data=> {
     // this.FilesList=data;
    })
    
    this.FilesList=files;
    for(let i=0;i<this.FilesList.length;i++){
      if(this.FilesList[i]['isPublic'])
      this.publicFiles.push(this.FilesList[i]);
      else this.privateFiles.push(this.FilesList[i]);
    }
    console.log(this.publicFiles);
    console.log(this.privateFiles);



  }

  public onSelectedType(event: any) {
    const value = event.target.value;
    this.selectedPrivacyType = value;
    this.FilesList=files;
    if(this.selectedPrivacyType=="true"){
      this.FilesList = this.publicFiles;
      console.log(this.publicFiles);
    }
    else if(this.selectedPrivacyType=='false'){
    this.FilesList = this.privateFiles;
    console.log(this.FilesList);
    }
 }

  save(fileName:string){
    sessionStorage.setItem('fileName',fileName);
  }
  

  get() {
    return sessionStorage.getItem('fileName');
  }



  public uploadFile(files: any) {
    if (files.length === 0)
      return;

    let file = <File>files[0];
    var fileSize = file.size;
    if (fileSize / 1048576 > 500)
      alert("Maximum file size is 500MB");
    else {
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.save(file.name);

      if(this.cookie.check('token'))
      {
        this.token = this.cookie.get('token');
        let headers = new HttpHeaders({
          'Authorization': 'bearer ' + this.token });
        let options = { headers: headers };

        this.http.post<string>('https://localhost:7219/api/FileUpload', formData, options).subscribe(name => {
         this.cookie.set("filename", file.name);
      })
      }
    }
  }

  filesAuthorized() {
      this.filesService.filesAuthorized().subscribe(token => {
        let JSONtoken: string = JSON.stringify(token);
      })
  }
  

}
