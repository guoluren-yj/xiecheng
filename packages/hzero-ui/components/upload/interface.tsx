import type {
  UploadProps,
  HttpRequestHeader,
  ShowUploadListInterface,
  UploadChangeParam,
  UploadFile,
  UploadFileStatus,
  UploadListProps,
  UploadListIconFunc,
  UploadLocale,
  UploadState,
  UploadType,
  UploadListType,
} from 'choerodon-ui/lib/upload/interface';

export type {
  UploadProps,
  HttpRequestHeader,
  ShowUploadListInterface,
  UploadChangeParam,
  UploadFile,
  UploadFileStatus,
  UploadListProps,
  UploadListIconFunc,
  UploadLocale,
  UploadState,
  UploadType,
  UploadListType,
}

export interface RcFile extends File {
  uid: number;
}
