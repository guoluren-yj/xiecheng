import React, { Fragment, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Form, DataSet, Output, Table, Spin, Icon, Attachment } from 'choerodon-ui/pro';
import { isEmpty, noop, isArray } from 'lodash';
import moment from 'moment';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import C7NUpload from '_components/C7NUpload';
import {
  getResponse,
  getCurrentOrganizationId,
  getDateTimeFormat,
  getDateFormat,
} from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import {
  fetchHeader,
  exportQuotationDetail,
  fetchQuotationDetailHeader,
} from '@/services/quotationDetailNewService';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

import { getExportFileName } from '@/routes/components/QuotationDetailCurrent/utils.js';
import Anchor from '../Anchor';
import { formDS, tableDS, itemFormDS } from './storeDS';
import style from '../index.less';

function Content(props) {
  const {
    rowData = {},
    sourceFrom,
    tenantId,
    allowSupplierViewFlag,
    sourceHeaderId,
    allowBuyerViewFlag,
    rowKeyId,
    uiType,
    sourceResultId,
    quotationHistoryFlag = 0,
    customizeForm = noop,
    bidFlag = false,
    remote,
  } = props || {};
  const tableDsRef = useRef({});
  const headerRef = useRef({});
  const organizationId = getCurrentOrganizationId();

  const [dynamicColumns, setDynamicColumns] = useState({});
  const [queryLoading, setQueryLoading] = useState(false);

  const formDs = useMemo(() => new DataSet(formDS()), []);

  const itemFormDs = useMemo(() => new DataSet(itemFormDS()), []);

  const {
    rfxLineItemId,
    bidLineItemId,
    itemId,
    itemCategoryId,
    rfxHeaderId,
    bidHeaderId,
    quotationHeaderId,
    quotationLineId,
    projectLineItemId,
    sourceProjectId,
    quotationTemplateId,
    recordId,
  } = useMemo(() => {
    return uiType === 'hzero' ? rowData : rowData?.toData();
  }, [uiType, rowData]);

  useEffect(() => {
    init();
    fetchItemInfo();
  }, [fetchItemInfo]);

  // 获取个性化
  const getCustomizeUnitCode = useCallback(
    (type = null) => {
      if (!type || isEmpty(type)) {
        return null;
      }

      const RfxCodeMap = new Map([
        ['baseItemForm', 'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT.SUPPLIER_QUERY_BASE_FORM'], // 物料信息
        ['baseInfoForm', 'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT.SUPPLIER_QUERY_BASE_INFO_FORM'], // 基础信息
      ]);

      const BidCodeMap = new Map([
        ['baseItemForm', 'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT_NEW_BID.SUPPLIER_QUERY_BASE_FORM'], // 物料信息
        [
          'baseInfoForm',
          'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT_NEW_BID.SUPPLIER_QUERY_BASE_INFO_FORM',
        ], // 基础信息
      ]);

      const CodeDataMap = !bidFlag ? RfxCodeMap : BidCodeMap;
      let currentUnitCode = null;

      if (typeof type === 'string') {
        currentUnitCode = CodeDataMap.get(type);
      }

      if (isArray(type)) {
        const codeSet = new Set();
        type.forEach((unitCode) => {
          codeSet.add(CodeDataMap.get(unitCode));
        });

        currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
      }

      return currentUnitCode;
    },
    [bidFlag]
  );

  const currentFetchApi = useCallback(
    (params = {}) => {
      if (quotationHistoryFlag) {
        return fetchQuotationDetailHeader(params); // 报价历史页面需要更换api
      } else {
        return fetchHeader(params);
      }
    },
    [quotationHistoryFlag]
  );

  const fetchItemInfo = useCallback(() => {
    if (!rfxLineItemId) {
      return;
    }

    itemFormDs.setQueryParameter('commonProps', {
      quotationHeaderId,
      quotationLineId,
      organizationId,
      customizeUnitCode: getCustomizeUnitCode('baseItemForm'),
    });

    itemFormDs.query();
  }, [quotationHeaderId, quotationLineId, organizationId]);

  const init = () => {
    const params = {
      sourceResultId,
      sourceFrom,
      itemId,
      tenantId,
      organizationId,
      itemCategoryId,
      quotationLineId,
      quotationHeaderId,
      quotationTemplateId,
      rfxHeaderId: rfxHeaderId || bidHeaderId || sourceHeaderId || sourceProjectId,
      rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
      recordId,
      customizeUnitCode: getCustomizeUnitCode('baseInfoForm'),
    };
    setQueryLoading(true);
    currentFetchApi(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          const { supQuotationDetailPage = {}, moduleList = [] } = result;
          // 缓存头数据
          headerRef.current = result;
          formDs.loadData([result]);
          // 分模块
          if (result.moduleRule === 'SUB_MODULE') {
            let columns = {};
            // 缓存ds
            moduleList.forEach((i) => {
              const tableDsConfig = tableDS({ rowKeyId, queryParams: params, handleDataSource });

              const moduleCurrentTableDS = new DataSet(
                remote
                  ? remote.process(
                      'SSRC_QUOTATION_DETAIL_CURRENT_VIEW_PROCESS_TABLE_DS',
                      tableDsConfig,
                      {
                        module: i,
                        formDs,
                        bidFlag,
                        params,
                        handleDataSource,
                        result,
                        pageProps: props,
                      }
                    )
                  : tableDsConfig
              );

              tableDsRef.current = {
                ...tableDsRef.current,
                [i.templateId]: moduleCurrentTableDS,
              };
              columns = { ...columns, [i.templateId]: handleDynamicColumns(i) };
              // eslint-disable-next-line no-unused-expressions
              tableDsRef.current?.[i.templateId]?.loadData(
                handleDataSource(i?.supQuotationDetailPage?.content),
                i?.supQuotationDetailPage?.totalElements
              );
              // 查询
              tableDsRef.current[i.templateId].setQueryParameter('templateId', i.templateId);
            });
            // 设置动态列
            setDynamicColumns(columns);
          } else if (result.moduleRule === 'NO_DISTINCTION') {
            const tableDsConfig = tableDS({ rowKeyId, queryParams: params, handleDataSource });

            const moduleCurrentTableDS = new DataSet(
              remote
                ? remote.process(
                    'SSRC_QUOTATION_DETAIL_CURRENT_VIEW_PROCESS_TABLE_DS',
                    tableDsConfig,
                    {
                      formDs,
                      bidFlag,
                      params,
                      handleDataSource,
                      result,
                      pageProps: props,
                    }
                  )
                : tableDsConfig
            );
            // 不区分模块
            tableDsRef.current = {
              [result.templateId]: moduleCurrentTableDS,
            };
            // 设置动态列
            setDynamicColumns({ [result.templateId]: handleDynamicColumns(result) });
            // eslint-disable-next-line no-unused-expressions
            tableDsRef.current?.[result.templateId]?.loadData(
              handleDataSource(supQuotationDetailPage.content),
              supQuotationDetailPage.totalElements
            );
            tableDsRef.current[result.templateId].setQueryParameter(
              'templateId',
              result.templateId
            );
          }
        }
      })
      .finally(() => setQueryLoading(false));
  };

  // 处理数据
  const handleDataSource = (source = []) => {
    if (isEmpty(source)) return [];
    const restructureSource = source.map((item) => {
      let elementValue = {};
      const { quotationColumns = [], ...otherItem } = item;
      // eslint-disable-next-line no-unused-expressions
      quotationColumns?.forEach((newItem) => {
        elementValue = {
          ...elementValue,
          [newItem.columnCode]: renderColumnValue(item, newItem),
        };
      });
      return {
        ...otherItem,
        ...elementValue,
        quotationColumns,
        expand: false, // 控制树形是否默认展开
      };
    });
    return restructureSource;
  };

  /**
   * 渲染单元格值
   */
  const renderColumnValue = (item = {}, elementItem = {}) => {
    let value = elementItem.supQuotationColumnValue;
    const meaningFlag =
      elementItem.componentType === 'Lov' || elementItem.componentType === 'ValueList';
    if (item.quotationDetailType === 'NO') {
      value = elementItem.disabled
        ? elementItem.columnDefaultValue
        : item.supQuotationDetailId
        ? meaningFlag
          ? elementItem.supQuotationColumnValueMeaning
          : elementItem.supQuotationColumnValue
        : meaningFlag
        ? elementItem.supColumnDefaultValueMeaning
        : elementItem.supColumnDefaultValue;
      value = item.supQuotationDetailId
        ? meaningFlag
          ? elementItem.supQuotationColumnValueMeaning
          : elementItem.supQuotationColumnValue
        : meaningFlag
        ? elementItem.supColumnDefaultValueMeaning
        : elementItem.supColumnDefaultValue;
    }
    return value;
  };

  // 设置动态列
  const handleDynamicColumns = (data = {}) => {
    const { quotationColumns = [] } = data || {};
    const columns = [];
    quotationColumns.forEach((item) => {
      const flag = allowSupplierViewFlag
        ? item.visible === 1 || item.visible === 0
        : item.visible === 2 || item.visible === 1;
      // visible过滤
      if (flag) {
        // eslint-disable-next-line no-unused-expressions
        tableDsRef.current?.[data.templateId].addField(item.columnCode, {
          name: item.columnCode,
          label: item.columnName,
          ...renderFieldType(item, { module: data }),
        });
        columns.push({
          name: item.columnCode,
          width: 150,
          renderer: ({ record }) => renderDisplay(item, record),
        });
      }
    });
    return columns;
  };

  // 渲染类型
  const renderFieldType = (field = {}, options = {}) => {
    const { module } = options || {};
    let fieldConfig = {};

    switch (field.componentType) {
      case 'Input':
      case 'TextArea':
      case 'Upload':
      case 'Lov':
      case 'ValueList':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'InputNumber':
        fieldConfig = {
          type: 'number',
        };
        break;
      case 'DateTimePicker':
        fieldConfig = {
          type: 'dateTime',
          format: getDateTimeFormat(),
        };
        break;
      case 'DatePicker':
        fieldConfig = {
          type: 'date',
          format: getDateFormat(),
        };
        break;
      case 'Switch':
      case 'Checkbox':
        fieldConfig = {
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          transformResponse: (val) => Number(val),
        };
        break;
      default:
        fieldConfig = {
          type: 'string',
        };
        break;
    }

    const fieldConfigObject = remote
      ? remote.process(
          'SSRC_QUOTATION_DETAIL_CURRENT_VIEW_PROCESS_FIELD_TYPE_CONFIG',
          fieldConfig,
          {
            field,
            pageProps: props,
            module,
            headerRef,
          }
        )
      : fieldConfig;

    return fieldConfigObject;
  };

  // 处理显示单元格
  const renderDisplay = (field, record) => {
    const { componentType, columnCode } = field;
    const displayValue = record.get(`${columnCode}`);
    let display;
    switch (componentType) {
      case 'Switch':
      case 'Checkbox':
        display = yesOrNoRender(Number(displayValue));
        break;
      case 'DatePicker':
        display = displayValue && moment(displayValue).format(DEFAULT_DATE_FORMAT);
        break;
      case 'DateTimePicker':
        display = displayValue && moment(displayValue).format(DEFAULT_DATETIME_FORMAT);
        break;
      case 'Upload':
        display = (
          <C7NUpload
            filePreview
            fileSize={FIlESIZE}
            tenantId={organizationId}
            name={columnCode}
            record={record}
            viewOnly
            bucketName={
              field?.quotationColumnCmpts?.find?.((e) => e.attributeName === 'bucketName')
                ?.attributeValue
            }
            bucketDirectory={
              field?.quotationColumnCmpts?.find?.((e) => e.attributeName === 'bucketDirectory')
                ?.attributeValue
            }
            {...ChunkUploadProps}
          />
        );
        break;
      default:
        display = displayValue;
        break;
    }
    return display;
  };

  const getColumns = useCallback(
    (templateId, item) => {
      const preColumns = [
        {
          name: 'configCode',
          width: 150,
          title: (
            <div className={style['quotation-detail-header-config-code']}>
              {intl.get(`ssrc.common.model.common.configCode`).d('报价明细项编码')}
            </div>
          ),
        },
        {
          name: 'configName',
          width: 130,
        },
        ...(dynamicColumns?.[templateId] || []),
      ];

      const columns = remote
        ? remote.process('SSRC_QUOTATION_DETAIL_CURRENT_VIEW_PROCESS_TABLE_COLUMNS', preColumns, {
            rowData,
            uiType,
            formDs,
            bidFlag,
            pageProps: props,
            tableDsRef,
            item,
          })
        : preColumns;
      return columns;
    },
    [dynamicColumns, rowData, uiType, formDs, bidFlag, tableDsRef, remote, props]
  );

  const throttle = () => {
    let timer = null;
    return (e) => {
      if (!timer) {
        handleExport();
        timer = setTimeout(() => {
          timer = null;
        }, 5000);
      } else {
        e.stopPropagation();
      }
    };
  };

  const handleExport = () => {
    exportQuotationDetail({
      sourceHeaderId: rfxHeaderId || bidHeaderId || sourceHeaderId || sourceProjectId,
      rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
      sourceFrom,
      quotationHeaderId,
      recordId: quotationHistoryFlag ? recordId : undefined,
      organizationId,
    }).then((response) => {
      try {
        if (!response) {
          return;
        }

        const blobUrl = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        const fileName = getExportFileName({ baseDS: formDs });
        a.download = decodeURIComponent(`${fileName}.xlsx`);
        a.href = blobUrl;
        a.click();
      } catch (err) {
        throw err;
      }
    });
  };

  let exportDetailNode = null;
  if (
    (headerRef.current?.moduleRule === 'SUB_MODULE' && !isEmpty(headerRef.current?.moduleList)) ||
    (headerRef.current?.moduleRule === 'NO_DISTINCTION' && !isEmpty(tableDsRef.current))
  ) {
    exportDetailNode = (
      <text onClick={throttle()}>
        {intl.get('ssrc.common.button.batchExportDetail').d('导出明细')}
      </text>
    );
  }

  // 表单内容
  const dynamicFormNodes = useMemo(() => {
    let fields = [];
    if (allowSupplierViewFlag) {
      // 供应商报价
      fields = [
        <Attachment
          readOnly
          name="attachmentUuid"
          viewMode="popup"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
          funcType="link"
        />,
      ];
    }
    if (allowBuyerViewFlag) {
      // 报完价之后
      fields = [
        <Attachment
          readOnly
          name="attachmentUuid"
          viewMode="popup"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
          funcType="link"
        />,
        <Attachment
          readOnly
          name="quoDetailAttachmentUuid"
          viewMode="popup"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
          funcType="link"
        />,
      ];
    }
    if (!allowBuyerViewFlag && !allowSupplierViewFlag) {
      // 报价之前的报价明细
      fields = [
        <Output name="attachmentNeedFlag" renderer={({ value }) => yesOrNoRender(value)} />,
        <Output name="allowCreateFlag" renderer={({ value }) => yesOrNoRender(value)} />,
        <Output name="allowPurCreateFlag" renderer={({ value }) => yesOrNoRender(value)} />,
        <Attachment
          readOnly
          name="attachmentUuid"
          viewMode="popup"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
          funcType="link"
        />,
      ];
    }
    return fields;
  }, [allowBuyerViewFlag, allowSupplierViewFlag]);

  const itemInfoFields = useMemo(() => {
    const Fields = [<Output name="itemName" />];
    return Fields;
  }, []);

  return (
    <Spin spinning={queryLoading}>
      <div className={style['modal-content-base-form-wrap']}>
        <div
          className={classnames(
            style['ssrc-supplier-quotation-current-base-form-wrap'],
            style['ssrc-supplier-quotation-current-base-form-wrap-first']
          )}
        >
          <h3 style={{ 'font-weight': '600px', fontSize: '16px' }}>
            {intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
          </h3>
          {customizeForm(
            {
              code: getCustomizeUnitCode('baseItemForm'),
              dataSet: itemFormDs,
            },
            <Form
              dataSet={itemFormDs}
              labelLayout="vertical"
              columns={3}
              className="c7n-pro-vertical-form-display"
              useWidthPercent
            >
              {itemInfoFields}
            </Form>
          )}
        </div>

        <div className={style['ssrc-supplier-quotation-current-base-form-wrap']}>
          <h3 style={{ 'font-weight': '600px', fontSize: '16px' }}>
            {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          </h3>
          {customizeForm(
            {
              code: getCustomizeUnitCode('baseInfoForm'),
              dataSet: formDs,
            },
            <Form
              dataSet={formDs}
              columns={3}
              useWidthPercent
              labelLayout="vertical"
              labelAlign="left"
              className="c7n-pro-vertical-form-display"
            >
              <Output name="templateName" />
              {dynamicFormNodes || []}
            </Form>
          )}
        </div>
      </div>

      <div className={style['modal-content-informationExport']}>
        <h3 style={{ 'font-weight': '600px', fontSize: '16px' }}>
          {intl.get('ssrc.common.view.message.quotationInfos').d('报价信息')}
        </h3>
        <div className={style['modal-content-informationExport-div']}>
          <Icon type="unarchive" />
          {exportDetailNode}
        </div>
      </div>
      {headerRef.current?.moduleRule === 'SUB_MODULE' && (
        <Fragment>
          <Anchor linkList={headerRef.current?.moduleList} />
          {headerRef.current?.moduleList?.map((item) => (
            <Fragment className={style['quotation-info-warp']}>
              <h4 id={item.templateId} className={style['quotation-info']}>
                {item.templateName}
              </h4>
              <Table
                mode="tree"
                dataSet={tableDsRef.current?.[item.templateId]}
                columns={getColumns(item.templateId, item)}
              />
            </Fragment>
          ))}
        </Fragment>
      )}
      {headerRef.current?.moduleRule === 'NO_DISTINCTION' && (
        <Fragment>
          <h4 className={style['quotation-info']}>{headerRef.current?.templateName}</h4>
          <Table
            mode="tree"
            dataSet={tableDsRef.current?.[headerRef.current?.templateId]}
            columns={getColumns(headerRef.current?.templateId)}
          />
        </Fragment>
      )}
    </Spin>
  );
}

export default withCustomize({
  unitCode: [
    'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT.SUPPLIER_QUERY_BASE_FORM',
    'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT.SUPPLIER_QUERY_BASE_INFO_FORM',
    'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT_NEW_BID.SUPPLIER_QUERY_BASE_FORM',
    'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT_NEW_BID.SUPPLIER_QUERY_BASE_INFO_FORM',
  ],
})(observer(Content));
