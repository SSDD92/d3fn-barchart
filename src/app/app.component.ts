import { Component, OnInit } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators'
import { ImpressionStatistic } from './services/impression-statistic';
import { StatisticHourDelimiterService } from './services/statistic-hour-delimiter.service';
import { StatisticDayDelimiterService } from './services/statistic-day-delimiter.service';
import { ItemData } from './statistic-chart/shared/bar-chart/core/interfaces/item-data';
import {
  format, parse,
  startOfToday, endOfToday,
  differenceInHours,
  addHours, subHours,
  subDays, addDays,
  endOfDay, startOfDay
} from 'date-fns'

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private pagginableData$: BehaviorSubject<ItemData[]>
  private showChartData$: Observable<ItemData[]>

  constructor(
    private statistic: StatisticDayDelimiterService
  ) {
    this.pagginableData$ = new BehaviorSubject<ItemData[]>([]);
    this.showChartData$ = this.pagginableData$.pipe(
      filter(list => Boolean(list.length)),
    );
  }

  ngOnInit() {
    this.loadFirstPeriod();

    // TODO:
    // - make depend of Delimiter
    // - can next/prev getter
  }

  public loadMore(): void {
    if (!this.canLoadMore()) {
      return;
    }

    this.loadPrevPeriod();
  }

  private canLoadMore(): boolean {
    return true;
  }

  private loadFirstPeriod(): void {
    const [from, to] = this.getLastCampaignDateRange();
    const list: ItemData[] = this.statistic.loadStaticticByDates(from, to);
    const mergedList: ItemData[] = this.mergeStatiscticWithChunk(list);
    this.pagginableData$.next(mergedList);
  }

  private loadPrevPeriod(): void {
    const date: Date = this.pagginableData$.value[0].identity;
    const [from, to] = [subHours(date, 24), subHours(date, 1)];
    const list: ItemData[] = this.statistic.loadStaticticByDates(from, to);
    this.pagginableData$.next(this.mergeStatiscticWithChunk(list))
  }

  /**
   * Must fetch dates from campaign and 
   * - get or current range of camapign (if it's in progress)
   * - or get last DelimiterRangeData
   * 
   * !!!! depend of current time Delimiter and WEB/MOBILE platform
   */
  private getLastCampaignDateRange(): [Date, Date] {
    return this.statistic.getFirstChunkDateRange();
  }

  private mergeStatiscticWithChunk(chunk: ItemData[]): ItemData[] {
    return [
      ...chunk,
      ...this.pagginableData$.value,
    ]
  }
}
