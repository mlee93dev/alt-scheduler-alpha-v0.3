import { SchoolPlan } from './../../shared/schoolplan.model';
import { DataStorageService } from './../../shared/data-storage.service';
import { EditGuard } from './../../auth/edit-guard.service';
import { SchoolService } from './../../shared/school.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { FormControl, NgForm } from '@angular/forms';
import { TimeService } from '../../shared/time.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-schooldetail',
  templateUrl: './schooldetail.component.html',
  styleUrls: ['./schooldetail.component.css']
})
export class SchooldetailComponent implements OnInit, OnDestroy {
  @ViewChild('f') planForm: NgForm;
  theDate = new Date();
  months = ['1月', '2月', '3月', '4月', '5月', '6月',
   '7月', '8月', '9月', '10月', '11月', '12月'];
  currentMonth = this.theDate.getMonth();
  currentYear = this.theDate.getFullYear();
  id: number;
  schoolPlansList = [];
  timeSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              public schoolService: SchoolService,
              public timeService: TimeService,
              public dataStorageService: DataStorageService,
              public editGuard: EditGuard,
              public authService: AuthService) { }

  ngOnInit() {
    const clickedYear = this.timeService.altClickedYear;
    const clickedMonth = this.timeService.altClickedMonth - 1;
    if (clickedYear && clickedMonth){
      this.currentYear = clickedYear;
      this.currentMonth = clickedMonth;
    }

    this.route.params.subscribe(
      (params: Params) => {
        this.id = params['id'];
        this.schoolPlansList = this.schoolService.getSchoolPlansUsingID(this.id, this.currentYear, this.currentMonth+1);
        if (!this.schoolService.getSchoolPlansCopy()){
          throw new Error;
        }
        let sortedPlans = this.schoolService.sortPlansByDate(this.schoolPlansList);
        this.schoolPlansList = sortedPlans;
      }
    )

    this.timeSubscription = this.timeService.dateChanged
      .subscribe(
        (yearMonth: {year: number, month: number}) => {
          this.currentMonth = yearMonth.month;
          this.currentYear = yearMonth.year;
          this.schoolPlansList = this.schoolService.getSchoolPlansUsingID(this.id, this.currentYear, this.currentMonth+1);        
          let sortedPlans = this.schoolService.sortPlansByDate(this.schoolPlansList);
          this.schoolPlansList = sortedPlans;
        }
      )
  }

  ngOnDestroy(){
    if (this.timeSubscription){
      this.timeSubscription.unsubscribe();
    }
  }

  nextMonth(){
    this.timeService.getNextMonth(this.currentYear, this.currentMonth);
  }

  prevMonth(){
    this.timeService.getPrevMonth(this.currentYear, this.currentMonth);
  }

  onAdd(){
    this.timeService.selectedYear = this.currentYear;
    this.timeService.selectedMonth = this.currentMonth;
    this.editGuard.canEdit = true;
  }

  onEdit(date: number){
    this.timeService.selectedYear = this.currentYear;
    this.timeService.selectedMonth = this.currentMonth+1;
    this.timeService.selectedDate = date;
    this.editGuard.canEdit = true;
  }

  saveNotes(schoolPlan: SchoolPlan, index: number){
    const token = this.authService.token;
    const newSchoolPlan = schoolPlan;
    newSchoolPlan.altnotes = Object.values(this.planForm.value)[index];
    this.dataStorageService.editSchoolPlan(schoolPlan.key, token, newSchoolPlan)
      .subscribe(
        (response) => console.log(response),
        (error) => {throw error},
        () => alert('Notes saved.')
      )
  }
}
