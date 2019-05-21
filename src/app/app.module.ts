import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DragulaModule } from 'ng2-dragula';
import { ExcelService } from './services/excel.service';

@NgModule({
  imports: [BrowserModule, FormsModule, DragulaModule.forRoot()],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [ExcelService]
})
export class AppModule { }
