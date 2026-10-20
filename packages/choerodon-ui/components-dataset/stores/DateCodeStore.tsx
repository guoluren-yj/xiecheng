
import axios, { AxiosInstance } from 'axios';
import { isArrayLike } from 'mobx';
import moment from 'moment';
import { DateConfig, DateCode } from '../configure';
import { getGlobalConfig, processAxiosConfig } from './utils';

const defaultYear: string = moment().format("YYYY");

export interface DateStoreProps extends DateConfig {
  status?: 'success' | 'error' | undefined,
  date?: string[] | undefined,
}

export class DateCodeStore {

  getAxios(): AxiosInstance {
    return getGlobalConfig('axios') || axios;
  }

  getDateCode(dateCode: DateCode, year: string = defaultYear): DateCode {
    if (dateCode) {
      return `${dateCode}.${year}.date`;
    }
    return undefined;
  }

  fetchDate(dateCode: DateCode, year: string = defaultYear): DateStoreProps | undefined {
    if (dateCode) {
      const code = this.getDateCode(dateCode, year);
      if (code) {
        const session = sessionStorage.getItem(code);
        if (session) {
          return JSON.parse(session);
        }
      }
    }
    return undefined;
  }

  fetchDateConfig(
    dateCode: DateCode,
    year: string = defaultYear,
  ): Promise<any> {
    if (dateCode) {
      const sessionData = this.fetchDate(dateCode, year);
      if (sessionData) {
        return Promise.resolve(sessionData);
      }
      const axiosConfig = getGlobalConfig('dateAxiosConfig');
      if (axiosConfig) {
        const config = processAxiosConfig(axiosConfig, dateCode, year);
        if (config.url){
          return this.getAxios()(config).then((response) => {
            const result = {
              dateCode,
              year,
              date: isArrayLike(response) ? response : [],
              status: isArrayLike(response) ? 'success' : 'error',
            };
            const sessionCode = this.getDateCode(dateCode, year);
            if (sessionCode) {
              sessionStorage.setItem(sessionCode, JSON.stringify(result));
            }
            return result;
          });
        }
      }
    }
    return Promise.resolve(undefined);
  }
}

export default new DateCodeStore();