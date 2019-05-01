import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DragulaModule } from 'ng2-dragula';

@NgModule({
  imports:      [ BrowserModule, FormsModule, DragulaModule.forRoot() ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
