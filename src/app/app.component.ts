import { Component } from '@angular/core';
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


 constructor(private dragulaService: DragulaService) {
   this.dragulaService.createGroup("COLUMNS", {
     direction: 'horizontal',
     moves: (el, source, handle) => handle.className === "group-handle"
   });
 }

 public groups:Array<any> = [
   {
     name: 'Group A',
     items: [{name: 'Item A'}, {name: 'Item B'}, {name: 'Item C'}, {name: 'Item D'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   },
   {
     name: 'Group B',
     items: [{name: 'Item 1'}, {name: 'Item 2'}, {name: 'Item 3'}, {name: 'Item 4'}]
   },
   {
     name: 'Group C',
     items: [{name: 'Item W'}, {name: 'Item X'}, {name: 'Item Y'}, {name: 'Item Z'}]
   }
 ];



}
