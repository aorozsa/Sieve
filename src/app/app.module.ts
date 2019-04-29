import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SomeComponent } from './some.component';
import { DragulaModule } from 'ng2-dragula';

@NgModule({
  imports:      [ BrowserModule, FormsModule, DragulaModule.forRoot(), DragulaModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
