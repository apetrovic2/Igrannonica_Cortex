import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Configuration } from 'src/app/configuration';
import { LoginService } from 'src/app/services/login.service';
import { FilesService } from 'src/app/services/upload/files.service';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import files from 'src/files.json';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  loggedUser: boolean;
  files: any[];
  token: string;
  listOfFilesAuthorized: any = [];
  listOfFilesUnauthorized: any = [];
  selectedPrivacyType: string = "public";
  session: any;
  cookieCheck:any;
  publicFiles: any = [];
  publicFilesUnauthorized: any = [];
  allFiles: any = [];
  myFiles: any = [];
  
  configuration = new Configuration();

  pageNum: any = 1;
  numOfPages: any = 0;
  numPerPage: any = 8;

  public FilesList: { fileId: number, fileName: string, userId: number, username: string, isPublic: boolean, randomFileName: string, thisUser: string, Public:string, dateCreated:Date}[];
  public FilesListUnauthorized: { fileId: number, fileName: string, userId: number, username: string, isPublic: boolean, randomFileName: string, dateCreated:Date}[];

  constructor(private filesService: FilesService, private router: Router,private http: HttpClient, private loginService: LoginService, private userService: UserService, private cookie: CookieService, private toastr: ToastrService) {
   // this.username = this.getUsername();
  
    this.cookieCheck = this.cookie.get('token');
  }

  getUsername() {
    return this.cookie.get('username');
  }

  onLogout() {
    this.cookie.deleteAll();
    sessionStorage.clear();
    this.router.navigate(["upload"]);
  }

  refreshToken(){
      this.token = this.cookie.get('token');
      
      this.http.get<any>(this.configuration.refreshToken + this.token ).subscribe(token => {
        let JSONtoken: string = JSON.stringify(token);
        let StringToken = JSON.parse(JSONtoken).token;

        if (StringToken == "Token not valid"){
          this.onLogout();
          location.reload();
        }
        else{
          this.cookie.set("token", StringToken);
        }
      });
  }

  ngOnInit(): void {
    this.showDatasets(this.selectedPrivacyType, this.pageNum);
  }
  
  showDatasets(privacyType: string, page: number) {
    this.loggedUser = this.loginService.isAuthenticated();
    this.numOfPages = 0;
    if (this.cookieCheck) {
      this.refreshToken();
      this.listOfFilesAuthorized = this.filesService.filesAuthorized(privacyType, page, this.numPerPage, this.numOfPages).subscribe(data => {
        this.FilesList = data['files'];
        this.numOfPages = data['numOfPages'];
        
        this.allFiles = [];
        this.myFiles = [];

        for (let i = 0; i < this.FilesList.length; i++) {
          if (this.FilesList[i]['username'] == this.getUsername()) {
            this.FilesList[i]['thisUser'] = this.getUsername();
          }
          if(this.FilesList[i]['isPublic'] == true) {
            this.FilesList[i]['Public']="true";
          }
        } 

        for (let i = 0; i < this.FilesList.length; i++) {
          if(this.FilesList[i]['isPublic'] == true)  {
            this.allFiles.push(this.FilesList[i]);
          }
          if(this.FilesList[i]['username']== this.getUsername()) {
            this.myFiles.push(this.FilesList[i]);
          }
        }
        if(this.selectedPrivacyType == "public")
          this.FilesList = this.allFiles;
        else if(this.selectedPrivacyType == "mydatasets")
          this.FilesList = this.myFiles;
      })  
    }
    else {
      this.listOfFilesUnauthorized = this.filesService.filesUnauthorized("public", this.pageNum, this.numPerPage, this.numOfPages).subscribe(data => {
        this.FilesListUnauthorized = data['files'];
        this.numOfPages = data['numOfPages'];

        for (let i = 0; i < this.FilesListUnauthorized.length; i++) {
          if (this.FilesListUnauthorized[i]['isPublic'])
            this.publicFilesUnauthorized.push(this.FilesListUnauthorized[i]);
        }
      })
    }
  }

  public onSelectedType(event: any) {
    const value = event.target.value;
    this.selectedPrivacyType = value;
    this.pageNum = 1;
    this.showDatasets(this.selectedPrivacyType, this.pageNum);
  }

  save(fileName: string) {
    sessionStorage.setItem('fileName', fileName);
  }


  get() {
    return sessionStorage.getItem('fileName');
  }

    async uploadFile(files: any) {
    if (files.length === 0)
      return;
    
    sessionStorage.clear();
      
    let file = <File>files[0];
    var fileSize = file.size;
    if (fileSize / 1048576 > 5000)
      alert("Maximum file size is 500MB");
    else {
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.save(file.name);

      if (this.cookie.check('token')) {
        this.token = this.cookie.get('token');
        let headers = new HttpHeaders({
          'Authorization': 'bearer ' + this.token
        });
        let options = { headers: headers };

        await this.http.post<string>(this.configuration.fileUpload, formData, options).subscribe(name => {
          let JSONname: string = JSON.stringify(name);
          let StringName = JSON.parse(JSONname).randomFileName;
          this.cookie.set("filename", StringName);
          this.cookie.set('realName', file.name);
          this.router.navigate(['/tables']);
          console.log(StringName);
        })
      }
      else{
        await this.http.post<string>(this.configuration.fileUploadUnauthorized, formData).subscribe(name=>{
          let JSONname: string = JSON.stringify(name);
          let StringName = JSON.parse(JSONname).randomFileName;
          this.cookie.set("filename", StringName);
          this.cookie.set('realName', file.name);
          this.router.navigate(['/tables']);
        })
      }
    }
    this.uploadNotification();
  }

  filesAuthorized() {
    this.filesService.filesAuthorized(this.selectedPrivacyType, this.pageNum, this.numPerPage, this.numOfPages).subscribe(token => {
      let JSONtoken: string = JSON.stringify(token);
    })
  }
  filesUnauthorized() {
    this.filesService.filesUnauthorized("public", this.pageNum, this.numPerPage, this.numOfPages).subscribe(token => {
      let JSONtoken: string = JSON.stringify(token);
    })
  }

  download(event, item) {
    if (this.cookie.check('token')) {
      this.token = this.cookie.get('token');
      let headers = new HttpHeaders({
        'Authorization': 'bearer ' + this.token
      });
      let options = { headers: headers };
      this.http.get<any>(this.configuration.downloadFile+item.randomFileName, {headers, responseType:'blob' as 'json'}).subscribe((response:any) => {
        let dataType = response.type;
        let binaryData=[];
        binaryData.push(response);
        let downloadLink=document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData,{type:dataType}));
        if(item.randomFileName){
          downloadLink.setAttribute('download',item.randomFileName);
        }
        document.body.appendChild(downloadLink);
        downloadLink.click();
      })
    }
  }

  downloadUn(event, item) {
    this.http.get<any>(this.configuration.downloadFile + item.randomFileName, { responseType: 'blob' as 'json' }).subscribe((response: any) => {

      let dataType = response.type;
      let binaryData = [];
      binaryData.push(response);
      let downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
      if (item.randomFileName) {
        downloadLink.setAttribute('download', item.randomFileName);
      }
      document.body.appendChild(downloadLink);
      downloadLink.click();
    })
  }

  useThis(event, item) {
    this.cookie.set("filename", item.randomFileName);
    sessionStorage.clear();
  }
  useThisUn(event, item) {
    this.cookie.set("filename", item.randomFileName);
    sessionStorage.clear();
  }

  delete(event, item) {
    this.loggedUser = this.loginService.isAuthenticated();
    if (this.loggedUser) {
      this.token = this.cookie.get('token');
    }
    let headers = new HttpHeaders({
      'Authorization': 'bearer ' + this.token
    });
    let options = { headers: headers };
    this.http.get<any>(this.configuration.downloadFileUnauthorized + item.randomFileName, options).subscribe(token => {
      let JSONtoken: string = JSON.stringify(token);
      location.reload();
    })
  }
  

  onCheckboxChange(event: any,item) {
    
    if(!event.target.checked){
      item.isPublic = false;
      this.loggedUser = this.loginService.isAuthenticated();
      if (this.loggedUser) {
        this.token = this.cookie.get('token');
      }
      let headers = new HttpHeaders({
        'Authorization': 'bearer ' + this.token
      });
      let options = { headers: headers };
      this.http.post<string>(this.configuration.updateVisibility,
      {
        "id" : item.fileId,
        "isVisible" : item.isPublic
      }, options).subscribe(token => {
        let JSONtoken: string = JSON.stringify(token);
      })
      /*
      if(this.selectedPrivacyType == "public")
        location.reload();
      */
    }
    if(event.target.checked){
      item.isPublic = true;
      this.loggedUser = this.loginService.isAuthenticated();
      if (this.loggedUser) {
        this.token = this.cookie.get('token');
      }
      let headers = new HttpHeaders({
        'Authorization': 'bearer ' + this.token
      });
      let options = { headers: headers };
      this.http.post<string>(this.configuration.updateVisibility ,
      {
        "id" : item.fileId,
        "isVisible" : item.isPublic
      }, options).subscribe(token => {
        let JSONtoken: string = JSON.stringify(token);
      })
    }
    /*
    if(this.selectedPrivacyType == "public")
        location.reload();
    */
  }

  uploadNotification() {
    this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> <b>File uploaded successfully</b>.', '', {
      disableTimeOut: false,
      closeButton: true,
      enableHtml: true,
      toastClass: "alert alert-info alert-with-icon",
      positionClass: 'toast-top-center'
    });
  }

  nextPage(i: number) {
    if(this.pageNum + i <= this.numOfPages){
      this.pageNum += i;
      this.showDatasets(this.selectedPrivacyType, this.pageNum);
    }
  }

  previousPage(i : number) {
    if(this.pageNum - i >= 1){
      this.pageNum -= i;
      this.showDatasets(this.selectedPrivacyType, this.pageNum);
    }
  }

  firstPage(){
    if(this.pageNum != 1){
      this.pageNum = 1;
      this.showDatasets(this.selectedPrivacyType, this.pageNum);
    }
  }

  lastPage(){
    if(this.pageNum != this.numOfPages){
      this.pageNum = this.numOfPages;
      this.showDatasets(this.selectedPrivacyType, this.pageNum);
    }
  }
}
