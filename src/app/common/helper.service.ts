import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  urlify(text) {
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    // var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url, b, c) => {
        const url2 = (c == 'www.') ?  'http://' + url : url;
        return '<a href="' + url2 + '" target="_blank">' + url + '</a>';
    });
  }

  featuresList() {
    return [{
      payload: '',
      title: 'Accounting'
    }, {
      payload: '',
      title: 'Tax'
    }, {
      payload: '',
      title: 'Secretarial'
    }, {
      payload: '',
      title: 'Payroll'
    }, {
      payload: '',
      title: 'Audit'
    }]
  }

}
