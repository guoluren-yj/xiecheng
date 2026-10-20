/* eslint-disable react/no-danger */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DataSet, Spin, Modal, useModal } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { isEmpty, noop, throttle, compose, isArray, isEqual, debounce, isFunction } from 'lodash';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import classnames from 'classnames';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';
import { Header } from 'components/Page';
import { getResponse, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';
import { TopSection } from '_components/Section';

import { idValidation } from '@/routes/components/Widget/dataVerification';
import { handleValidationResult } from '@/routes/components/Widget/handleValidationResult';
import ApplicationScope from '@/routes/ssrc/components/ApplicationOrganization';

import { isText, fetchCurrentPrecision, amountCalcType } from '@/utils/utils';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { cancelInquiryHallUpdate } from '@/services/inquiryHallService';
import {
  fetchWholeHeader,
  fetchConfigSheet,
  // fetchWholeLine,
  saveWhole,
  submitWhole,
  wholeChangeCompany,
  fetchRfxCreateConfig,
  fetchRfxOfflineDimensionConfig,
  fetchApplyInquiryControl,
} from '@/services/inquiryHallNewService';
import { querySetting } from '@/services/bidHallService';
import { getErrors } from '@/routes/ssrc/RFSupplierQuotation/Quotation/utils/getDSError';

import BasicForm from './Page/BasicForm';
import Attachments from './Page/Attachments';
import QuotationLineTable from './Page/QuotationLineTable';
import Buttons from './Page/Buttons';

import { formDS } from './Stores/formDS';
import { lineDataSet } from './Stores/lineDataSet';

import Style from './index.less';

const Whole = (props = {}) => {
  const {
    history = {},
    match: { path, params = {} },
    location: { search, pathname },
    customizeTable = noop,
    customizeForm = noop,
    customizeCollapseForm = noop,
    customizeBtnGroup = noop,
    custLoading = false,
    offlineEntryRemote,
    getHocInstance,
  } = props || {};
  const { rfxId = null } = params || {};

  const uModal = useModal();

  const lineRef = useRef(); // 报价行

  const [loading, setLoading] = useState(false);
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false); // 判断是否开启双单位
  const [batchMaintainDTO, setBatchMaintainDTO] = useState(null); // 批量编辑弹窗完成数据，通过record.get()
  const [batchEditFormDTO, setBatchEditFormDTO] = useState(null); // 批量编辑弹窗数据, 通过ds.toData(), 主要用来传给后端
  const [allEditFlag, setAllEditFlag] = useState(-1); // 1:全量编辑，0:批量编辑, -1:初始化
  const [settings, setSettings] = useState({}); // 业务规则单位控制
  const [defaultConfig, setDefaultConfig] = useState({}); // 个人中心-默认值配置
  const [allowInputSupplierNameFlag, setAllowInputSupplierNameFlag] = useState(0); // 允许录入仅名称的供应商
  const [currencyPrecision, setCurrencyPrecision] = useState(null); // 手动查询的币种精度
  const [financialPrecision, setFinancialPrecision] = useState(null); // 手动查询的财务精度
  const [suggestedDimension, setSuggestedDimension] = useState('RATIO'); // 业务规则定义-线下整单录入选用维度配置: 'RATIO' | 'QUANTITY'
  const [caclRule, setCaclRule] = useState(null); // 业务规则定义-金额计算方式

  const [applyToInquiryNewFlag, setApplyToInquiryNewFlag] = useState(1);

  const organizationId = getCurrentOrganizationId();

  const basicFormDS = useMemo(
    () =>
      new DataSet(
        formDS({
          organizationId,
          lineDS,
          offlineEntryRemote,
        })
      ),
    [pathname, search, organizationId, offlineEntryRemote]
  );

  const lineDSProps = lineDataSet({
    organizationId,
    basicFormDS,
    offlineEntryRemote,
  });

  const lineDS = useMemo(
    () =>
      new DataSet(
        offlineEntryRemote
          ? offlineEntryRemote.process(
              'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_LINE_DS_PROPS',
              lineDSProps,
              {
                basicFormDS,
              }
            )
          : lineDSProps
      ),
    [pathname, search, organizationId, basicFormDS]
  );

  const { rfxHeaderId = null, rfxNum = null, tenantId } = basicFormDS.current
    ? basicFormDS.current?.get(['rfxHeaderId', 'rfxNum', 'tenantId'])
    : {};

  // 触发页面loading
  const toggleLoading = (loadFlag = false) => {
    setLoading(loadFlag);
  };

  useEffect(() => {
    idValidation(rfxId); // 校验主键

    initPage();
    queryDoubleUnit();
    fetchSetting();
    fetchDefaultConfig();
    fetchDimensionConfig();
    handleSearchConfig();
    initCalcType();
  }, [
    pathname,
    search,
    rfxId,
    queryDoubleUnit,
    fetchSetting,
    fetchDefaultConfig,
    handleSearchConfig,
    fetchDimensionConfig,
  ]);

  useEffect(() => {
    if (!lineDS) {
      return;
    }
    lineDS.setState('batchUpdateLines', batchUpdateLines);
    lineDS.setState('suggestedDimension', suggestedDimension);
    lineDS.setState('getBatchUpdateFlag', getBatchUpdateFlag);
  }, [
    rfxId,
    lineDS,
    lineDS?.current,
    batchUpdateLines,
    getBatchUpdateFlag,
    suggestedDimension,
    allEditFlag,
    batchMaintainDTO,
  ]);

  useEffect(() => {
    if (!basicFormDS) {
      return;
    }

    basicFormDS.addEventListener('update', baseFormUpdateHandle);

    return () => {
      basicFormDS.removeEventListener('update', baseFormUpdateHandle);
    };
  }, [basicFormDS, lineDS]);

  const baseFormUpdateHandle = (data) => {
    const { event = {} } = offlineEntryRemote || {};

    if (!event) {
      return;
    }
    event.fireEvent('baseFormDSUpdateEvents', {
      data,
      lineDS,
    });
  };

  // init page
  const initPage = useCallback(
    (tableCacheFlag = false) => {
      fetchHeader(tableCacheFlag);
    },
    [pathname, search, fetchHeader]
  );

  const fetchHeaderData = useCallback(
    async (data = {}) => {
      idValidation(rfxId);

      const param = {
        ...data,
        organizationId,
        rfxHeaderId: rfxId,
        customizeUnitCode: getCustomizeUnitCode(['baseForm', 'attachment']),
      };
      let result = null;
      toggleLoading(true);
      try {
        result = await fetchWholeHeader(param);
        result = getResponse(result);
        toggleLoading();
        if (!result) {
          return;
        }
        return result;
      } catch (e) {
        throw e;
      }
    },
    [pathname, search, getCustomizeUnitCode, lineDS, basicFormDS, rfxId]
  );

  // header
  const fetchHeader = useCallback(
    async (tableCacheFlag = false) => {
      idValidation(rfxId);

      const param = {
        organizationId,
        rfxHeaderId: rfxId,
        customizeUnitCode: getCustomizeUnitCode(['baseForm', 'attachment']),
      };
      let result = null;
      try {
        result = await fetchHeaderData(param);
        if (!result) {
          return;
        }

        const {
          sourceCategory,
          sourceFrom,
          purchaseRequestFlag,
          allowChangeItemsFlag = 1,
          // allowChangeSupplyFlag,
          companyId = null,
          currencyCode,
        } = result || {};

        const purchaseTurnFlag = sourceFrom === 'DEMAND_POOL' || purchaseRequestFlag === 1; // 申请转标识
        const disabledChangeItemFieldFlag = !allowChangeItemsFlag && sourceFrom === 'PROJECT'; // 禁用物料维护字段逻辑, 后续会扩充逻辑

        basicFormDS.loadData([result || {}]);
        basicFormDS.setState('companySavedFlag', !!companyId); // 要求公司在后端保存了id, 才能操作行
        basicFormDS.setState('headerCurrencyCode', currencyCode); // 要求公司在后端保存了币种，才能操作行
        lineDS.setState('header', result || {});
        lineDS.setState('purchaseTurnFlag', purchaseTurnFlag);
        lineDS.setState('disabledChangeItemFlag', disabledChangeItemFieldFlag);
        lineDS.setQueryParameter('commonProps', {
          ...param,
          customizeUnitCode: getCustomizeUnitCode(['table']),
        });
        lineDS.setState('headerChangeCurrency', null);

        if (offlineEntryRemote && offlineEntryRemote.event) {
          const cuxResult = await offlineEntryRemote.event.fireEvent('cuxInitDefaultValue', {
            basicFormDS,
            lineDS,
          });
          if (cuxResult === false) {
            return;
          }
        }

        fetchCurrencyPrecision(currencyCode);
        if (purchaseTurnFlag) {
          fetchApplyInquiryController({
            sourceCategory,
            company: null,
            prTypeName: null,
            purchaseOrganization: null,
          });
        }
        queryLine(tableCacheFlag);
      } catch (e) {
        throw e;
      } finally {
        toggleLoading();
      }
    },
    [
      fetchHeaderData,
      pathname,
      search,
      getCustomizeUnitCode,
      lineDS,
      basicFormDS,
      fetchApplyInquiryController,
      queryLine,
    ]
  );

  // 报价行查询
  const queryLine = useCallback(
    (tableCacheFlag = false) => {
      // tableCacheFlag区别删除过后查询的标识
      lineDS.query(undefined, undefined, tableCacheFlag);
    },
    [pathname, search, lineDS, basicFormDS]
  );

  // 个人中心-默认值配置
  const fetchDefaultConfig = useCallback(async () => {
    try {
      let config = await fetchRfxCreateConfig({
        organizationId,
        settingCodes: ['000112'],
      });
      config = getResponse(config);
      if (!config) {
        return {};
      }

      setDefaultConfig(config);
      return config;
    } catch (e) {
      throw e;
    }
  }, [pathname]);

  // 允许录入仅名称的供应商
  const handleSearchConfig = async () => {
    const AllData = {
      organizationId,
      configCode: 'ssrc_offline_entry_allows_only_name_suppliers',
      data: {
        tenantNum: getCurrentTenant().tenantNum,
      },
    };
    let result = null;
    try {
      result = await fetchConfigSheet(AllData);
      result = getResponse(result);
      if (result) {
        const flag = result?.length ? 1 : 0;
        lineDS.setState('allowInputSupplierNameFlag', flag);
        setAllowInputSupplierNameFlag(flag);
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询双单位是否开启
  const queryDoubleUnit = useCallback(async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
      tenantId: organizationId,
    });
    if (isText(res)) {
      const currentDoubleFlag = !!Number(res);
      lineDS.setState('doubleUnitFlag', currentDoubleFlag);
      setDoubleUnitFlag(currentDoubleFlag);
    }
  }, [organizationId, lineDS]);

  const initCalcType = async () => {
    const result = (await amountCalcType({ organizationId: tenantId, supplierFlag: 0 })) || [];
    setCaclRule(result?.[0]);
  };

  // 线下整单录入选用维度配置
  const fetchDimensionConfig = async () => {
    const result = (await fetchRfxOfflineDimensionConfig()) || [];
    if (getResponse(result)) {
      setSuggestedDimension(result);
      lineDS.setState('suggestedDimension', suggestedDimension);
    }
  };

  // fetch precision
  const fetchCurrencyPrecision = async (currencyCode) => {
    if (!currencyCode) {
      return;
    }

    const Precisions = await fetchCurrentPrecision({
      currencyCodes: currencyCode,
    });
    if (!Precisions) {
      return;
    }
    const { currency, financial } = Precisions || {};
    // 设置币种精度
    setCurrencyPrecision(currency);
    setFinancialPrecision(financial);
  };

  // change currency
  const changeCurrency = (data) => {
    const { currencyCode, defaultPrecision, financialPrecision: currentFinancialPrecision } =
      data || {};
    setCurrencyPrecision(currencyCode ? defaultPrecision : null);
    setFinancialPrecision(currencyCode ? currentFinancialPrecision : null);

    changeCurrencyReCalculateLine({
      defaultPrecision,
      currentFinancialPrecision,
      currencyCode,
    });
  };

  // after change currency
  const changeCurrencyReCalculateLine = (data = {}) => {
    const { dynamicChangePrice } = lineRef?.current || {};
    if (!lineDS?.length || !dynamicChangePrice) {
      return;
    }

    const { defaultPrecision, currentFinancialPrecision, currencyCode } = data || {};
    const multiCurrencyFlag = basicFormDS?.current?.get('multiCurrencyFlag');

    if (currencyCode) {
      lineDS.setState('headerChangeCurrency', {
        currencyCode,
        multiCurrencyFlag,
        dynamicChangePrice,
      });
    }

    runInAction(() => {
      lineDS.forEach((line) => {
        // const { currencyCode: lineCurrencyCode } = line.get('quotationCurrencyCode');
        const UpdateLineCalculateFlag = !multiCurrencyFlag; // 不允许多币种
        if (UpdateLineCalculateFlag) {
          line.set({
            quotationCurrencyCode: { quotationCurrencyCode: currencyCode, currencyCode },
            defaultPrecision,
            financialPrecision: currentFinancialPrecision,
          });
          dynamicChangePrice(line);
        }
      });
    });
  };

  /**
   * 单位控制配置项查询
   */
  const fetchSetting = useCallback(async () => {
    try {
      let result = await querySetting({
        organizationId,
        '000112': '000112', // 单位控制
      });
      result = getResponse(result);
      if (isEmpty(result)) {
        return;
      }

      const setting000112 = (result['000112'] || {}).settingValue;
      lineDS.setState('settings', {
        setting000112,
      });
      setSettings({
        setting000112,
      });
    } catch (e) {
      throw e;
    }
  }, [lineDS]);

  /**
   * 申请转配置表
   * 不允许物料行字段可变更
   */
  const fetchApplyInquiryController = useCallback(
    async (queryParams = {}) => {
      try {
        let data = await fetchApplyInquiryControl({
          organizationId,
          ...queryParams,
        });
        data = getResponse(data);
        if (isEmpty(data)) {
          return;
        }

        const { allowNewItemsFlag = 1, fields = [] } = data || {};
        if (!allowNewItemsFlag) {
          updateItemLineFieldsProps(fields);
        }
        setApplyToInquiryNewFlag(allowNewItemsFlag);
      } catch (e) {
        throw e;
      }
    },
    [organizationId, rfxId, updateItemLineFieldsProps]
  );

  // 更新行数据属性, 禁止物料行字段可变更
  const updateItemLineFieldsProps = useCallback(
    (fields = []) => {
      if (isEmpty(fields) || !lineDS) {
        return;
      }

      fields.forEach((field) => {
        const currentName = field;
        if (!currentName) {
          return;
        }

        const currentField = lineDS.getField(currentName);
        if (!currentField) {
          lineDS.addField(currentName);
        }

        lineDS.getField(currentName).set('disabled', true);
        const dynamicProps = lineDS.getField(currentName).get('dynamicProps');
        lineDS.getField(currentName).set('dynamicProps', {
          ...(dynamicProps || {}),
          required() {
            return false;
          },
          disabled() {
            return true;
          },
          min() {
            return null;
          },
          max() {
            return null;
          },
          readOnly() {
            return true;
          },
          validate: () => undefined,
          maxLength: () => null,
          minLength: () => null,
        });
      });
    },
    [lineDS, rfxId]
  );

  /**
   * 判断行需要重新计算行价格 or 金额
   * @param batchDto object 批量维护表单数据
   *
   * TODO
   * 批量编辑，行都触发重新计算逻辑，消耗一部分性能
   * 后期改造计划，批量编辑中，筛选如有影响价格或金额的字段值存在，才去触发计算，
   * 比如数量，单价，税率，是否含税，还有双单位逻辑......
   * */
  const updateLinesPirceAndAmountFlag = (batchDto = {}) => {
    const flag = true;
    if (isEmpty(batchDto)) {
      return false;
    }

    return flag;
  };

  /**
   * 批量更新报价行
   */
  const batchUpdateLines = useCallback(
    (currentLineDS = {}, batchDto = {}, currentAllEditFlag = 0) => {
      if (isEmpty(batchDto)) {
        // 批量维护表单数据
        return;
      }

      const { fields = [] } = currentLineDS || {};
      const dsAllFields = fields.toJS() || []; // ds all fields
      // const { supplierCompanyId: supplierCompanyNumOfBatch } = batchDto || {};

      /**
       * update value
       * dataList DataSet[] 需要更新的行数据
       * dsCurrentFiels Fields
       */
      const updateDSFieldsValue = ({ dataList = [], dsCurrentFiels = {} }) => {
        if (isEmpty(dataList) || isEmpty(dsCurrentFiels)) {
          return;
        }

        runInAction(() => {
          dataList.forEach((record = {}) => {
            if (!record) {
              return;
            }

            updateCommonLineValue({ record, dsCurrentFiels, data: batchDto });
          });
        });
      };

      for (const [index] of dsAllFields) {
        const dsCurrentFiels = currentLineDS.getField(index);
        if (currentAllEditFlag === 1) {
          updateDSFieldsValue({ dataList: currentLineDS, dsCurrentFiels });
          updateDSFieldsValue({ dataList: currentLineDS?.cachedCreated, dsCurrentFiels });
        }

        if (currentAllEditFlag === 0) {
          updateDSFieldsValue({ dataList: currentLineDS?.selected, dsCurrentFiels });
        }
      }

      const { dynamicChangePrice } = lineRef?.current || {};
      const updateLineFlag = updateLinesPirceAndAmountFlag(batchDto);

      runInAction(() => {
        currentLineDS.forEach((record = {}) => {
          if (updateLineFlag && isFunction(dynamicChangePrice)) {
            dynamicChangePrice(record); // 重新计算行价,格金额
          }
        });
      });
    },
    [
      rfxId,
      lineDS,
      lineDS?.selected,
      allEditFlag,
      updateCommonLineValue,
      batchMaintainDTO,
      confirmBatchMaintain,
    ]
  );

  // 批量编辑确认
  const confirmBatchMaintain = useCallback(
    debounce(({ data = null, formData = null }) => {
      const { selected = [] } = lineDS;
      let currentAllEditFlag = 0;

      if (isEmpty(selected)) {
        currentAllEditFlag = 1;
      }

      setAllEditFlag(currentAllEditFlag);
      setBatchMaintainDTO(data);
      setBatchEditFormDTO(formData);
      batchUpdateLines(lineDS, data, currentAllEditFlag);
    }, 500),
    [batchUpdateLines, batchMaintainDTO, lineDS, lineDS?.selected, allEditFlag, rfxId]
  );

  /**
   * 更行数据值
   * record - current line record
   * dsCurrentFields current field obj
   * data object 批量更新数据
   * */
  const updateCommonLineValue = useCallback(
    ({ record, dsCurrentFiels, data = {} }) => {
      const { name } = dsCurrentFiels || {};
      if (!name) {
        return;
      }

      const { forceUpdateFields } = data || {};
      const currentField = record.getField(name);
      if (!currentField) {
        return;
      }
      // 行上如果字段不能编辑，批量编辑不更新值
      const disabledFlag = currentField?.get('disabled');
      const readOnlyFlag = currentField?.get('readOnly');

      // supplierCompanyName 在禁用逻辑下也允许批量编辑
      const disabledBatchFlag = (disabledFlag || readOnlyFlag) && name !== 'supplierCompanyName';
      if (disabledBatchFlag) {
        return;
      }

      if (Object.prototype.hasOwnProperty.call(data, name)) {
        const { supplierCompanyNum } = record.get('supplierCompanyId') || {};
        // 行有供应商编码，批量编辑无，不更新supplierCompanyName
        const updateLineSupplierNameFlag =
          name === 'supplierCompanyName' &&
          supplierCompanyNum &&
          !data?.supplierCompanyId?.supplierCompanyNum;
        if (updateLineSupplierNameFlag) {
          return;
        }

        const currentValue = data[name];
        record.set(name, currentValue);

        if (name === 'allottedRatio' || name === 'suggestedFlag') {
          record.set('allocationMethod', 'ALLOCATED_QUANTITY_RATIO');
          record.set('allocationMethodRatio', 'ALLOCATED_QUANTITY_RATIO');
          record.set('allocationMethodQuantity', 'ALLOCATED_QUANTITY_RATIO');
        }
        if (name === 'freightAmount') {
          record.set('freightIncludedFlag', 0);
        }
        if (name === 'taxIncludedFlag' && !currentValue) {
          record.set('taxId', null);
        }

        /**
         * 强制更新逻辑
         * forceUpdateFields.[name] = {
         *   field1,
         *   ...
         * }
         */
        if (!isEmpty(forceUpdateFields)) {
          const currentForceUpdateField = forceUpdateFields[name];
          const forceUpdateKeys = Object.keys(currentForceUpdateField || {});

          // 强制更新一些字段，因为有逻辑变更
          if (!isEmpty(forceUpdateKeys)) {
            forceUpdateKeys.forEach((key) => {
              const forceUpdateFieldValue = currentForceUpdateField[key];
              record.set(key, forceUpdateFieldValue); // 批量编辑有些字段强制更新
            });
          }
        }
      }
    },
    [rfxId]
  );

  // 获取批量编辑啊数据源
  const getBatchUpdateFlag = useCallback(() => {
    return {
      batchMaintainDTO,
      allEditFlag,
    };
  }, [allEditFlag, lineDS, batchMaintainDTO, rfxId]);

  // 批量编辑后
  const resetBatchMainRecord = useCallback(() => {
    setAllEditFlag(-1);
    setBatchMaintainDTO(null);
    setBatchEditFormDTO(null);
    lineDS.unSelectAll();
    lineDS.clearCachedSelected();
  }, [lineDS]);

  /**
   * 获取对应的个性化编码
   * @param type null string | string[]
   * @return null | string
   *  */
  const getCustomizeUnitCode = useCallback(
    (type = null) => {
      if (!type || isEmpty(type)) {
        return null;
      }

      const RfxCodeMap = new Map([
        ['buttons', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.BUTTONS'], // 头部按钮组
        ['baseForm', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.BASE_INFO'], // 基础信息
        ['table', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE'], // 报价行表格
        ['batchMaintain', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_BATCH'], // 报价行表格批量维护
        ['tableButtons', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_HEADER_BUTTONS'], // 报价行表格-阶梯报价-表格
        ['itemTable', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_ITEM'], // item line
        ['itemTableBtns', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_ITEM_BUTTONS'], // ITEM LINE 按钮组
        ['itemTableCreate', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_ITEM_CREATE'], // item batch create
        ['itemTableMaintain', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_ITEM_MAINTAIN'], // ITEM LINE BATCH MAINTAIN
        ['supplierTableBtns', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_SUPPLIER_BUTTONS'], // SUPPLIER LINE 按钮组
        ['supplierTable', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_SUPPLIER'], // supplier line
        ['attachmentCard', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.ATTACHMENT_CARD'], // 附件卡片
        ['attachment', 'SSRC.INQUIRY_HALL_WHOLE_EDIT.ATTACHMENT'], // 附件,
      ]);

      let currentUnitCode = null;

      if (typeof type === 'string') {
        currentUnitCode = RfxCodeMap.get(type);
      }

      if (isArray(type)) {
        const codeSet = new Set();
        type.forEach((unitCode) => {
          codeSet.add(RfxCodeMap.get(unitCode));
        });

        currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
      }

      return currentUnitCode;
    },
    [pathname, search]
  );

  // change company lov
  const handleChangeCompany = useCallback(
    async (data = {}, resetCompany) => {
      const headerCurrent = basicFormDS?.current;
      if (!headerCurrent) {
        return false;
      }

      const rfxOfflineWholeQuoLineDTOList = lineDS.toData();
      const newData = {
        rfxHeaderId: rfxId,
        ...data,
        organizationId,
        rfxOfflineWholeQuoLineDTOList,
        queryParams: {
          customizeUnitCode: getCustomizeUnitCode([
            'baseForm',
            'table',
            'attachment',
            'itemTable',
            'supplierTable',
          ]),
        },
      };

      toggleLoading(true);
      let result = null;
      try {
        result = await wholeChangeCompany(newData);
        result = getResponse(result);
        toggleLoading();
        if (!result) {
          resetCompany();
          return false;
        }

        const { objectVersionNumber } = result || {};
        headerCurrent.set('objectVersionNumber', objectVersionNumber);
        headerCurrent.set('companyId', data);

        lineDS.clearCachedRecords();
        lineDS.clearCachedSelected();
        queryLine();
      } catch (e) {
        throw e;
      }
    },
    [basicFormDS, basicFormDS.current, lineDS, rfxId]
  );

  // change company
  const changeCompany = useCallback(
    async (data = {}, oldValue = {}) => {
      const { companyId = null, companyName = null } = data || {};
      const { companyId: oldId = null, companyName: oldName = null } = oldValue || {};
      idValidation(rfxHeaderId);

      const headerCurrent = basicFormDS?.current;
      if (!headerCurrent || !companyId) {
        return;
      }

      // cancel change company
      const resetCompany = () => {
        headerCurrent.set('companyId', {
          companyId: oldId,
          companyName: oldName,
        });
      };
      const companyData = {
        companyId,
        companyName,
      };

      if (oldId && oldId !== companyId) {
        Modal.confirm({
          title: intl.get('ssrc.inquiryHall.message.confirm.switchCompany').d('切换公司后'),
          children: (
            <span>
              {intl
                .get('ssrc.inquiryHall.message.confirm.contiueChangeCompany')
                .d('切换公司后，会将不在该公司下的物料行清空，是否继续切换？')}
            </span>
          ),
          onOk: () => handleChangeCompany(companyData, resetCompany),
          onCancel: resetCompany,
        });
      }
    },
    [basicFormDS, basicFormDS.current, path, search, queryLine, handleChangeCompany]
  );

  /**
   * 提交数据整理
   * */
  const getCurrentPageSubmitData = useCallback(async () => {
    let validationFlag = true;
    let formData = null;
    let tableData = null;

    const { current = null } = basicFormDS || {};
    if (current) {
      current.set('status', 'update');
    }

    lineDS.forEach((lineRecord) => {
      if (!lineRecord) {
        return;
      }

      lineRecord.set('status', 'update');
    });

    let formError = null;
    let tableError = null;
    let errorMessage = null;

    validationFlag = await Promise.all([basicFormDS.validate(), lineDS.validate()]);
    validationFlag = validationFlag.every((validateFlag) => validateFlag);

    formError = await basicFormDS.getValidationErrors();
    tableError = await lineDS.getValidationErrors();
    formError = getErrors({
      data: formError,
      groupCategory: intl.get('ssrc.common.view.message.basicInfos').d('基础信息'),
    });
    tableError = getErrors({
      data: tableError,
      groupFieldName: 'itemName',
      groupCategory: intl.get('ssrc.inquiryHall.view.title.resultInput').d('结果录入'),
      primaryKey: 'offlineQuoLineId',
    });
    errorMessage =
      formError && tableError ? `${formError}, ${tableError}` : formError || tableError || '';

    formData = current?.toData();
    tableData = lineDS.toData();

    return {
      validationFlag,
      errorMessage,
      rfxHeader: formData,
      suggestedDimension,
      rfxOfflineWholeQuoLineDTOList: tableData,
      allEditFlag,
      batchEditQuotationLineDTO: batchEditFormDTO,
      rfxHeaderId,
      organizationId,
      queryParams: {
        rfxHeaderId,
        customizeUnitCode: getCustomizeUnitCode([
          'baseForm',
          'table',
          'attachment',
          'itemTable',
          'supplierTable',
          'batchMaintain',
        ]),
      },
    };
  }, [
    getCustomizeUnitCode,
    search,
    pathname,
    basicFormDS,
    basicFormDS.current,
    lineDS,
    allEditFlag,
    batchMaintainDTO,
    batchEditFormDTO,
    suggestedDimension,
  ]);

  // 提交成功后
  const successSubmit = useCallback(() => {
    setLoading();
    directionList();
  }, [directionList]);

  // 调用远程提交接口
  const handleSubmit = async (data = {}) => {
    if (!data || loading) {
      return;
    }

    let result = null;
    try {
      result = await submitWhole(data);
      toggleLoading();
    } catch (e) {
      toggleLoading(false);
      throw e;
    }

    return result;
  };

  // cux
  const beforeSubmitCuxHandle = async ({ data }) => {
    const { event = {} } = offlineEntryRemote || {};

    if (!event) {
      return;
    }
    const result = await event.fireEvent('handleBeforeSubmitCuxEvent', {
      data,
      lineDS,
      basicFormDS,
      pageProps: props,
    });

    return result;
  };

  // 提交
  const submit = useCallback(
    debounce(async () => {
      const { validationFlag = false, errorMessage = null, ...data } =
        (await getCurrentPageSubmitData()) || {};

      if (!validationFlag) {
        if (errorMessage) {
          notification.warning({
            message: <div dangerouslySetInnerHTML={{ __html: errorMessage || '' }} />,
          });
        }
        return;
      }

      const SubmitNewData = data || {};

      /**
       * cux
       */
      const cuxEvent = await beforeSubmitCuxHandle({ data });
      if (cuxEvent === false) {
        return;
      }

      // 二次提交确认
      const confirmSubmit = async (SubmitOptionData = {}) => {
        const SubmitSymbolData = { passFlag: 1 }; // 通过passFlag确定是校验还是提交
        const result = await handleSubmit({
          ...SubmitNewData,
          ...SubmitSymbolData,
          ...SubmitOptionData,
        });
        resetBatchMainRecord();
        toggleLoading(false);
        if (result && result.failed) {
          notification.warning({
            message: result?.message,
          });
          return;
        }

        await handleValidationResult({
          validationResult: result,
          afterSuccessSubmit: (res) => {
            successSubmit(res);
          },
          headerId: rfxId,
        });
      };

      try {
        toggleLoading(true);
        const result = await handleSubmit(SubmitNewData);
        if (result && result.failed) {
          notification.warning({
            message: result?.message,
          });
          toggleLoading(false);
          return;
        }

        await handleValidationResult({
          validationResult: result,
          headerId: rfxId,
          confirmSubmit: () => confirmSubmit(),
          afterSuccessSubmit: (res) => {
            resetBatchMainRecord();
            setLoading();
            successSubmit(res);
          },
        });
      } catch (e) {
        toggleLoading(false);
        throw e;
      }
    }, 1000),
    [
      allEditFlag,
      batchMaintainDTO,
      pathname,
      rfxId,
      getCurrentPageSubmitData,
      handleValidationResult,
      successSubmit,
      handleSubmit,
      resetBatchMainRecord,
      batchEditFormDTO,
    ]
  );

  // 保存
  const save = useCallback(
    throttle(async () => {
      if (!lineDS) {
        return;
      }

      basicFormDS.setState('skipValidateFlag', 1); // 保存阶段，标识一些字段不用校验
      lineDS.setState('skipValidateFlag', 1);

      const { validationFlag = false, errorMessage = null, ...data } =
        (await getCurrentPageSubmitData()) || {};

      basicFormDS.setState('skipValidateFlag', 0);
      lineDS.setState('skipValidateFlag', 0);

      if (!validationFlag) {
        if (errorMessage) {
          notification.warning({
            message: <div dangerouslySetInnerHTML={{ __html: errorMessage || '' }} />,
          });
        }
        return false;
      }

      let result = null;
      toggleLoading(true);
      try {
        result = await saveWhole(data);
        result = getResponse(result);
        toggleLoading();

        if (!result) {
          return false;
        }

        notification.success();
        initPage();
        resetBatchMainRecord();
      } catch (e) {
        throw e;
      }

      return true;
    }, 1000),
    [
      basicFormDS,
      allEditFlag,
      batchMaintainDTO,
      getCurrentPageSubmitData,
      pathname,
      search,
      initPage,
      lineDS,
      resetBatchMainRecord,
      batchEditFormDTO,
    ]
  );

  // cancel handle
  const cancelledRfx = useCallback(
    debounce(async () => {
      idValidation(rfxId);
      toggleLoading(true);
      try {
        let result = await cancelInquiryHallUpdate({
          organizationId,
          rfxHeaderId: rfxId,
        });
        result = getResponse(result);
        toggleLoading();
        if (!result) {
          return;
        }

        notification.success();
        directionList();
      } catch (e) {
        throw e;
      }
    }, 800),
    [rfxId, directionList]
  );

  // cancel
  const cancel = useCallback(
    debounce(async () => {
      Modal.confirm({
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.cancelChange`)
          .d('是否确认取消并关闭该单据？'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        onOk: () => cancelledRfx(),
        // onCancel: () => {},
      });
    }, 1000),
    [cancelledRfx]
  );

  let applicationScopeRef = {}; // 适用范围ref

  // 查看适用范围
  const viewApplicationOrgModal = useCallback(
    throttle((param = {}, options = {}) => {
      const { current } = basicFormDS || {};
      if (!current) {
        return;
      }

      const { applicationScopeFlag } = current?.get(['applicationScopeFlag']);
      const Props = {
        queryParams: {
          organizationId,
          sourceHeaderId: rfxId,
          sourceFrom: 'RFX',
          applicationScopeFlag,
          ...param,
        },
        onRef: (node) => {
          applicationScopeRef = node;
        },
        sourceHeaderId: rfxHeaderId,
        organizationId,
      };

      return uModal.open({
        destroyOnClose: true,
        closable: true,
        // key: modalKey,
        drawer: true,
        title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
        children: <ApplicationScope {...Props} />,
        okText: intl.get('hzero.common.button.save').d('保存'),
        bodyStyle: {
          padding: 0,
        },
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        style: { width: '70%' },
        onOk: () => saveApplicationScope(options),
        onClose: () => {
          applicationScopeRef = null;
        },
      });
    }, 800),
    [
      applicationScopeRef,
      basicFormDS,
      basicFormDS.current,
      lineDS,
      rfxId,
      params,
      saveApplicationScope,
    ]
  );

  // 适应范围 - 保存 区分头/行的适用范围处理逻辑
  const saveApplicationScope = useCallback(
    async (options = {}) => {
      const { handleAfterSaveApplicationScope = null } = options || {};
      const { submitApplicationScopeLine = () => {} } = applicationScopeRef || {};
      const result = await submitApplicationScopeLine();
      if (result === true) {
        if (handleAfterSaveApplicationScope) {
          handleAfterSaveApplicationScope(); // 物料行有单独的提交后逻辑
          return;
        }

        afterSaveApplicationScope(); // 头上适用范围
        return;
      }

      return false;
    },
    [afterSaveApplicationScope, applicationScopeRef, basicFormDS, lineDS]
  );

  // 保存阶梯报价后
  const afterSaveApplicationScope = useCallback(async () => {
    const { current } = basicFormDS || {};
    if (!current) {
      return;
    }

    let headerData = null;
    try {
      headerData = await fetchHeaderData();
      if (isEmpty(headerData)) {
        return;
      }
      const { objectVersionNumber, totalPrice } = headerData || {};
      current.set({
        objectVersionNumber,
        totalPrice,
      });
    } catch (e) {
      throw e;
    }

    queryLine();
  }, [basicFormDS, fetchHeaderData, queryLine]);

  // 跳转到列表页
  const directionList = useCallback(
    (param = {}) => {
      const { listSearch = null } = param || {};
      const activeTabKey = getActiveTabKey();

      history.push({
        pathname: `${activeTabKey}/list`,
        search: listSearch,
      });
    },
    [pathname, search]
  );

  // title back path
  const getBackPath = useCallback(() => {
    const activeTabKey = getActiveTabKey();
    const parentPath = `${activeTabKey}/list`;
    return parentPath;
  }, [pathname, search]);

  // 按钮组
  const renderHeaderButtons = useCallback(() => {
    const buttonsProps = {
      loading,
      basicFormDS,
      lineDS,
      path,
      toggleLoading,
      organizationId,
      offlineEntryRemote,
      getCustomizeUnitCode,
      customizeBtnGroup,
      submit,
      save,
      refreshPage: fetchHeader,
      rfxId,
      cancel,
    };

    return <Buttons {...buttonsProps} />;
  }, [
    loading,
    basicFormDS,
    lineDS,
    path,
    organizationId,
    getCustomizeUnitCode,
    submit,
    save,
    queryLine,
    rfxId,
  ]);

  // common props
  const CommonProps = {
    basicFormDS,
    organizationId,
    rfxHeaderId: rfxId,
    path,
    suggestedDimension,
    getCustomizeUnitCode,
    doubleUnitFlag,
    customizeForm,
    viewApplicationOrgModal,
    settings,
    defaultConfig,
    allowInputSupplierNameFlag,
    currencyPrecision,
    financialPrecision,
    caclRule,
    offlineEntryRemote,
    history,
    remote,
  };

  // 表单props
  const FormProps = {
    ...CommonProps,
    customizeCollapseForm,
    custLoading,
    changeCompany,
    changeCurrency,
  };

  // 报价行props
  const quotationLineProps = {
    ...CommonProps,
    lineDS,
    customizeTable,
    custLoading,
    doubleUnitFlag,
    initPage,
    queryLine,
    history,
    confirmBatchMaintain,
    save,
    applyToInquiryNewFlag,
    resetBatchMainRecord,
    offlineEntryRemote,
    onRef: lineRef,
  };

  return (
    <React.Fragment>
      <Header
        backPath={getBackPath()}
        title={
          <span>
            {intl
              .get(`ssrc.supplierQuotation.view.message.title.offlineWholeInput`)
              .d('线下整单录入')}
            {rfxNum ? `-${rfxNum}` : ''}
          </span>
        }
      >
        {renderHeaderButtons()}
      </Header>
      <div className={classnames(Style['supplier-content'], Style['whole-content'])}>
        <div className={classnames(Style['whole-detail-list-card'])}>
          <Card
            id="rfxBasicInfo"
            title={intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
            bordered={false}
          >
            <Spin spinning={loading}>
              <BasicForm {...FormProps} />
            </Spin>
          </Card>
          <Card
            id="rfxResultInput"
            title={intl.get('ssrc.inquiryHall.view.title.resultInput').d('结果录入')}
            bordered={false}
          >
            <QuotationLineTable {...quotationLineProps} />
          </Card>
          <TopSection
            title={intl.get('ssrc.common.attachment').d('附件')}
            getHocInstance={getHocInstance}
            code={getCustomizeUnitCode('attachmentCard')}
            className={Style['ssrc-common-top-section-card']}
          >
            <Attachments {...FormProps} />
          </TopSection>
        </div>
      </div>
    </React.Fragment>
  );
};

const routerMatch = (Target) => {
  return (props = {}) => {
    const ref = useRef(null);
    const { location, ...otherProps } = props || {};
    if (!ref.current || !isEqual(ref.current, location)) {
      ref.current = location;
      otherProps.location = location;
    } else {
      otherProps.location = ref.current;
    }

    return <Target {...otherProps} />;
  };
};

const hocComponent = (NewComponent) => {
  const unitCodes = [
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.BUTTONS', // 按钮组
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.BASE_INFO', // 基本信息
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE', // 结果录入行
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_HEADER_BUTTONS', // 行信息按钮组
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_ITEM', // 物料表格
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_ITEM_CREATE', // item batch create
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_ITEM_MAINTAIN', // ITEM LINE BATCH MAINTAIN
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_SUPPLIER', // 供应商表格
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.ATTACHMENT', // 附件
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.ATTACHMENT_CARD', // 附件卡片
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_ITEM_BUTTONS', // ITEM LINE 按钮组
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_SUPPLIER_BUTTONS', // SUPPLIER LINE 按钮组
    'SSRC.INQUIRY_HALL_WHOLE_EDIT.LINE_BATCH', // LINE BATCHMATAIN FORM
    // 'SSRC.INQUIRY_HALL_WHOLE_EDIT.OTHERS_FORM', // OTHERS
  ];

  return compose(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.bidHall',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.offlineResultEntry',
        'ssrc.rf',
        'sscux.common', // cux code
        'ssrc.offlineResultEntry',
        'ssrc.resultsQuery',
        'hzero.c7nProUI',
      ],
    }),
    withCustomize({
      unitCode: unitCodes,
    }),
    remote(
      {
        code: 'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE',
        name: 'offlineEntryRemote',
      },
      {
        events: {
          baseFormDSUpdateEvents() {},
          lineDSEventsLoadCuxHandle() {},
          quotationLineTableChangeItemId() {},
          lineDSEventsUploadCuxHandle() {},
          handleBeforeSubmitCuxEvent() {},
          remoteHandleSetRecordValueChangeItemId() {}, // 改变物料后最后的二开埋点
        },
      }
    )
  )(routerMatch(observer(NewComponent)));
};

export default hocComponent(Whole);
export { hocComponent, Whole };
