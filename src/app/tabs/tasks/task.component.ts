import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  AllTasksLimitQuery,
  Exact,
  PaginatedTasksQuery,
  PaginatedTasksQueryVariables,
} from '../../../graphql/generated/graphql';
import { TaskService } from '../../services/task/task.service';
import { QueryRef } from 'apollo-angular';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskPage implements OnInit, OnDestroy {
  private tasksLoading: boolean = false;
  public tasks: AllTasksLimitQuery['allTasksLimit'] = [];
  private subscriptions: Array<Subscription> = [];
  public limit: number = 10;
  public offset: number = 0;
  private queryRef: QueryRef<
    PaginatedTasksQuery,
    Exact<{
      limit: number;
      offset: number;
      field: string;
      ascending: boolean;
    }>
  >;

  pageableOptions: PaginatedTasksQueryVariables;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.pageableOptions = {
      limit: 20,
      offset: 0,
      field: 'createdDate',
      ascending: false,
    };
    this.queryRef = this.taskService.getPaginatedTasks(this.pageableOptions);
    this.subscriptions.push(
      this.queryRef.valueChanges.subscribe((x) => {
        this.tasksLoading = x.loading;
        this.tasks = x?.data?.paginatedTasks.items;
      })
    );
  }

  getMoreTasks() {
    return this.queryRef.fetchMore({
      variables: {
        offset: this.tasks.length,
        limit: this.limit,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }
        Object.assign({}, previousResult, {
          feed: [
            ...previousResult?.paginatedTasks.items,
            ...fetchMoreResult?.paginatedTasks.items,
          ],
        });
      },
    });
  }

  loadDataInfinite(event) {
    this.getMoreTasks().then((x) => {
      let data = x?.data?.paginatedTasks.items;
      this.tasks = this.tasks.concat(data);
      event.target.complete();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
