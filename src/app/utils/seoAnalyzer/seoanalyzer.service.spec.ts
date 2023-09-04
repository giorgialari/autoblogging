import { TestBed } from '@angular/core/testing';

import { SeoAnalyzerService } from './seoanalyzer.service';

describe('SeoanalyzerService', () => {
  let service: SeoAnalyzerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoAnalyzerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
