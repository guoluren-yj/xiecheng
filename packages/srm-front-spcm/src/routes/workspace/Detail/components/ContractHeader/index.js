import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import intl from 'utils/intl';
import { Output, Attachment } from 'choerodon-ui/pro';

import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';
import { isUndefined, isNil, isEmpty, isArray } from 'lodash';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import CollapseForm from '_components/CollapseForm';
import { renderThousandthNum, openTermsModal, tirmSpecialCode } from '@/utils/util';
import { queryLovData, queryIdpValue } from 'services/api';
import { getCurrentOrganizationId, getCurrentUser, getResponse } from 'utils/utils';

import { extTextRender } from '@/utils/renderer';
import { fetchPurchaseFormList } from '@/services/workspaceService';
import { fetchContractTemplates } from '@/services/contractCommonService';
import OccupyModal from '@/routes/workspace/Component/Modal/OccupyModal';
import ConstructForm from './ConstructForm';
import styles from '../index.less';
import styles2 from '../../index.less';

const tenantId = getCurrentOrganizationId();

const RfxInfoDS = observer((props) => {
  const {
    useWidthPercent = true,
    customizeCollapseForm,
    custLoading,
    headerFormDs = {},
    contractCommon: { partnerList = [] } = {}, // 做空值处理，新建的时候是没有contractCommon的
    // setRfxInfoRef,
    // header,
    // proxyDsCreate = {},
    // rfx = {},
    isCreate,
    isEdit,
    purchaseFlag,
    _linkFlag,
    currentMode,
    changeCompareData = {},
    partnerDs,
    pcSubjectDs,
    rebateDs,
    // afterCustomizeDs,
    remoteWorkDetail,
    pcKindCodes,
    isSplitMode,
    attachmentSupportUpload,
  } = props;
  const useInfo = getCurrentUser();
  const [isNotSysSupplierFlag, setNotSysSupplierFlag] = useState(false);
  const [supplierChangeFieldMap, setSupplierChangeFieldMap] = useState([]); // 供应商变更字段映射
  const pcSourceCode = headerFormDs.current?.get('pcSourceCode');
  const executionStrategyCode = headerFormDs.current?.get('executionStrategyCode');
  const secondLevelStrategyCode = headerFormDs.current?.get('secondLevelStrategyCode');
  const orderSecondLevelStrategyCode = headerFormDs.current?.get('orderSecondLevelStrategyCode');
  const taxIncludeAmountChinese = headerFormDs.current?.get('taxIncludeAmountChinese');
  const amountControlDimension = headerFormDs.current?.get('amountControlDimension');
  const manuallyModifyAmount = headerFormDs.current?.get('manuallyModifyAmount');
  const maxContractAmountFlag = amountControlDimension === 'HEAD' && manuallyModifyAmount === '1';
  const headerInfoCurrent = headerFormDs?.toJSONData()[0] || {};
  const {
    pcHeaderId,
    supplementFlag,
    mainContractId,
    version,
    pcNum,
    payPlanNum,
    mainPcNum,
    purchaseCurrencyCode,
    cnfApplicability,
    electricSignFlag,
    supplierCompanyName,
    supplierName,
  } = headerInfoCurrent;

  const eleSignFlag = useMemo(() => Number(electricSignFlag) === 1, [electricSignFlag]);

  useEffect(() => {
    headerFormDs.addEventListener('update', handleFormUpdate);
    return () => {
      headerFormDs.removeEventListener('update', handleFormUpdate);
    };
  }, [props, handleFormUpdate]);

  useEffect(() => {
    // 获取协议头供应商Lov变更映射值集
    queryIdpValue('SPCM.CONTRACT.SUPPLIER_CHANGE_FIELD_MAP').then((data) => {
      if (getResponse(data)) {
        setSupplierChangeFieldMap(data);
        // 新建状态,手动触发供应商变更
        if (!pcHeaderId) {
          handleChangeSupplierLov(data);
        }
      }
    });
  }, []);

  const handleFormUpdate = useCallback(
    (params) => {
      const { dataSet, record, name, value } = params;
      // 业务实体修改，清空标的行库存组织
      if (name === 'ouIdLov' && pcSubjectDs?.length) {
        pcSubjectDs.forEach((record) => {
          record.set({
            invOrganizationIdLov: null,
          });
        });
        headerFormDs.current.set('checkOuInvRelFlag', 1);
      }
      // 公司/协议性质/协议类型值变更时，清空协议模板
      if (attachmentSupportUpload && ['companyIdLov', 'pcKindCode', 'pcTypeIdLov'].includes(name)) {
        headerFormDs.current.set('pcAttachmentTemplateId', null);
      }
      const oldName = name?.replace('Lov', '');
      const aiIconFieldCode = dataSet.getState(`${oldName}-AiIconFieldCode`);
      const newName = aiIconFieldCode || oldName;
      const diffValue = record?.get(`${newName}DiffValue`);
      if (diffValue && value !== diffValue && !name?.includes('diffFlag')) {
        if (!value) {
          record.set(`${newName}DiffFlag`, null);
        } else {
          record.set(`${newName}DiffFlag`, 2);
        }
      }
      if (remoteWorkDetail?.event) {
        remoteWorkDetail.event.fireEvent('handleFormUpdate', { params, eventProps: props });
      }
    },
    [props]
  );

  /**
   * 去除协议名称的特殊字符
   * @param {string} val
   */
  const handlePcName = (val) => {
    headerFormDs.current.set('pcName', tirmSpecialCode(val));
  };

  const handleChangeContractDate = (value) => {
    if (value) {
      headerFormDs.current.set('startDateActive', undefined);
      headerFormDs.current.set('endDateActive', undefined);
    } else {
      headerFormDs.current.set('effectiveTime', undefined);
    }
  };

  /**
   * 控制标的的日期
   * @param {object} dataObj 日期值
   */
  const handleChangeDate = (dataObj) => {
    if (pcSubjectDs) {
      pcSubjectDs.forEach((record) => {
        if (record.status === 'add') {
          if (!isUndefined(dataObj.startDateActive)) {
            record.set('priceStartDate', dataObj.startDateActive);
          }
          if (!isUndefined(dataObj.endDateActive)) {
            record.set('priceEndDate', dataObj.endDateActive);
          }
        }
      });
    }
    if (rebateDs) {
      rebateDs.forEach((record) => {
        if (record.status === 'add' && pcKindCodeValue === 'FRAMEWORK_AGREEMENT') {
          if (!isUndefined(dataObj.startDateActive)) {
            record.set('validityDateFrom', dataObj.startDateActive);
          }
          if (!isUndefined(dataObj.endDateActive)) {
            record.set('validityDateTo', dataObj.endDateActive);
          }
        }
      });
    }
  };

  const handleChangeMainContract = (lovRecord) => {
    if (!headerFormDs.current.get('signEffectFlag') && pcKindCodeValue === 'QUOTATION_AGREEMENT') {
      const { startDateActive, endDateActive } = lovRecord;
      handleChangeDate({ startDateActive, endDateActive });
      if (startDateActive) {
        headerFormDs.current.set('startDateActive', startDateActive);
      }
      if (endDateActive) {
        headerFormDs.current.set('endDateActive', endDateActive);
      }
    }
  };

  const handleCompanyIdLov = (obj) => {
    headerFormDs.current.set('pcTypeIdLov', undefined);
    headerFormDs.current.set('pcTemplateIdLov', undefined);
    if (obj) {
      queryOuId({ companyId: obj.companyId });
    }
    if (remoteWorkDetail?.event) {
      const eventProps = {
        eventProps: props,
      };
      remoteWorkDetail.event.fireEvent('handleCuxCompanyIdLovChange', eventProps);
    }
  };

  /**
   * 查询业务实体值集的值
   */
  const queryOuId = async (data) => {
    const res = await queryLovData(
      `/spfm/v1/${tenantId}/user-authority-data/ou?customizeUnitCode=SPFM_ORG-INFO_OPERATION-UNIT.LIST`,
      {
        ...data,
        tenantId,
      },
      'GET'
    );
    const setData = res?.content || [];
    if (setData.length === 1) {
      headerFormDs.current.set('ouIdLov', setData[0]);
    } else {
      headerFormDs.current.set('ouIdLov', undefined);
    }
  };

  const handlepcTypeIdLov = async (record) => {
    const { pcTemplateId, pcTemplateName, pcTypeId } = record || {};
    let newPcTemplate = { pcTemplateId, templateName: pcTemplateName };
    if (
      !newPcTemplate.pcTemplateId &&
      !isEmpty(record) &&
      !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCodeValue)
    ) {
      const temRes = await fetchContractTemplates({
        lovCode: 'SPCM.PC_TEMPLATE',
        enabledFlag: 1,
        pcTypeId,
        companyId: headerFormDs.current.get('companyId'),
        templateStatus: 'END_APPROVAL',
        supplementFlag,
      });
      const tempList = temRes?.content || [];
      if (tempList?.length === 1 && !temRes?.failed) {
        newPcTemplate = {
          pcTemplateId: tempList[0].pcTemplateId,
          templateName: tempList[0].templateName,
        };
      }
    } else if (isEmpty(record)) {
      newPcTemplate = { pcTemplateId: null, templateName: null };
    }
    /* 协议类型里有模板就带出模板，没有就清空。（src-24122）直接在标准里面改造更简单快捷，以后其他项目需要协议类型带出协议模板，
        直接让后端二开一个能返回pcTemplateId, pcTemplateName的协议类型值集即可，减少前端二开负担 */
    headerFormDs.current.set('pcTemplateIdLov', newPcTemplate?.pcTemplateId && newPcTemplate);
    // 来源订单且新链路=null不带出验收类型  来源寻源/申请且新链路且一级策略为仅寻源=不转下游
    headerFormDs.current.set(
      'acceptType',
      pcSourceCode === 'PURCHASE_ORDER' && _linkFlag
        ? null
        : (pcSourceCode === 'SEARCH_SOURCE_RESULT' || pcSourceCode === 'PURCHASE_NEED') &&
          _linkFlag &&
          executionStrategyCode === 'SOURCE'
        ? 'contract'
        : record?.acceptType
    );
    headerFormDs.current.set('acceptFlag', record?.acceptFlag || 0);
    // setAcceptFlag(record.acceptFlag||0);
  };

  // resetFields(['pcTemplateId']);
  // setFieldsValue({
  //   acceptType,
  // });

  // 过滤验收类型
  const handleFilterAcceptType = (record) => {
    // 新链路
    if (_linkFlag) {
      // 来源寻源 ->（一级策略）仅寻源 ->（验收类型）除订单
      if (pcSourceCode === 'SEARCH_SOURCE_RESULT' && executionStrategyCode === 'SOURCE') {
        return record.get('value') !== 'none';
      }
      // 来源订单 ->（验收类型）不转下游
      if (pcSourceCode === 'PURCHASE_ORDER') {
        return record.get('value') === 'contract';
      }
      // 来源申请 ->（一级策略）仅寻源 ->（验收类型）除订单
      if (pcSourceCode === 'PURCHASE_NEED' && executionStrategyCode === 'SOURCE') {
        return record.get('value') !== 'none';
      }
    }
    return true;
  };

  const getClassName = (field) => {
    const { newPcHeader = {}, oldPcHeader = {} } = changeCompareData;

    let className = '';
    if (currentMode && newPcHeader[field] !== oldPcHeader[field]) {
      if (currentMode === 'current') {
        className = styles2.changeAfter;
      } else if (currentMode === 'history') {
        className = styles2.changeBefore;
      }
    }

    return className;
  };

  // 协议性质修改回调
  const handleChangePcKindCode = (val) => {
    if (val === 'NOT_SYS_SUPPLIER' || isNotSysSupplierFlag) {
      setNotSysSupplierFlag(!isNotSysSupplierFlag);
      headerFormDs.current.set('supplierCompanyIdLov', {});
    }
    if (['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(val)) {
      headerFormDs.current.set('pcTemplateIdLov', {});
    }
    if (remoteWorkDetail?.event) {
      remoteWorkDetail.event.fireEvent('handleCuxChangePcKindCode', {
        value: val,
        headerFormDs,
      });
    }
  };

  // 供应商修改回调
  const handleChangeSupplier = () => {
    if (headerFormDs.current && headerFormDs.current?.get('pcKindCode')) {
      headerFormDs.current.set('supplierCompanyId', -1);
    }
    if (remoteWorkDetail?.event) {
      const eventProps = {
        dataSet: headerFormDs,
        componentType: 'TextField',
      };
      remoteWorkDetail.event.fireEvent('handleCuxSupplierLovChange', eventProps);
    }
  };

  // 供应商修改回调
  const handleChangeSupplierLov = async (data) => {
    const supplierCompanyIdLov = headerFormDs?.current?.get('supplierCompanyIdLov') || {};
    let dataMap = supplierChangeFieldMap;
    let supplierInfo = supplierCompanyIdLov;
    // 新建第一次进入，数据从头获取
    if (data) {
      dataMap = data;
      supplierInfo = headerFormDs?.current?.toJSONData() || {};
    }
    if (isArray(dataMap) && !isEmpty(dataMap) && supplierInfo) {
      const { companyId, supplierCompanyId } = supplierInfo;
      const res = await fetchPurchaseFormList({ companyId, supplierCompanyId });
      if (getResponse(res)) {
        dataMap.map((item) => {
          const { value, meaning } = item;
          const meaningList = meaning.split(';');
          // 多个值，视为对象
          if (meaningList.length > 1) {
            const data = {};
            meaningList.map((meaningMap) => {
              const keyMap = meaningMap.split('-');
              data[keyMap[0]] = res[keyMap[1] || keyMap[0]];
            });
            headerFormDs.current.set(value, data);
          } else {
            headerFormDs.current.set(value, res[meaning]);
          }
        });
      }
      console.log(headerFormDs.current.toJSONData());
    }
  };

  // 处理选择供应商组件关闭
  const handleSupplierLovChange = (data) => {
    handleChangeSupplierLov(data);
    if (remoteWorkDetail?.event) {
      const eventProps = {
        dataSet: headerFormDs,
        componentType: 'Lov',
      };
      remoteWorkDetail.event.fireEvent('handleCuxSupplierLovChange', eventProps);
    }
  };

  // 过滤协议性质
  const handleFilterPcKindCode = (record) => {
    const optionResult = (record) => {
      if (pcKindCodes?.length) {
        return pcKindCodes.includes(record.get('value'));
      }
      if (
        record.get('value') === 'NOT_SYS_SUPPLIER' &&
        ['SEARCH_SOURCE_RESULT', 'PURCHASE_NEED', 'PURCHASE_ORDER'].includes(pcSourceCode)
      ) {
        return false;
      }
      // 新链路
      if (_linkFlag) {
        // 来源寻源 ->（一级策略）仅寻源 ->（协议性质）框架
        if (pcSourceCode === 'SEARCH_SOURCE_RESULT' && executionStrategyCode === 'SOURCE') {
          return ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(record.get('value'));
        }
        // 来源订单 ->（协议性质）普通+附件
        if (pcSourceCode === 'PURCHASE_ORDER') {
          return ['NORMAL', 'ATTACHMENT'].includes(record.get('value'));
        }
        // 来源申请
        if (pcSourceCode === 'PURCHASE_NEED') {
          // （一级策略）仅寻源 ->（协议性质）框架
          if (executionStrategyCode === 'SOURCE') {
            return ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(record.get('value'));
          }
          // （一级策略）仅订单 ->（协议性质）除框架
          if (executionStrategyCode === 'ORDER') {
            return !['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(record.get('value'));
          }
          // （一级策略）寻源&订单/先寻源再订单
          if (['SOURCE_AND_ORDER', 'BEFORE_SOURCE_AFTER_ORDER'].includes(executionStrategyCode)) {
            // （寻源二级策略）框架协议/全部 ->（履约二级策略）订单/不转单 ->（协议性质）框架
            if (
              ['CONTRACT_FRAMEWORK', 'ALL'].includes(secondLevelStrategyCode) &&
              ['PO', 'NO_ACCESS'].includes(orderSecondLevelStrategyCode)
            ) {
              return ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(record.get('value'));
            }
            // （寻源二级策略）非框架协议&&非全部 ->（协议性质）除框架
            if (!['CONTRACT_FRAMEWORK', 'ALL'].includes(secondLevelStrategyCode)) {
              return !['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(record.get('value'));
            }
          }
        }
      }
      return true;
    };
    if (remoteWorkDetail) {
      // 此处用proccess处理function数据更好，埋单扩展性更强
      return remoteWorkDetail.process(
        'SPCM_WORKSPACE_DETAIL_HEADER_FILTERPCKINDCODE',
        optionResult(record),
        { record, eventProps: props }
      );
    } else {
      return optionResult(record);
    }
  };

  /**
   * 更新伙伴联系人信息
   * @param {object} contacts 联系人信息
   */
  const changeParter = (contacts) => {
    partnerDs.forEach((record) => {
      const { companyId, partnerTypeId } = record.get(['partnerTypeId', 'companyId']);
      const partnerInfo = partnerList.find((pType) => pType.partnerTypeId === partnerTypeId) || {};
      // contactMethodCode=DEFAULT/null/undefined且是采购方或者公司编码等于头上的公司编码
      const isAgent =
        (partnerInfo.defaultRoleFlag === '1' ||
          (partnerInfo.defaultRoleFlag !== '0' &&
            companyId === headerFormDs?.current?.get('companyId'))) &&
        (isNil(partnerInfo.contactMethodCode) || partnerInfo.contactMethodCode == 'DEFAULT');
      if (isAgent) {
        record.set(contacts);
      }
    });
  };

  /**
   * 采购员变化更新伙伴信息联系人等信息
   */
  const handleChangeAgent = async (values) => {
    if (partnerDs && values) {
      const {
        purchaseAgentName,
        purchaseAgentPhone,
        purchaseAgentFax,
        purchaseAgentEmail,
        userRealNames,
      } = values || {};
      const { realName, email } = useInfo;
      // 当前操作人若为采购员指定用户，则取操作人子账户邮箱；否则为空
      const isPurUser = (userRealNames?.split(',') || []).includes(realName);
      changeParter({
        contacts: purchaseAgentName,
        telNum: purchaseAgentPhone,
        faxes: purchaseAgentFax,
        mail: isPurUser ? email : purchaseAgentEmail,
      });
    } else if (partnerDs && headerFormDs?.current?.get('companyId')) {
      props
        .dispatch({
          type: 'contractCommon/fetchContactByCompany',
          payload: headerFormDs?.current?.get('companyId'),
        })
        .then((res) => {
          const { mail, telNum, contacts } = res;
          changeParter({ contacts, telNum, mail, faxes: null });
        });
    }
  };

  const pcKindCodeValue = headerFormDs.current && headerFormDs.current?.get('pcKindCode');
  const acceptFlag = headerFormDs.current && headerFormDs.current?.get('acceptFlag');
  const pcStatusCode = headerFormDs.current && headerFormDs.current?.get('pcStatusCode');
  const terminationReason = headerFormDs.current && headerFormDs.current?.get('terminationReason');
  const archiveAttachmentUuid =
    headerFormDs.current && headerFormDs.current?.get('archiveAttachmentUuid');
  const terminateReasonFlag = [
    'TERMINATION_TO_APPROVAL',
    'TERMINATION_CONFIRM',
    'TERMINATION',
  ].includes(headerFormDs.current?.get('pcStatusCode'));

  let pcStatusFlag;
  if (supplementFlag) {
    pcStatusFlag = 3;
  } else if (!supplementFlag && mainContractId && version > 1) {
    pcStatusFlag = 1;
  } else if (['PENDING', 'REJECTED', 'SUPPLIER_REJECTED'].includes(pcStatusCode)) {
    pcStatusFlag = 0;
  } else {
    pcStatusFlag = 2;
  }
  const data = {
    pcHeaderId,
    pcNum,
    mainPcNum: supplementFlag ? mainPcNum : null,
    pcStatusFlag, // 协议状态标识(0新建&审批拒绝&拒绝生效/1变更协议/2生效和其他状态/3补充协议)
  };

  const renderOfflineMutualSignUuid = () => {
    /**
     * 条件1:非补充协议且非电签且状态=待生效/生效审批中/已归档/归档审批中/补充协议中/已确认
     * 条件2:补充协议且非电签且状态=补充完成/待生效/生效审批中
     * 满足条件1或条件2的协议，只读页面需要展示线下签署协议附件
     */
    if (
      !electricSignFlag &&
      ((supplementFlag && pcStatusCode === 'SUPPLEMENT_COMPLETE') ||
        (!supplementFlag &&
          ['ARCHIVE', 'ARCHIVE_TO_APPROVAL', 'REPLENISHING', 'CONFIRMED'].includes(pcStatusCode)) ||
        ['TO_BE_VALID', 'EFFECTED_TO_APPROVAL'].includes(pcStatusCode))
    ) {
      return (
        <Attachment
          readOnly
          viewMode="popup"
          name="offlineMutualSignUuid"
          bucketName={PRIVATE_BUCKET}
        />
      );
    }
    return null;
  };

  /**
   * 二开埋点字段属性
   * 返回格式：
   * {
   *   archiveCode: { isEdit: true },
   *   archiveAttachmentUuid: { readOnly: false },
   * }
   */
  const fieldConfig = remoteWorkDetail
    ? remoteWorkDetail.process(
        'SPCM_WORKSPACE_DETAIL_HEADER_FIELD_CONFIG',
        {},
        { headerProps: props }
      )
    : {};
  const customCodeFlag = remoteWorkDetail
    ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_HEADER_CUSTOMCODE_FLAG', isCreate || isEdit, {
        ...props,
      })
    : isCreate || isEdit;
  const cuxCustomFieldPropsIntercept = remoteWorkDetail
    ? remoteWorkDetail.process(
        'SPCM_WORKSPACE_DETAIL_HEADER_CUSTOMIZE_FIELD_PROPS_INTERCEPT',
        {},
        { headerProps: props }
      )
    : {};

  const silentSealPositionIsView =
    eleSignFlag &&
    ['ESIGN_SAAS', 'FDD_SAAS'].includes(headerFormDs.getState('sealType')) &&
    !isCreate;

  const cuxExtTextRenderIntercept = (extParam, currentMode) =>
    remoteWorkDetail
      ? remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_HEADER_CUSTOMIZE_EXT_TEXT_RENDER_INTERCEPT',
          extTextRender(extParam, currentMode),
          { headerProps: props }
        )
      : extTextRender(extParam, currentMode);

  return (
    <div className={!currentMode ? styles['rfx-card-item-form'] : ''}>
      {customizeCollapseForm(
        {
          code: `SPCM.WORKSPACE_DETAIL.HEADER${customCodeFlag ? '' : '.READONLY'}`,
          disableMaxCol: true,
          dataSet: headerFormDs,
          customFieldPropsIntercept: cuxCustomFieldPropsIntercept,
          extTextRenderIntercept: currentMode
            ? (...extParam) => cuxExtTextRenderIntercept(extParam, currentMode)
            : null,
          // proxyDsCreate,
          // afterCustomizeDs,
        },
        <CollapseForm
          useWidthPercent={isSplitMode ? false : useWidthPercent}
          dataSet={headerFormDs}
          labelLayout={isCreate || isEdit ? 'float' : 'vertical'}
          labelAlign="left"
          className={isCreate || isEdit ? null : 'c7n-pro-vertical-form-display'}
          // showLines={6}
          columns={currentMode ? 2 : isSplitMode ? 1 : 3}
          custLoading={custLoading}
          // formRef={setRfxInfoRef}
        >
          <ConstructForm
            formType="TextField"
            isEdit={isEdit || isCreate}
            name="pcName"
            className={getClassName('pcName')}
            // colSpan={2}
            onChange={handlePcName}
            dataSet={headerFormDs}
          />
          <ConstructForm
            className={getClassName('pcNum')}
            formType="TextField"
            disabled
            isEdit={isEdit || isCreate}
            name="pcNum"
            dataSet={headerFormDs}
          />
          <ConstructForm
            formType="TextField"
            disabled
            isEdit={isEdit || isCreate}
            name="taxIncludeAmount"
            className={getClassName('taxIncludeAmount')}
            renderer={({ value }) =>
              taxIncludeAmountChinese
                ? `${renderThousandthNum(value, 2)}${
                    taxIncludeAmountChinese === '-' ||
                    !['RMB', 'CNY', 'BB01'].includes(purchaseCurrencyCode)
                      ? ''
                      : `（${taxIncludeAmountChinese}）`
                  }`
                : ''
            }
            dataSet={headerFormDs}
          />
          <ConstructForm
            className={getClassName('companyId')}
            formType="Lov"
            isEdit={isEdit || isCreate}
            disabled={isEdit}
            name="companyIdLov"
            onChange={(value) => handleCompanyIdLov(value)}
            headerProps={props}
            dataSet={headerFormDs}
            aiIconFieldCode="companyName"
            {...(fieldConfig?.companyIdLov || {})}
          />
          <ConstructForm
            className={getClassName('ouId')}
            formType="Lov"
            isEdit={isEdit || isCreate}
            name="ouIdLov"
            dataSet={headerFormDs}
          />
          <ConstructForm
            className={getClassName('purchaseOrgId')}
            formType="Lov"
            isEdit={isEdit || isCreate}
            name="purchaseOrgIdLov"
            dataSet={headerFormDs}
          />
          <ConstructForm
            className={getClassName('purchaseAgentId')}
            formType="Lov"
            isEdit={isEdit || isCreate}
            onChange={handleChangeAgent}
            name="purchaseAgentIdLov"
            dataSet={headerFormDs}
          />
          {pcKindCodeValue === 'NOT_SYS_SUPPLIER' ? (
            <ConstructForm
              className={getClassName('supplierCompanyName')}
              formType="TextField"
              isEdit={isEdit || isCreate}
              name="supplierCompanyName"
              onChange={handleChangeSupplier}
              dataSet={headerFormDs}
            />
          ) : (
            <ConstructForm
              className={getClassName('supplierCompanyId')}
              formType="SupplierLov"
              isEdit={isEdit || isCreate}
              name="supplierCompanyIdLov"
              dataSet={headerFormDs}
              aiIconFieldCode={
                !supplierCompanyName && supplierName ? 'supplierName' : 'supplierCompanyName'
              }
              queryData={{ companyId: headerFormDs?.current?.get('companyId') }}
              onChange={(data) => handleSupplierLovChange(data)}
              modalProps={{
                onOk: handleSupplierLovChange,
              }}
            />
          )}
          <ConstructForm
            formType="Select"
            isEdit={isEdit || isCreate}
            disabled={isEdit}
            name="pcKindCode"
            className={getClassName('pcKindCode')}
            onChange={(val) => handleChangePcKindCode(val)}
            optionsFilter={handleFilterPcKindCode}
            headerProps={props}
          />
          <ConstructForm
            className={getClassName('pcTypeId')}
            formType="Lov"
            name="pcTypeIdLov"
            onChange={(record) => handlepcTypeIdLov(record)}
            isEdit={isEdit || isCreate}
            disabled={isEdit}
            dataSet={headerFormDs}
            {...(fieldConfig?.pcTypeIdLov || {})}
          />
          {!['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCodeValue) && (
            <ConstructForm
              className={getClassName('pcTemplateId')}
              formType="Lov"
              isEdit={isCreate || isEdit}
              name="pcTemplateIdLov"
              {...(fieldConfig?.pcTemplateIdLov || {})}
            />
          )}
          {/* 租户在白名单中，且，协议性质=附件合同（普通）/附件合同（框架）显示 */}
          {attachmentSupportUpload &&
            ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCodeValue) && (
              <ConstructForm
                className={getClassName('pcAttachmentTemplateId')}
                formType="Lov"
                isEdit={isCreate || isEdit}
                name="pcAttachmentTemplateId"
              />
            )}
          {!!acceptFlag && (
            <ConstructForm
              formType="Select"
              className={getClassName('acceptType')}
              isEdit={isEdit || isCreate}
              name="acceptType"
              optionsFilter={handleFilterAcceptType}
            />
          )}
          <ConstructForm
            className={getClassName('startDateActive')}
            formType="DatePicker"
            isEdit={isEdit || isCreate}
            name="startDateActive"
            onChange={(val) => handleChangeDate({ startDateActive: val })}
            dataSet={headerFormDs}
          />
          <ConstructForm
            className={getClassName('endDateActive')}
            formType="DatePicker"
            isEdit={isEdit || isCreate}
            name="endDateActive"
            onChange={(val) => handleChangeDate({ endDateActive: val })}
            dataSet={headerFormDs}
          />
          <ConstructForm
            className={getClassName('mainContractId')}
            formType="Lov"
            isEdit={isEdit || isCreate}
            name="mainContractIdLov"
            onChange={handleChangeMainContract}
          />
          <ConstructForm
            name="pcSourceCode"
            formType="TextField"
            isEdit={isEdit || isCreate}
            disabled
            // className={getClassName('pcSourceCode')}
            renderer={({ record }) => {
              return record && record.data && record.data.pcSourceCodeMeaning;
            }}
          />
          <ConstructForm
            formType="TextArea"
            isEdit={isEdit || isCreate}
            name="remark"
            resize="both"
            className={getClassName('remark')}
          />
          <ConstructForm
            name="createByRealName"
            formType="TextField"
            isEdit={isEdit || isCreate}
            disabled
          />
          <ConstructForm
            className={getClassName('creationDate')}
            formType="DateTimePicker"
            model="dateTime"
            isEdit={isEdit || isCreate}
            disabled
            name="creationDate"
          />
          <ConstructForm
            className={getClassName('signEffectFlag')}
            formType="CheckBox"
            isEdit={isEdit || isCreate}
            name="signEffectFlag"
            onChange={(value) => handleChangeContractDate(value)}
          />
          <ConstructForm
            className={getClassName('effectiveTime')}
            formType="TextField"
            isEdit={isEdit || isCreate}
            name="effectiveTime"
            addonAfter={intl.get(`spcm.common.model.days`).d('天')}
            renderer={({ value }) =>
              value
                ? isEdit || isCreate
                  ? value
                  : `${value}${intl.get(`spcm.common.model.days`).d('天')}`
                : ''
            }
          />
          <ConstructForm
            className={getClassName('contractPurpose')}
            formType="Select"
            isEdit={isEdit || isCreate}
            name="contractPurpose"
          />
          <ConstructForm
            className={getClassName('companyOrgId')}
            formType="Lov"
            isEdit={isEdit || isCreate}
            name="companyOrgIdLov"
          />
          <ConstructForm
            className={getClassName('costAnchDepId')}
            formType="Lov"
            isEdit={isEdit || isCreate}
            name="costAnchDepIdLov"
          />
          <ConstructForm
            className={getClassName('overseasProcurement')}
            formType="CheckBox"
            isEdit={isEdit || isCreate}
            name="overseasProcurement"
          />
          <ConstructForm
            className={getClassName('archiveCode')}
            formType="TextField"
            isEdit={isEdit || isCreate}
            name="archiveCode"
            {...(fieldConfig?.archiveCode || {})}
          />
          <ConstructForm
            className={getClassName('globalFlag')}
            formType="CheckBox"
            isEdit={isEdit || isCreate}
            name="globalFlag"
          />
          {pcSourceCode === 'PURCHASE_ORDER' && (
            <ConstructForm
              className={getClassName('termsName')}
              formType="TextField"
              name="termsName"
            />
          )}
          <ConstructForm
            className={getClassName('signDescription')}
            formType="TextField"
            isEdit={isEdit || isCreate}
            name="signDescription"
            dataSet={headerFormDs}
          />
          {terminateReasonFlag && (
            <ConstructForm
              formType="TextField"
              isEdit={isEdit || isCreate}
              name="terminationReason"
              className={getClassName('terminationReason')}
            />
          )}
          <ConstructForm
            className={getClassName('signAddress')}
            formType="TextField"
            isEdit={isEdit || isCreate}
            name="signAddress"
            dataSet={headerFormDs}
          />
          <Output
            name="signatureTypeMeaning"
            className={getClassName('signatureTypeMeaning')}
            renderer={({ record }) => {
              if (record) {
                const authType = record.get('authType');
                const electricSignFlag = record.get('electricSignFlag');
                const signatureType = record.get('signatureType');
                const signatureTypeMeaning = record.get('signatureTypeMeaning');
                if (electricSignFlag === 1 && authType === 'ESIGN') {
                  if (
                    ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCodeValue) &&
                    signatureType === 'TEXT_SIGNATURE'
                  ) {
                    return '';
                  }
                  return signatureTypeMeaning;
                }
              }
            }}
          />
          <ConstructForm
            className={getClassName('paperDeliveryMethod')}
            formType="Select"
            name="paperDeliveryMethod"
          />
          <ConstructForm
            className={getClassName('paperDeliveryInfo')}
            formType="TextField"
            name="paperDeliveryInfo"
          />
          <ConstructForm
            className={getClassName('legalContractNum')}
            formType="TextField"
            isEdit={isEdit || isCreate}
            name="legalContractNum"
          />
          <ConstructForm
            formType="Lov"
            className={getClassName('unitId')}
            isEdit={isEdit || isCreate}
            name="unitIdLov"
          />
          <ConstructForm
            formType="Lov"
            className={getClassName('creatorUnitId')}
            isEdit={isEdit || isCreate}
            name="creatorUnitId"
            headerProps={props}
          />
          {purchaseFlag && (
            <ConstructForm
              formType="TextArea"
              isEdit={isEdit || isCreate}
              name="internalPostil"
              className={getClassName('internalPostil')}
              resize="both"
            />
          )}
          {terminationReason && (
            <Attachment
              readOnly
              viewMode="popup"
              name="terminationAttachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="purchaser-attachment"
            />
          )}
          {(pcStatusCode === 'ARCHIVE' || archiveAttachmentUuid) && (
            <Attachment
              readOnly
              viewMode="popup"
              name="archiveAttachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spcm-supplier"
              {...(fieldConfig?.archiveAttachmentUuid || {})}
            />
          )}
          {renderOfflineMutualSignUuid()}
          <Output name="taxIncludeAmountChinese" />
          <Output name="amountChinese" />
          <Output name="pcHeaderTaxAmountChinese" />
          <Output name="totalQuantity" />
          <Output name="totalSecondaryQuantity" />
          <Output name="contractCalculateMethod" />
          <ConstructForm
            name="cnfApplicability"
            formType="Select"
            isEdit={isEdit || isCreate}
            className={getClassName('cnfApplicability')}
          />
          <ConstructForm
            name="controlApplicability"
            isEdit={isEdit || isCreate}
            formType="Select"
            showHelp="tooltip"
            hidden={cnfApplicability !== '2'}
            className={getClassName('controlApplicability')}
          />
          {payPlanNum && (
            <Output
              name="payPlanNum"
              className={getClassName('payPlanNum')}
              renderer={({ record }) => (
                <a
                  onClick={() => {
                    return openTermsModal({ record: headerInfoCurrent }, data);
                  }}
                  // 原协议（未发生过变更、升版本、补充），在新建、审批拒绝、拒绝生效（可编辑的状态下），付款计划不可点击
                  disabled={!supplementFlag && version === 1 && pcStatusFlag === 0}
                >
                  {record?.get('payPlanNum')}
                </a>
              )}
            />
          )}
          <Output
            name="amountControlDimension"
            renderer={({ record }) => record?.get('amountControlDimensionMeaning')}
          />
          <Output
            name="manuallyModifyAmount"
            renderer={({ value }) => (isNil(value) ? '-' : yesOrNoRender(+value))}
          />
          <Output
            name="limitAmountField"
            renderer={({ record }) => record?.get('limitAmountFieldMeaning')}
          />
          <Output
            name="amountControlType"
            renderer={({ record }) => record?.get('amountControlTypeMeaning')}
          />
          <Output name="strategyNum" />
          <ConstructForm
            formType="NumberField"
            name="maxContractAmount"
            hidden={!maxContractAmountFlag}
            isEdit={isEdit && maxContractAmountFlag}
          />
          <Output name="maxContractAmountChinese" />
          <Output name="taxIncludeOccupiedAmount" hidden={amountControlDimension !== 'HEAD'} />
          <Output name="occupiedAmount" hidden={amountControlDimension !== 'HEAD'} />
          <Output name="contractTemplateLang" />
          <Output
            name="amountField"
            showHelp="label"
            renderer={({ record }) => record?.get('amountFieldMeaning')}
          />
          <Output
            name="occupyRecords"
            hidden={amountControlDimension !== 'HEAD'}
            renderer={({ record }) => <OccupyModal record={record} />}
          />
          <ConstructForm
            formType="NumberField"
            disabled
            isEdit={isEdit || isCreate}
            name="originalDbTaxIncludeAmount"
          />
          <ConstructForm
            formType="NumberField"
            disabled
            isEdit={isEdit || isCreate}
            name="originalDbAmount"
          />
          <Output name="originalDbTaxIncludeAmountChinese" />
          <Output name="originalDbAmountChinese" />
          <ConstructForm
            formType="NumberField"
            name="orderOccupiedAmountRatio"
            hidden={amountControlDimension !== 'HEAD'}
            isEdit={isCreate || isEdit}
            disabled
            showHelp={isCreate || isEdit ? 'tooltip' : 'label'}
          />
          {!isCreate && eleSignFlag && (
            <ConstructForm
              formType="Lov"
              className={getClassName('electronicOrderType')}
              isEdit={isEdit}
              name="electronicOrderType"
            />
          )}
          {silentSealPositionIsView && (
            <ConstructForm
              formType="NumberField"
              isEdit={isEdit}
              name="silentSealPositionY"
              showHelp={isEdit ? 'tooltip' : 'label'}
            />
          )}
          {remoteWorkDetail
            ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_HEADER_FORM_ITEM', <></>, {
                props,
              })
            : null}
        </CollapseForm>
      )}
    </div>
  );
});

export default memo(RfxInfoDS);
