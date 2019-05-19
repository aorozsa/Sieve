import { Component } from '@angular/core';
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { saveAs } from 'file-saver';
declare var require: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  task: string;
  saveName: string;
  loadName: string;
  itemName: string;
  // selectedGroup: string = 'None';
  selectedGroup = 'None';
  selectedGroupID = '';

  public groups: Array<any> = require('src/assets/save/groups.json');

  constructor(private dragulaService: DragulaService) {
    this.dragulaService.createGroup('COLUMNS', {
      direction: 'horizontal',
      moves: (el, source, handle) => handle.className === 'header'
    });
  }

  newHeader() {
    this.groups.push({ name: this.task, items: [{ name: '' }] });
    this.task = '';
    console.log(this.groups);
  }

  selectChangeHandler(event: any) {
    // Update the UI
    this.selectedGroupID = event.target.options.selectedIndex;
    this.selectedGroup = event.target.value;
  }

  newItem() {
    try {
      this.groups[this.selectedGroupID].items.push({ name: this.itemName })
      this.task = '';
    } catch (err) {
      this.selectedGroup = 'Please Select a Group';
    }
    // this.groups.push({name: this.task, items: [{name: ''}]});
    // this.task = '';
    // console.log(this.groups);
    console.log(this.selectedGroup);
    console.log(this.groups);
  }

  saveButton() {
    const blob = new Blob([JSON.stringify(this.groups)], { type: 'application/json' });
    saveAs(blob, this.saveName + '.json');
    this.saveName = '';
  }

  loadFile(filePath: string) {
    console.log(filePath);
    const fileName = filePath.replace(/^.*[\\\/]/, '');
    console.log(fileName);
    this.groups = require('src/assets/save/' + fileName);

  }
}
