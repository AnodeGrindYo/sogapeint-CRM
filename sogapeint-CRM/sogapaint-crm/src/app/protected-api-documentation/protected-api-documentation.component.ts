import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-protected-api-documentation',
  templateUrl: './protected-api-documentation.component.html',
  styleUrls: ['./protected-api-documentation.component.scss']
})
export class ProtectedApiDocumentationComponent {
  public safeUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // const docUrl = '/assets/documentation/index.html';
    // this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(docUrl);
    const apiDocUrl = '/assets/swagger-docs/index.html';
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(apiDocUrl);
  }

}

