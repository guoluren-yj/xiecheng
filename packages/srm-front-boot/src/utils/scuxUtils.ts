import request from 'utils/request';
import {
  getResponse,
} from 'utils/utils';
import { handlePreview } from '@/components/PrintProButton/util';
import { checkPrintWindow, getPdfPreviewUrl } from '../utils/utils';

export enum requestType {
  POST = 'POST',
  GET = 'GET',
}

export enum FileType {
  PDF = 'PDF',
  WORD = 'WORD',
  EXCEL = 'EXCEL',
  ZIP = 'ZIP',
}

const flag = checkPrintWindow(); // 校验浏览器能否支持通过 window.open 打开 blob:// 地址的窗口

// 文件类型
const outFile = new Map([
  ['PDF', 'application/pdf'],
  ['WORD', 'application/msword'],
  ['EXCEL', 'application/vnd.ms-excel'], // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet   这个为xlsx后缀的excel
  ['ZIP', 'application/zip'],
]);

// 文件后缀
const fileSuffix = new Map([
  ['PDF', '.pdf'],
  ['WORD', '.word'],
  ['EXCEL', '.xlsx'],
  ['ZIP', '.zip'],
]);

// 二开打印下载文件
/**
 * @param {printProps} props 入参是一个类型为printProps的对象，有以下参数
 * @param url 请求地址
 * @param method 请求方式
 * @param params url传参
 * @param data  body传参
 * @param outType 输出文件类型
 * @param fileName 文件名
 */
export const scuxPrint = (props: {
  url: string; // 请求地址
  method?: requestType | 'POST' | 'GET'; // 请求方式, 兼容之前部分之间传POST或者GET的项目
  params?: any; // url传参
  data?: any; // body传参
  outType?: FileType; // 输出文件类型
  fileName?: string; // 文件名, 如果设置了，会直接下载文件
}) => {
  const { url, method = requestType.POST, params, data, outType = FileType.PDF, fileName } = props;
  let printParams = params;
  if (typeof params === 'function') {
    printParams = params();
  }
  let bodyData = data;
  if (typeof data === 'function') {
    bodyData = data();
  }
  const contentType = outFile.get(outType); // 获取文件流类型

  return new Promise((resolve) => {
    request(url, {
      method,
      query: printParams,
      body: bodyData,
      responseType: flag ? 'blob' : 'json', // flag为true为支持blob窗口打开
      headers: flag ? {} : { 's-print-using-preview': '1' },
    }).then(async res => {
      if (flag) {
        if (res && res instanceof Blob) {
          try {
            const textRes = await res.text();
            const errFaield = JSON.parse(textRes);
            getResponse(errFaield);
          } catch (err) {
            const fileBlob = new Blob([res], { type: contentType });
            const suffix = fileSuffix.get(outType);
            const resName = 'preview';
            const downFileName = fileName ? fileName + suffix : resName + suffix;
            if (typeof (window.navigator as any).msSaveBlob !== 'undefined') {
              // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
              (window.navigator as any).msSaveBlob(fileBlob, decodeURI(downFileName));
            } else {
              const URL = window.URL || window.webkitURL;
              const fileURL = URL.createObjectURL(fileBlob);
              // 创建a链接下载或者预览文件
              const a = document.createElement('a');
              a.setAttribute('target', '_blank');
              a.href = fileURL;
              if (fileName) {
                a.download = fileName || '';
              }
              a.click();
            }
          }
        }
      } else if (getResponse(res)) {
        const { fileUrl, bucketName, fileToken } = res;
        getPdfPreviewUrl({ fileUrl, bucketName, fileToken }).then(preUrl => {
          window.open(preUrl);
        });
      }
      resolve({});
    });
  });
};

// 二开新打印
/**
 * @param url 标准获取token地址
 * @param method 请求方式
 * @param params url传参
 * @param data  body传参
 * @param outType 输出文件类型
 */
export const newScuxPrint = (props: {
  url: string;
  outType?: FileType;
  method?: requestType
  params?: any; // url传参
  data?: any; // body传参
}) => {
  const { url, method = requestType.POST, params, data, outType = FileType.PDF } = props;
  let printParams = params;
  if (typeof params === 'function') {
    printParams = params();
  }
  let bodyData = data;
  if (typeof data === 'function') {
    bodyData = data();
  }
  return new Promise(async(resolve) => {
    const res = await request(url, {
      method,
      query: printParams,
      body: bodyData,
    });
    const previewParams = {
      flag,
      outType,
      token: res,
    };
    if(getResponse(res)){
      handlePreview(previewParams);
    }
    resolve({});
  });
};