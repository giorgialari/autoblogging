import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  openAISettingsForm!: FormGroup;
  wpSettingsForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // Inizializza i form con i valori da localStorage
    this.openAISettingsForm = this.fb.group({
      apiKey: [localStorage.getItem('openAI_apiKey') || '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'],
      model: [localStorage.getItem('openAI_model') || 'gpt-3.5-turbo-16k-0613'],
      temperature: [localStorage.getItem('openAI_temperature') || 0.8],
      maxTokens: [localStorage.getItem('openAI_maxTokens') || 2048],
      topP: [localStorage.getItem('openAI_topP') || 1],
      frequencyPenalty: [localStorage.getItem('openAI_frequencyPenalty') || 0],
      presencePenalty: [localStorage.getItem('openAI_presencePenalty') || 0],
    });

    this.wpSettingsForm = this.fb.group({
      wpUrl: [localStorage.getItem('wp_wpUrl') || 'https://reviewmodeon.com/wp-json/wp/v2'],
      status: [localStorage.getItem('wp_status') || 'draft'],
      btoa: [localStorage.getItem('wp_btoa') || 'r3vi3wm0d30n:fj[^1le84j24'],
    });
  }

  saveOpenAISettings() {
    const settings = this.openAISettingsForm.value;
    localStorage.setItem('openAI_apiKey', settings.apiKey);
    localStorage.setItem('openAI_model', settings.model);
    localStorage.setItem('openAI_temperature', settings.temperature);
    localStorage.setItem('openAI_maxTokens', settings.maxTokens);
    localStorage.setItem('openAI_topP', settings.topP);
    localStorage.setItem('openAI_frequencyPenalty', settings.frequencyPenalty);
    localStorage.setItem('openAI_presencePenalty', settings.presencePenalty);
  }

  saveWPSettings() {
    const settings = this.wpSettingsForm.value;
    localStorage.setItem('wp_wpUrl', settings.wpUrl);
    localStorage.setItem('wp_status', settings.status);
    localStorage.setItem('wp_btoa', settings.btoa);
  }
}
