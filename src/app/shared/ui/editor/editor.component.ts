import { Component, Input, OnInit } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
  @Input() data: any = '';
  public Editor = ClassicEditor;

  constructor() { }

  ngOnInit() {
  }

}
