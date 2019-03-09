import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IHistory } from 'app/shared/model/history.model';

type EntityResponseType = HttpResponse<IHistory>;
type EntityArrayResponseType = HttpResponse<IHistory[]>;

@Injectable({ providedIn: 'root' })
export class HistoryService {
    public resourceUrl = SERVER_API_URL + 'api/histories';

    constructor(private http: HttpClient) {}

    create(history: IHistory): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(history);
        return this.http
            .post<IHistory>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    update(history: IHistory): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(history);
        return this.http
            .put<IHistory>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<IHistory>(`${this.resourceUrl}/${id}`, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IHistory[]>(this.resourceUrl, { params: options, observe: 'response' })
            .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    protected convertDateFromClient(history: IHistory): IHistory {
        const copy: IHistory = Object.assign({}, history, {
            date: history.date != null && history.date.isValid() ? history.date.toJSON() : null
        });
        return copy;
    }

    protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
        if (res.body) {
            res.body.date = res.body.date != null ? moment(res.body.date) : null;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        if (res.body) {
            res.body.forEach((history: IHistory) => {
                history.date = history.date != null ? moment(history.date) : null;
            });
        }
        return res;
    }
}
