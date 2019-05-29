import { Component } from '@angular/core';
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { saveAs } from 'file-saver';
import { ExcelService } from './services/excel.service';
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
  
  title: string;
  quote: string;
  coding: string;
  
  // selectedGroup: string = 'None';
  selectedGroup = 'None';
  selectedGroupID = '';
  
  selectedItem = 'None';
  selectedItemID = '';

  public groups: Array<any> = require('src/assets/save/groups.json');
  constructor(private dragulaService: DragulaService, private excelService: ExcelService) {
    this.dragulaService.createGroup('COLUMNS', {
      direction: 'vertical',
      moves: (el, source, handle) => handle.className === 'header'
    });
    this.dragulaService.createGroup('ITEMS', {
      direction: 'horizontal',
      revertOnSpill: false,
      moves: (el, source, handle) => handle.className === 'item'
    });
  }

  newHeader() {
    this.groups.push({ name: this.task, items: [] });
    this.task = '';
    console.log(this.groups);
  }

  selectChangeHandler(event: any) {
    // Update the UI
    this.selectedGroupID = event.target.options.selectedIndex;
    this.selectedGroup = event.target.value;
  }
  
  selectItemHandler(event: any) {
    // Update the UI
    this.selectedItemID = event.target.options.selectedIndex;
    this.selectedItem = event.target.value;
  }

  newItem() {
    try {
      this.groups[Number(this.selectedGroupID) - 1].items.push({ name: this.itemName })
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

  exportAsXLSX() {
    const data = new Array<any>();
    for (let listIndex = 0; listIndex < this.groups.length; listIndex++) {
      const group = this.groups[listIndex];

      for (const attKey in group) {
        const attVal = group[attKey];
        if (attKey === 'name') {
          data.push({ Group: attVal });
        } else {

          // tslint:disable-next-line: prefer-for-of
          for (let itemsIndex = 1; itemsIndex <= attVal.length; itemsIndex++) {
            const items = attVal[itemsIndex - 1];
            // tslint:disable-next-line: forin
            for (let item in items) {
              item = items[item];
              const key = 'I' + itemsIndex;
              data[listIndex][key] = 'Sample Title' + '\n\n' + item;
            }
          }

        }

      }
    }
    this.excelService.exportAsExcelFile(data, 'data');
  }
}
