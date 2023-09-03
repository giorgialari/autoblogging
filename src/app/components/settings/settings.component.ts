import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OpenAIService } from 'src/app/services/open-ai.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  openAISettingsForm!: FormGroup;
  wpSettingsForm!: FormGroup;

  constructor(private fb: FormBuilder, private openAiService: OpenAIService) { }

  ngOnInit() {
    // Inizializza i form con i valori da localStorage
    this.openAISettingsForm = this.fb.group({
      apiKey: [localStorage.getItem('openAI_apiKey')],
    });

    this.wpSettingsForm = this.fb.group({
      wpUrl: [localStorage.getItem('wp_wpUrl') || ''  ],
      status: [localStorage.getItem('wp_status') || 'draft' ],
      btoa: [localStorage.getItem('wp_btoa') || ''],
    });
  }

  saveOpenAISettings() {
    const settings = this.openAISettingsForm.value;
    localStorage.setItem('openAI_apiKey', settings.apiKey || '');
  }



  saveWPSettings() {
    const settings = this.wpSettingsForm.value;
    localStorage.setItem('wp_wpUrl', settings.wpUrl);
    localStorage.setItem('wp_status', settings.status);
    localStorage.setItem('wp_btoa', settings.btoa);
  }

  saveAll(){
    this.saveOpenAISettings()
    this.saveWPSettings()
  }
}
