import { Component, OnInit } from '@angular/core';
import Dynamsoft from 'mobile-web-capture';
import { WebTwain } from 'mobile-web-capture/dist/types/WebTwain';

@Component({
  selector: 'app-document-scanner',
  templateUrl: './document-scanner.component.html',
  styleUrls: ['./document-scanner.component.css']
})
export class DocumentScannerComponent implements OnInit {
  dwtObject: WebTwain | undefined;
  videoSelect: HTMLSelectElement | undefined;
  sourceDict: any = {};

  constructor() { }

  ngOnInit(): void {
    this.videoSelect = document.querySelector('select#videoSource') as HTMLSelectElement;
    Dynamsoft.DWT.ProductKey = "t01679QMAAGCkngoS+fTchR/4UD0wgtrL8WrF4mlMVI0BY8Bu4aCrXKZB1jgfLud/uRfZ+cknD1hTEf28vCBLAgfa1s2ugFkXRnxD2TeMgYEWkdeSXUJn+AXmAqQC9JE9KH85gHvcvo4KHWAPiAPEmwN5YLCKbFsUHpZf6ipoCNgD8gFQO69tMNqWHcc6P0VsjXcxbPIfmnJ+sx7VmU3+oamCW0qRnkEVy18=";
    Dynamsoft.DWT.ResourcesPath = 'assets/dynamic-web-twain';
    Dynamsoft.DWT.Containers = [{ ContainerId: 'dwtcontrolContainer' }];
    Dynamsoft.DWT.UseLocalService = false;
    Dynamsoft.DWT.Load();
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => { this.onReady(); });
  }

  scanDocument() {
    if (this.videoSelect) {
      let index = this.videoSelect.selectedIndex;
      if (index < 0) return;

      var option = this.videoSelect.options[index];
      if (this.dwtObject) {
        this.dwtObject.Addon.Camera.selectSource(this.sourceDict[option.text]).then(camera => {
          if (this.videoSelect) this.createCameraScanner(this.sourceDict[option.text]);
        });
      }

    }

  }

  downloadDocument() {
    if (this.dwtObject) {
      this.dwtObject.SaveAsJPEG("document.jpg", this.dwtObject.CurrentImageIndexInBuffer);
    }
  }

  onReady() {
    this.dwtObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
    this.updateCameraList();
  }

  async createCameraScanner(deviceId: string): Promise<void> {
    if (this.dwtObject) {
      await this.dwtObject.Addon.Camera.closeVideo();
      this.dwtObject.Addon.Camera.scanDocument({
        scannerViewer: {
          deviceId: deviceId,
          fullScreen: true,
          autoDetect: {
            enableAutoDetect: true
          },
          continuousScan: false
        }

      }).then(
        function () { console.log("OK"); },
        function (error: any) { console.log(error.message); });
    }

  }

  updateCameraList() {
    if (this.videoSelect && this.dwtObject) {
      this.videoSelect.options.length = 0;
      this.dwtObject.Addon.Camera.getSourceList().then((list) => {
        for (var i = 0; i < list.length; i++) {
          var option = document.createElement('option');
          option.text = list[i].label || list[i].deviceId;
          if (list[i].label) {
            this.sourceDict[list[i].label] = list[i].deviceId;
          }
          else {
            this.sourceDict[list[i].deviceId] = list[i].deviceId;
          }
          if (this.videoSelect) this.videoSelect.options.add(option);
        }

      });
    }
  }
}
