import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { HttpClient } from '@angular/common/http';
import { AlertController } from 'ionic-angular';
import { Http, URLSearchParams, RequestOptions, Headers } from '@angular/http';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  recording: boolean = false;
  filePath: string;
  fileName: string;
  audio: MediaObject;
  audioList: any[] = [];
  audioUrl: string = 'http://51.141.167.97:8000/media/audio.mp3';
  descripcion: string = '';

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private media: Media,
    private transfer: FileTransfer,
    private file: File,
    public http: Http,
    public platform: Platform) {}

  ionViewWillEnter() {
    this.getAudioList();
  }

  alertResult(result) {
    let alert = this.alertCtrl.create({
      title: 'Resultados de evaluacion',
      subTitle: result,
      buttons: ['Dismiss']
    });
    alert.present();
  }

  getAudioList() {
    if(localStorage.getItem("audiolist")) {
      this.audioList = JSON.parse(localStorage.getItem("audiolist"));
      console.log(this.audioList);
    }
  }
  sendData() {
    console.log("ENVIANDO DATA");
    console.log(this.audioUrl);
    this.audioUrl = "http://starter.pe/voz.mp3";
    console.log(this.descripcion);
    this.descripcion = 'Mi nombre es Jorge. Soy un comunicador social de la Universidad Nacional Mayor de San Marcos. Me encanta temas relacionados a la tecnología. En un futuro pienso emprender un negocio con personas que tengan la misma visión que yo. Por el momento, estoy buscando especializarme en administración de empresas o neurociencias. Mis pasatiempos favoritos son leer, escuchar música y jugar con mi hermanito de 1 año y dos meses. El deporte que más practico es el karate. Mi entrenamiento son todos los sábados. La persona a quién admiro es Ellon Musk. Es una persona visionaria, talentosa y, sobre todo, líder.'
    var data = { 'audio': this.audioUrl, 'text': this.descripcion };
    let headers = new Headers();
    return new Promise((resolve, reject) => {
      this.http.post('http:/localhost:3000/analiza', data, {headers: headers})
        .subscribe(res => {
          this.alertResult("OK");
          console.log(res)
          //setTimeout(resolve(res), 5000);
          resolve(res);
        }, (err) => {
          this.alertResult("ERROR");
          reject(err);
        });
    });

  }


  startRecord() {
    if (this.platform.is('ios')) {
      this.fileName = 'record'+new Date().getDate()+new Date().getMonth()+new Date().getFullYear()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds()+'.m4a';
      this.filePath = this.file.documentsDirectory.replace(/file:\/\//g, '') + this.fileName;
      this.audio = this.media.create(this.filePath);
    } else if (this.platform.is('android')) {
      this.fileName = 'record'+new Date().getDate()+new Date().getMonth()+new Date().getFullYear()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds()+'.mp3';
      this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + this.fileName;

      this.audio = this.media.create(this.filePath);
    }
    this.audio.startRecord();
    this.recording = true;
  }

  uploadFile(imageURI) {

    const fileTransfer: FileTransferObject = this.transfer.create();

    let options: FileUploadOptions = {
      fileKey: 'ionicfile',
      httpMethod: 'POST',
      fileName: 'ionicfile',
      chunkedMode: false,
      mimeType: "audio/mp3",
      headers: {}
    }
   fileTransfer.upload(imageURI, 'http://51.141.167.97:8000/save_speech/', options)
      .then((data) => {
        var myobj = JSON.parse(data.response);
        this.audioUrl = 'http://' + myobj.url
      }, (err) => {
        console.log(err);
      });
  }

  stopRecord() {
    this.audio.stopRecord();
    let data = { filename: this.fileName };
    //this.audioList.push(data);
    this.audioList = [data];
    localStorage.setItem("audiolist", JSON.stringify(this.audioList));
    this.recording = false;
    this.getAudioList();
  }

  playAudio(file,idx) {
    if (this.platform.is('ios')) {
      this.filePath = this.file.documentsDirectory.replace(/file:\/\//g, '') + file;
      this.audio = this.media.create(this.filePath);
    } else if (this.platform.is('android')) {
      this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + file;
      console.log("ruta e enviar " + this.file.externalDataDirectory + file);
      this.uploadFile(this.file.externalDataDirectory + file);
      this.audio = this.media.create(this.filePath);
    }
    this.audio.play();
    this.audio.setVolume(0.8);
  }

  stopAudio() {
    this.audio.stop();
  }
}
