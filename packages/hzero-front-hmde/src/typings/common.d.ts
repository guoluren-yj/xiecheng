import { RecordStatus } from '@/globalData/common';

declare global {
  namespace common {
    type ObjectAny<T = any> = Record<string, T>;
    type FnAny = (...args: any) => any;
    // 返回值:
    interface Message {
      failed: boolean;
      code: string;
      message: string;
      type: string;
      exception: string;
    }

    interface AuditDomain {
      creationDate: string;
      createdBy: number;
      lastUpdateDate: string;
      lastUpdatedBy: number;
      objectVersionNumber: number;
      tableId: string;
      _tls: { [key: string]: { [key: string]: string } };
      _token: string;
      _innerMap: { [key: string]: any };
      _status: RecordStatus;
      flex: { [key: string]: any };
    }

    interface MultiLanguage {
      code: string;
      name: string;
      value: string;
    }

    interface Page<E> {
      totalPages: number;
      totalElements: number;
      numberOfElements: number;
      size: number;
      number: number;
      content: E[];
    }

    interface Label extends AuditDomain {
      color: color;
      labelAssignId: string | number;
      labelCode: string;
      labelName: string;
      targetType?: string;
      targetValue?: string;
      tenantId?: string | number;
    }

    interface BusinessDomain {
      creationDate?: string;
      createdBy?: number;
      lastUpdateDate?: string;
      lastUpdatedBy?: number;
      objectVersionNumber: number;
      // tableId: string;
      // _tls: { [key: string]: { [key: string]: string } };
      _token: string;
      // _innerMap: { [key: string]: any };
      _status: RecordStatus;
      // flex: { [key: string]: any };
    }
  }
}

export {};
