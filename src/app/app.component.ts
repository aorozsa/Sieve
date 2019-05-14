import { Component } from '@angular/core';
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { saveAs } from 'file-saver';
declare var require: any

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  task: string;
  saveName: String;
  loadName: String;

  public groups: Array<any>;

  constructor(private dragulaService: DragulaService) {
      this.dragulaService.createGroup('COLUMNS', {
        direction: 'horizontal',
        moves: (el, source, handle) => handle.className === 'header'
      });
    }

    newHeader() {
      this.groups.push({name: this.task, items: [{name: ''}]});
      this.task = '';
      console.log(this.groups);
    }

    saveButton(){
      const blob = new Blob([JSON.stringify(this.groups)], {type : 'application/json'});
      // saveAs(blob, this.saveName + '.json');
      saveAs(blob, this.saveName + '.json');
      this.saveName = '';
    }

    loadFile(filePath: string) {
      console.log(filePath)
      var fileName = filePath.replace(/^.*[\\\/]/, '')
      console.log(fileName)
      this.groups = require("../assets/save/" + fileName);

    }


}
