import type { FC, ReactNode, RefObject } from 'react';
import React, { useMemo, useState, useCallback, useImperativeHandle, useEffect } from 'react';
import { isArray, debounce } from 'lodash';
import { observer } from "mobx-react-lite";

import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import intl from 'hzero-front/lib/utils/intl';
import request from 'hzero-front/lib/utils/request';
import notification from 'hzero-front/lib/utils/notification';
import { HZERO_RPT } from 'hzero-front/lib/utils/config';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
// @ts-ignore
import { queryTimeZoneList } from 'hzero-front/lib/services/api/language';
import { getResponse, getCurrentOrganizationId, getCurrentLanguage, getAccessToken, getCurrentUser } from 'hzero-front/lib/utils/utils';
import { DataSet, Form, Modal, Select } from 'choerodon-ui/pro';

import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { checkPrintWindow } from '../../utils/utils';
import { handlePreview } from './util';
import Preview from './Preview';


interface IPrintProButtonProps {
  method?: 'GET' | 'POST'; // API 请求方式
  requestUrl: string; // API 请求地址
  params?: any; // url 传参
  data?: any; // body 传参
  requestProps?: { [key: string]: string }; // API 额外属性配置
  buttonProps?: { [key: string]: string }; // 按钮额外属性配置
  buttonText?: string | ReactNode // 按钮显示文本
  outType?: 'PDF' | 'EXCEL'; // 输出文件类型
  successCallBack?: () => void; // 打印成功回调
  errorCallBack?: () => void; // 打印失败回调
  printRef?: RefObject<{ handlePrint: Function; }>
  loading?: boolean;
  inMenuItem?: boolean;
  beforePrint?: () => boolean | Promise<boolean>;
  beforeDownloadExcel?: (fileUrl: string) => boolean | Promise<boolean>;
}

const PrintProButton: FC<IPrintProButtonProps> = ({
  method = 'GET',
  requestUrl,
  params,
  data,
  buttonText,
  requestProps = {},
  buttonProps = {},
  outType = 'PDF',
  successCallBack,
  errorCallBack,
  printRef,
  loading: propsLoading,
  inMenuItem,
  beforePrint,
  beforeDownloadExcel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const flag: boolean = useMemo(() => checkPrintWindow(), []);
  const isFireFox = useMemo(() => {
    const ua = window.navigator && window.navigator.userAgent;
    return ua && /rv:([^)]+)\) Gecko\/\d{8}/i.test(ua) && /Firefox\/(\S+)/.test(ua);
  }, []);
  const handlePrint = useCallback(() => {
    setLoading(true);
    let dataSet;
    Promise.resolve(beforePrint ? beforePrint() : true).then(res => {
      if (!res) {
        setLoading(false);
        return;
      }
      const user = getCurrentUser();
      if (user.printOutputConfigFlag) {
        const { global, user } = (window as any).dvaApp._store.getState();
        const { languageList, language } = global || {};
        dataSet = new DataSet({
          autoCreate: true,
          fields: [
            {
              name: "lang",
              label: intl.get("srm.common.printOutConfig.tplLang").d("模板语言"),
              options: new DataSet({
                data: (languageList || []).map(i => ({ value: i.code, meaning: i.description })),
              }),
              defaultValue: language,
              required: true,
            },
            {
              name: "timeZone",
              label: intl.get("srm.common.printOutConfig.tplTimeZone").d("模板时区"),
              required: true,
            },
          ],
        });
        const ModalChildren = formatterCollections({ code: ['srm.common'] })(observer<any>(function PrintOutConfig(props) {
          const [timeZoneList, setTimeZoneList] = useState<any>([]);
          useEffect(() => {
            const { timeZone, dayLightFlag } = user.currentUser || {};
            queryTimeZoneList(dayLightFlag).then(res => {
              if (getResponse(res) && res) {
                if (dayLightFlag && res.content && res.content.length) {
                  setTimeZoneList(res.content);
                } else if (!dayLightFlag && res.length) {
                  setTimeZoneList(
                    res.map(i => ({
                      zoneId: i.value,
                      zoneName: `(${i.value})${i.meaning}`,
                    }))
                  );
                }
              }
            });
            props.dataSet.current.set("timeZone", timeZone);
          }, []);
          return (
            <Form dataSet={props.dataSet} labelLayout={LabelLayout.float}>
              <Select name="lang" />
              <Select name="timeZone">
                {timeZoneList.map(tz => (
                  <Select.Option value={tz.zoneId}>{tz.zoneName}</Select.Option>
                ))}
              </Select>
            </Form>
          );
        }));
        let promiseResolve;
        const promise = new Promise((res) => { promiseResolve = res; });
        const handleOk = debounce(async() => {
          if (await dataSet.validate()) {
            promiseResolve(true);
            return true;
          }
          return false;
        }, 300);
        Modal.open({
          title: intl.get("srm.common.printOutConfig.title").d("打印输出配置"),
          drawer: true,
          style: { width: "380px" },
          children: (
            <ModalChildren dataSet={dataSet} />
          ),
          onOk: handleOk,
          onCancel: () => {
            setLoading(false);
            promiseResolve(false);
          },
        });
        return promise;
      }
      return true;
    }).then(res => {
      if (!res || !!getResponse(res) && res !== true) {
        setLoading(false);
        return;
      }
      let queryParams = params;
      if (typeof params === 'function') {
        queryParams = params();
      }
      let bodyData = data;
      if (typeof data === 'function') {
        bodyData = data();
      }

      let tzParams = {} as any;
      if (dataSet) {
        tzParams = dataSet.current.toJSONData();
      }
      request(requestUrl, {
        method,
        query: queryParams,
        body: bodyData,
        ...requestProps,
      }).then((res1) => {
        if (getResponse(res1)) {
          const param = { outType, token: res1, flag, successCallback: successCallBack, errorCallback: errorCallBack, loadingCallback: setLoading, tzParams, beforeDownloadExcel, isFireFox };
          if (!res1 || isArray(res1) && !res1.length) {
            notification.error({ message: intl.get("srm.common.printError.paramLack").d("打印参数缺失或无效，请联系对应功能模块处理") });
            setLoading(false);
            return;
          }
          if (isArray(res1) && res1.length) {
            const errorToken = res1.find(i => i && i.failed);
            if (errorToken) {
              setLoading(false);
              getResponse(errorToken);
              return;
            }
          }
          // outType是EXCEL时或者是飞书和钉钉走原来的逻辑
          if (!flag || outType === "EXCEL") {
            handlePreview(param);
            return;
          }
          request(`${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print/batch-selectable-reports`, {
            method: "POST",
            body: isArray(res1) ? res1 : [res1],
          }).then(res => {
            if (res && getResponse(res)) {
              if (res.selectReportsFlag) {
                if (!res.selectableReports || !res.selectableReports.length) {
                  notification.warning({ message: intl.get("hzero.common.print.noEffctiveTpl").d('无可用打印模版') });
                  return;
                }
                if (successCallBack) successCallBack();
                Modal.open({
                  title: intl.get('hzero.common.button.print').d('打印'),
                  drawer: true,
                  resizable: true,
                  closable: true,
                  footer: null,
                  style: {
                    width: "calc(100vw - 220px)",
                    minWidth: "calc((100vw - 220px)/2)",
                  },
                  bodyStyle: {
                    padding: 0,
                  },
                  children: (
                    <Preview
                      token={res1}
                      flag={flag}
                      outType={outType}
                      lang={tzParams.lang}
                      timeZone={tzParams.timeZone}
                      selectableReports={res.selectableReports}
                      isFireFox={isFireFox}
                    />
                  ),
                });
                setLoading(false);
              } else {
                handlePreview(param);
              }
            }
          }).catch(() => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    });
  }, [beforePrint, requestUrl, method, params, data, requestProps, beforeDownloadExcel, isFireFox]);

  useImperativeHandle(printRef, () => ({ handlePrint }), [handlePrint]);
  return (
    <ButtonPermission
      type="c7n-pro"
      icon={inMenuItem ? undefined : "print"}
      {...buttonProps}
      loading={loading || propsLoading}
      onClick={handlePrint}
    >
      {buttonText || intl.get('hzero.common.button.print').d('打印')}
    </ButtonPermission>
  );
};

export default PrintProButton;