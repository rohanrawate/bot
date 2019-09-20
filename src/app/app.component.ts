import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AppService } from '@app/app.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { HelperService } from './common/helper.service';

import {
  SpeechSynthesisUtteranceFactoryService,
  SpeechSynthesisService,
} from '@kamiazya/ngx-speech-synthesis';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', './media-queries/media-queries.component.scss'],
  providers: [AppService, SpeechSynthesisUtteranceFactoryService],
  animations: [
    trigger('changeDivSize', [
      state('initial', style({
        height: '0px',
        bottom: '105px',
        visibility: 'hidden'
      })),
      state('final', style({
        height: '570px',
      })),
      transition('initial=>final', animate('250ms')),
      transition('final=>initial', animate('250ms'))
    ]),
    trigger('changeBtn', [
      state('initial', style({
        height: '50px',
      })),
      state('final', style({
        height: '0px',
        padding: '0px',
        display: 'none',
      })),
      transition('initial=>final', animate('20ms')),
      transition('final=>initial', animate('250ms'))
    ]),
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(1000)), ]),
  ]
})
export class AppComponent implements OnInit {
  currentState = 'initial';
  name: string;
  contactNo: string;
  email: string;
  userQuery: string;
  msgArr = [];
  btnOptions = [];
  presentQuestion;
  loadingQuestion;
  isBotArr;
  botArrOptions = [];
  myControl = new FormControl();
  options: string[] = [];
  taxRateArray = [];
  sliderValue;
  showSlider;
  epsTableData = [];
  showHideEmailMsg;
  showHideContactMsg;
  showHideNameMsg;
  showLoading;
  filteredOptions: Observable<string[]>;
  displayedColumns: string[] = ['employersContribution', 'employeesContribution', 'total'];
  dataSource = [];

  constructor(private appService: AppService,
              public f: SpeechSynthesisUtteranceFactoryService,
              public svc: SpeechSynthesisService,
              private helperService: HelperService,
  ) {}
  ngOnInit() {
    this.msgArr.push({bot: 'What is your name?'});
    this.presentQuestion = 'name';
  }
  onCheckSlider() {
    console.log(this.sliderValue);
  }
  changeState() {
    this.currentState = this.currentState === 'initial' ? 'final' : 'initial';
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  onName(name) {
    if (name.length < 2) {
      this.showHideNameMsg = true;
      setTimeout(() => {
        this.showHideNameMsg = false;
      }, 3000);
      return;
    } else {
      // this.showLoading = true;
      this.msgArr.push({user: name});
      localStorage.setItem('name', name);
      // this.name = '';
      this.loadingQuestion = 'Can you please provide your contact number';
      this.presentQuestion = 'Can you please provide your contact number';
      this.msgArr.push({bot: 'Can you please provide your contact number'});
      // setTimeout(() => {
      //   this.showLoading = false;
      // }, 2000);
    }
  }
  onContactNo(contactNo) {
    if (contactNo.length < 5 || contactNo.length > 13) {
      this.showHideContactMsg = true;
      setTimeout(() => {
        this.showHideContactMsg = false;
      }, 3000);
      return;
    } else {
      // this.showLoading = true;
      this.msgArr.push({user: contactNo});
      // this.contactNo = '';
      this.loadingQuestion = 'can you please share your email id';
      this.presentQuestion = 'can you please share your email id';
      this.msgArr.push({bot: 'can you please share your email id'});
      // setTimeout(() => {
      //   this.showLoading = false;
      // }, 2000);
    }
  }
  onEmail(email) {
    const emailPattern = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$');
    if (email !== undefined && email !== '') {
      if (!emailPattern.test(email)) {
        this.showHideEmailMsg = true;
        setTimeout(() => {
          this.showHideEmailMsg = false;
        }, 5000);
        return;
      } else {
        // this.showLoading = true;
        this.showHideEmailMsg = false;
        this.msgArr.push({user: email});
        // this.email = '';
        const userName = localStorage.getItem('name');
        this.loadingQuestion =
        'Hi ' + userName + '.<br> Thanks for sharing your contact details.<br>You can ask any query related to below topics.';
        this.presentQuestion =
        'Hi ' + userName + '.<br> Thanks for sharing your contact details.<br>You can ask any query related to below topics.';
        this.msgArr.push(
          {bot: 'Hi ' + userName + '.<br> Thanks for sharing your contact details.<br>You can ask any query related to below topics.'}
        );
        this.btnOptions = this.helperService.featuresList();
        // setTimeout(() => {
        //   this.showLoading = false;
        // }, 2000);
      }
    }
  }

  onUserQuery() {
    this.loadingQuestion = '';
    this.presentQuestion = '';
    if (this.userQuery === '' || this.userQuery === undefined) {
      return;
    }
    this.msgArr.push({user: this.userQuery});
    this.showLoading = true;
    this.isBotArr = false;
    this.appService.getBotData(this.userQuery).subscribe((data) => {
      this.showLoading = false;
      if (data.length === 0) {
        return;
      }
      if (data[0].text === 'choose your Chargeable Income range') {
        this.isBotArr = false;
        this.msgArr.push({bot: this.helperService.urlify(data[0].text), same: false});
        this.presentQuestion = 'choose your Chargeable Income range';
        this.loadingQuestion = 'choose your Chargeable Income range';
        this.taxRateArray = data[0].buttons;
        this.taxRateArray.forEach((obj) => {
          this.options.push(obj.title);
        });
        this.filteredOptions = this.myControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
        this.userQuery = '';
      } else {
          if (data[0].text.indexOf('\n') > -1) {
            this.isBotArr = true;
            const botArray = data[0].text.split('\n');
            this.msgArr.push({bot: this.helperService.urlify(botArray[0]), same: false});
            for (let i = 1; i < botArray.length; i++) {
              setTimeout(() => {
                  this.msgArr.push({bot: this.helperService.urlify(botArray[i]), same: true});
              }, 2000 * (i + 1));
            }
            if (data[0].hasOwnProperty('buttons')) {
              this.btnOptions = data[0].buttons;
              this.loadingQuestion = botArray[botArray.length - 1];
              this.presentQuestion = botArray[botArray.length - 1];
            } else {
              this.btnOptions = [];
            }
          } else {
            this.isBotArr = false;
            this.msgArr.push({bot: this.helperService.urlify(data[0].text), same: false});
            if (data.length > 1) {
              this.msgArr.push({bot: this.helperService.urlify(data[1].text), same: false});
            }
            if (data[0].hasOwnProperty('buttons')) {
              this.btnOptions = data[0].buttons;
              this.loadingQuestion = data[0].text;
              this.presentQuestion = data[0].text;
            } else {
              this.btnOptions = [];
            }
          }
          this.userQuery = '';
      }
      console.log(this.msgArr);
    });
  }

  onInput() {
    if (this.userQuery === '' || this.userQuery === undefined) {
      return;
    }

    if (this.msgArr.length === 1) {
      this.onName(this.userQuery);
      this.userQuery = '';
      return;
    } else if (this.msgArr.length === 3) {
      this.onContactNo(this.userQuery);
      this.userQuery = '';
      return;
    } else if (this.msgArr.length === 5) {
      this.onEmail(this.userQuery);
      this.userQuery = '';
      return;
    }

    this.onUserQuery();
    this.userQuery = '';

  }


  radioClickChange(e, obj) {
    if (obj.payload === '') {
      return;
    }
    this.isBotArr = false;
    this.showSlider = false;
    // SOCSO Rate for contribution on your salary
    // once eis comes use below logic
    // this.isBotArr = true;
    // this.msgArr.push({user: this.text});
    // this.msgArr.push({bot: 'Please select a range for EIS contribution rate'});
    // this.presentQuestion = 'Please select a range for EIS contribution rate';
    // this.btnOptions = [];
    // this.showSlider = true;
    // this.text = '';
    this.msgArr.push({user: obj.title});
    console.log(e.value);
    if (e.value !== '/ageLimitYes' && e.value !== '/ageLimitNo') {
      this.appService.getBotData(e.value).subscribe((data) => {

        // if (obj.title == 'SOCSO Rate for contribution on your salary') {
        //   this.isBotArr = true;
        //   this.presentQuestion = data[0].text;
        //   this.loadingQuestion = data[0].text;
        //   this.msgArr.push({bot: data[0].text});
        //   this.btnOptions = [];
        //   this.showSlider = true;
        //   this.userQuery = '';
        // } else
         if (data.length > 1) {
          if (data[0].hasOwnProperty('buttons')) {
            this.btnOptions = data[0].buttons;
            this.presentQuestion = data[0].text;
            this.loadingQuestion = data[0].text;
          } else {
            this.btnOptions = [];
          }
          for (let i = 0; i < data.length; i++) {
            setTimeout(() => {
                this.msgArr.push({bot: this.helperService.urlify(data[i].text), same: false});
            }, 1000 * (i + 1));
          }
        } else if (data[0].text.indexOf('\n') > -1) {
          this.isBotArr = true;
          const botArray = data[0].text.split('\n');
          // this.msgArr.push({bot: botArray});
          // console.log(this.msgArr);
          for (let i = 0; i < botArray.length; i++) {
            setTimeout(() => {
                this.msgArr.push({bot: this.helperService.urlify(botArray[i]), same: false});
            }, 1000 * (i + 1));
          }
          if (data[0].hasOwnProperty('buttons')) {
            this.btnOptions = data[0].buttons;
            this.presentQuestion = botArray[botArray.length - 1];
            this.loadingQuestion = botArray[botArray.length - 1];
          } else {
            this.btnOptions = [];
          }
        } else {
          if (data[0].text == 'Choose your salary range') {
            this.msgArr.push({bot: this.helperService.urlify(data[0].text), same: false});
            this.presentQuestion = data[0].text;
            this.loadingQuestion = data[0].text;
            this.isBotArr = true;
            this.btnOptions = [];
            this.showSlider = true;
            this.userQuery = '';
          } else {
            this.msgArr.push({bot: this.helperService.urlify(data[0].text), same: false});
          // const v = this.f.text(data[0].text);
          // this.svc.speak(this.f.text(data[0].text));
            if (data[0].hasOwnProperty('buttons')) {
            this.btnOptions = data[0].buttons;
            this.presentQuestion = data[0].text;
            this.loadingQuestion = data[0].text;
          } else {
            this.btnOptions = [];
          }
          }
        }
         if (e.value === '/socso_age_limit') {
          setTimeout(() => {
            this.msgArr.push({bot: 'Do you have more queries?', same: false});
            this.presentQuestion = 'Do you have more queries?';
            this.loadingQuestion = data[0].text;
            this.btnOptions = [{payload: '/ageLimitYes', title: 'Yes'},
            {payload: '/ageLimitNo', title: 'No'}];
          }, 6000);
        }
      });
    } else {
      if (e.value === '/ageLimitYes') {
        this.msgArr.push({bot: 'You can type your query. So that we can help you out', same: false});
        this.presentQuestion = '';
        this.loadingQuestion = '';
      } else {
        this.msgArr.push({bot: 'Thank you for contacting us!', same: false});
        this.presentQuestion = '';
        this.loadingQuestion = '';
      }
    }
  }

  taxRateSelected(e) {
    console.log(e.option.value);
    this.taxRateArray.forEach((obj) => {
      if (obj.title === e.option.value) {
        this.msgArr.push({user: e.option.value});
        this.appService.getBotData(obj.payload).subscribe((data) => {
          if (data.length !== 0) {
            if (data[0].text.indexOf('\n') > -1) {
              this.isBotArr = true;
              this.showSlider = false;
              const botArray = data[0].text.split('\n');
              // this.msgArr.push({bot: botArray});
              // console.log(this.msgArr);
              for (let i = 0; i < botArray.length; i++) {
                setTimeout(() => {
                    this.msgArr.push({bot: this.helperService.urlify(botArray[i]), same: false});
                }, 1000 * (i + 1));
              }
              if (data[0].hasOwnProperty('buttons')) {
                this.btnOptions = data[0].buttons;
                this.presentQuestion = botArray[botArray.length - 1];
                this.loadingQuestion = botArray[botArray.length - 1];
              } else {
                this.btnOptions = [];
              }
            } else {
              this.isBotArr = false;
              // this.msgArr.push({bot: this.urlify(data[0].text)});
            // const v = this.f.text(data[0].text);
            // this.svc.speak(this.f.text(data[0].text));
              if (data[0].hasOwnProperty('buttons')) {
                this.btnOptions = data[0].buttons;
                this.presentQuestion = data[0].text;
                this.loadingQuestion = data[0].text;
              } else {
                this.btnOptions = [];
              }
            }
            this.userQuery = '';
          }
          this.myControl.setValue('');
          console.log(this.myControl);
        });
      }
    });
  }

  onSliderChange() {
    console.log(this.sliderValue);
    this.appService.getEpsData(this.sliderValue).subscribe((data) => {
      console.log(data);
      this.msgArr.push({user: this.sliderValue});
      this.epsTableData = [];
      data.forEach(obj => {
        if (this.sliderValue <= 30) {
          if (obj.monthlyWages == 30) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 30 && this.sliderValue < 50) {
          if (obj.monthlyWages == 50) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 50 && this.sliderValue < 70) {
          if (obj.monthlyWages == 70) {
            this.epsTableData.push(obj);
            console.log(this.epsTableData);
          }
        }
        if (this.sliderValue > 70 && this.sliderValue < 100) {
          if (obj.monthlyWages == 100) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 100 && this.sliderValue < 140) {
          if (obj.monthlyWages == 140) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 140 && this.sliderValue < 200) {
          if (obj.monthlyWages == 200) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 200 && this.sliderValue < 300) {
          if (obj.monthlyWages == 300) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 300 && this.sliderValue < 400) {
          if (obj.monthlyWages == 400) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 400 && this.sliderValue < 500) {
          if (obj.monthlyWages == 500) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 500 && this.sliderValue < 600) {
          if (obj.monthlyWages == 600) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 600 && this.sliderValue < 700) {
          if (obj.monthlyWages == 700) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 700 && this.sliderValue < 800) {
          if (obj.monthlyWages == 800) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 800 && this.sliderValue < 900) {
          if (obj.monthlyWages == 900) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 900 && this.sliderValue < 1000) {
          if (obj.monthlyWages == 1000) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1000 && this.sliderValue < 1100) {
          if (obj.monthlyWages == 1100) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1100 && this.sliderValue < 1200) {
          if (obj.monthlyWages == 1200) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1200 && this.sliderValue < 1300) {
          if (obj.monthlyWages == 1300) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1300 && this.sliderValue < 1400) {
          if (obj.monthlyWages == 1400) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1400 && this.sliderValue < 1500) {
          if (obj.monthlyWages == 1500) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1500 && this.sliderValue < 1600) {
          if (obj.monthlyWages == 1600) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1600 && this.sliderValue < 1700) {
          if (obj.monthlyWages == 1700) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1700 && this.sliderValue < 1800) {
          if (obj.monthlyWages == 1800) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1800 && this.sliderValue < 1900) {
          if (obj.monthlyWages == 1900) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 1900 && this.sliderValue < 2000) {
          if (obj.monthlyWages == 2000) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2000 && this.sliderValue < 2100) {
          if (obj.monthlyWages == 2100) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2100 && this.sliderValue < 2200) {
          if (obj.monthlyWages == 2200) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2200 && this.sliderValue < 2300) {
          if (obj.monthlyWages == 2300) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2300 && this.sliderValue < 2400) {
          if (obj.monthlyWages == 2400) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2400 && this.sliderValue < 2500) {
          if (obj.monthlyWages == 2500) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2500 && this.sliderValue < 2600) {
          if (obj.monthlyWages == 2600) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2600 && this.sliderValue < 2700) {
          if (obj.monthlyWages == 2700) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2700 && this.sliderValue < 2800) {
          if (obj.monthlyWages == 2800) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2800 && this.sliderValue < 2900) {
          if (obj.monthlyWages == 2900) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 2900 && this.sliderValue < 3000) {
          if (obj.monthlyWages == 3000) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3000 && this.sliderValue < 3100) {
          if (obj.monthlyWages == 3100) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3100 && this.sliderValue < 3200) {
          if (obj.monthlyWages == 3200) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3200 && this.sliderValue < 3300) {
          if (obj.monthlyWages == 3300) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3300 && this.sliderValue < 3400) {
          if (obj.monthlyWages == 3400) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3400 && this.sliderValue < 3500) {
          if (obj.monthlyWages == 3500) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3500 && this.sliderValue < 3600) {
          if (obj.monthlyWages == 3600) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3600 && this.sliderValue < 3700) {
          if (obj.monthlyWages == 3700) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3700 && this.sliderValue < 3800) {
          if (obj.monthlyWages == 3800) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3800 && this.sliderValue < 3900) {
          if (obj.monthlyWages == 3900) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 3900 && this.sliderValue < 4000) {
          if (obj.monthlyWages == 4000) {
            this.epsTableData.push(obj);
          }
        }
        if (this.sliderValue > 4000) {
          if (obj.monthlyWages == 4100) {
            this.epsTableData.push(obj);
          }
        }
      });
      this.sliderValue = '';
      this.btnOptions = [];
      setTimeout(() => {
        this.msgArr.push({bot: 'EIS contribution rate for selected range', same: false});
        this.presentQuestion = 'EIS contribution rate for selected range';
        this.loadingQuestion = 'EIS contribution rate for selected range';
        console.log(this.epsTableData);
        this.dataSource = this.epsTableData;
      }, 3000);
    });
  }

  resetState() {
    this.msgArr = [];
    this.userQuery = '';
    this.btnOptions = [];
    this.msgArr.push({bot: 'What is your name?', same: false});
    this.presentQuestion = 'name';
  }
}
