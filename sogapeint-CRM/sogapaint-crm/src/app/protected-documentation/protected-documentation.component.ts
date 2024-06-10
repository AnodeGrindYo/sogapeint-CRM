// protected-documentation.component.ts
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-protected-documentation',
  templateUrl: './protected-documentation.component.html'
})
export class ProtectedDocumentationComponent implements OnInit {
  public safeUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const docUrl = '/assets/documentation/index.html';
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(docUrl);
    // const apiDocUrl = '/assets/swagger-docs/index.html';
    // this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(apiDocUrl);
  }
}
