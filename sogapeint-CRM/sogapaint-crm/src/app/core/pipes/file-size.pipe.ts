import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

  transform(size: number): string {
    if (isNaN(size)) {
      return '';
    } else if (size < 1024) {
      return size + ' bytes';
    } else if (size >= 1024 && size < 1048576) {
      return (size / 1024).toFixed(1) + ' KB';
    } else if (size >= 1048576) {
      return (size / 1048576).toFixed(1) + ' MB';
    }
  }
}
