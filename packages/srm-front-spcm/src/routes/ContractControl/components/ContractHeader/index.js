import React, { Component } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';
import querystring from 'querystring';
import { withRouter } from 'react-router-dom';
import { yesOrNoRender } from 'utils/renderer';
import { renderThousandthNum, openTermsModal, tirmSpecialCode } from '@/utils/util';
// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentUser } from 'utils/utils';

import intl from 'utils/intl';

import ConstructForm from './ConstructForm';

@withRouter
export default class ContractHeader extends Component {
  useInfo = getCurrentUser();

  handleFormUpdate = (params, eventProps) => {
    const { remote, pcSubjectDs, headerFormDs } = this.props;
    const { name } = params;
    // 业务实体修改，清空标的行库存组织
    if (name === 'ouIdLov' && pcSubjectDs.length) {
      pcSubjectDs.forEach((record) => {
        record.set({
          invOrganizationIdLov: null,
        });
      });
      headerFormDs.current.set('checkOuInvRelFlag', 1);
    }
    if (remote?.event) {
      remote.event.fireEvent('handleFormUpdate', { params, eventProps });
    }
  };

  componentDidMount() {
    this.props.headerFormDs.addEventListener('update', (params) =>
      this.handleFormUpdate(params, this.props)
    );
    const { remote } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('headerComponentDidMount', { current: this });
    }
  }

  componentWillUnmount() {
    this.props.headerFormDs.removeEventListener('update', (params) =>
      this.handleFormUpdate(params, this.props)
    );
  }

  /**
   * 去除协议名称的特殊字符
   * @param {string} val
   */
  @Bind
  handlePcName(val) {
    this.props.headerFormDs.current.set('pcName', tirmSpecialCode(val));
  }

  @Bind()
  handleChangeContractDate(value) {
    const { headerFormDs } = this.props;
    if (value) {
      headerFormDs.current.set('startDateActive', null);
      headerFormDs.current.set('endDateActive', null);
    } else {
      headerFormDs.current.set('effectiveTime', null);
    }
  }

  @Bind()
  handleGetCode(routerParams) {
    const { unitCodeList } = this.props;
    if (routerParams.hasChanged === 'true') {
      return unitCodeList?.DETAIL || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL';
    } else {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY';
    }
  }

  @Bind()
  handleFilterPcKindCode(record) {
    const {
      headerInfo: {
        pcSourceCode,
        executionStrategyCode,
        secondLevelStrategyCode,
        orderSecondLevelStrategyCode,
      },
      _linkFlag,
    } = this.props;
    if (
      record.get('value') === 'NOT_SYS_SUPPLIER' &&
      [
        'SEARCH_SOURCE_RESULT',
        'PURCHASE_NEED',
        'PURCHASE_ORDER',
        '采购申请',
        '寻源结果',
        '采购订单',
      ].includes(pcSourceCode)
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
  }

  /**
   * 更新伙伴联系人信息
   * @param {object} contacts 联系人信息
   */
  @Bind()
  changeParter(contacts) {
    const { partnerDs, partnerList = [], headerFormDs } = this.props;
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
  }

  /**
   * 采购员变化更新伙伴信息联系人等信息
   */
  @Bind()
  handleChangeAgent(values) {
    const { partnerDs, headerFormDs } = this.props;
    const { realName, email } = this.useInfo;
    const companyId = headerFormDs?.current?.get('companyId');
    if (partnerDs && values) {
      const {
        purchaseAgentName,
        purchaseAgentPhone,
        purchaseAgentFax,
        purchaseAgentEmail,
        userRealNames,
      } = values || {};
      // 当前操作人若为采购员指定用户，则取操作人子账户邮箱；否则为空
      const isPurUser = (userRealNames?.split(',') || []).includes(realName);
      this.changeParter({
        contacts: purchaseAgentName,
        telNum: purchaseAgentPhone,
        faxes: purchaseAgentFax,
        mail: isPurUser ? email : purchaseAgentEmail,
      });
    } else if (partnerDs && companyId) {
      this.props
        .dispatch({
          type: 'contractCommon/fetchContactByCompany',
          payload: companyId,
        })
        .then((res) => {
          const { mail, telNum, contacts } = res;
          this.changeParter({ contacts, telNum, mail, faxes: null });
        });
    }
  }

  // 过滤验收类型
  @Bind()
  handleFilterAcceptType(record) {
    const {
      headerInfo: { pcSourceCode, executionStrategyCode },
      _linkFlag,
    } = this.props;
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
  }

  render() {
    // isMaintain true 拟制界面 协议性质、公司、业务实体、采购组织、协议类型、协议模板、协议用途
    const {
      headerFormDs,
      customizeForm,
      headerInfo,
      editable = false,
      isMaintain = false,
      purchaseFlag,
      terminateReasonFlag,
      headerInfo: {
        pcKindCode,
        taxIncludeAmountChinese,
        pcSourceCode,
        acceptFlag,
        amountControlDimension,
        manuallyModifyAmount,
        electricSignFlag: signFlag,
        authType,
      },
      location: { search },
      pcStatusCode,
      remote,
    } = this.props;
    const pcKindCodeValue =
      (headerFormDs.current && headerFormDs.current.get('pcKindCode')) || pcKindCode;
    const routerParams = querystring.parse(search.substr(1));
    const headerInfoCurrent = headerFormDs?.toJSONData()[0] || {};
    const {
      pcHeaderId,
      supplementFlag,
      mainContractId,
      version,
      pcNum,
      payPlanNum,
      mainPcNum,
      cnfApplicability,
    } = headerInfoCurrent;
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
    const maxContractAmountFlag = amountControlDimension === 'HEAD' && manuallyModifyAmount === '1';
    const data = {
      pcHeaderId,
      pcNum,
      mainPcNum: supplementFlag ? mainPcNum : null,
      pcStatusFlag, // 协议状态标识(0新建&审批拒绝&拒绝生效/1变更协议/2生效和其他状态/3补充协议)
    };
    const electricAndSaasSignFlag =
      Number(signFlag) === 1 && ['ESIGN_SAAS', 'FDD_SAAS'].includes(authType);
    return customizeForm(
      {
        code: this.handleGetCode(routerParams),
        dataSource: headerInfo,
        dataSet: headerFormDs,
      },
      <Form dataSet={headerFormDs} columns={3} labelAlign="left">
        <ConstructForm
          formType="TextField"
          isEdit={editable}
          name="pcName"
          colSpan={2}
          onChange={this.handlePcName}
        />
        <Output newLine name="pcNum" />
        <Output name="creationDate" />
        <Output
          name="taxIncludeAmount"
          renderer={({ value }) =>
            taxIncludeAmountChinese
              ? `${renderThousandthNum(value, 2)}${
                  taxIncludeAmountChinese === '-' ? '' : `（${taxIncludeAmountChinese}）`
                }`
              : ''
          }
        />
        <Output name="createByRealName" />
        <ConstructForm
          formType="Select"
          isEdit={editable && isMaintain}
          name="pcKindCode"
          optionsFilter={this.handleFilterPcKindCode}
        />
        <ConstructForm formType="Lov" name="companyIdLov" />
        <ConstructForm formType="Lov" isEdit={editable} name="ouIdLov" />
        <ConstructForm formType="Lov" isEdit={editable} name="purchaseOrgIdLov" />
        <ConstructForm formType="Lov" name="pcTypeIdLov" />
        {!['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCodeValue) && (
          <ConstructForm formType="Lov" isEdit={editable} name="pcTemplateIdLov" />
        )}
        <ConstructForm
          formType="Lov"
          isEdit={editable}
          name="purchaseAgentId"
          onChange={this.handleChangeAgent}
        />
        <ConstructForm
          formType="Lov"
          isEdit={editable && isMaintain}
          name="supplierCompanyIdLov"
          renderer={({ record }) => {
            return (
              record && record.data && (record.data.supplierCompanyName || record.data.supplierName)
            );
          }}
        />
        <ConstructForm
          formType="Switch"
          isEdit={editable}
          name="signEffectFlag"
          onChange={(value) => this.handleChangeContractDate(value)}
        />
        <ConstructForm
          formType="TextField"
          isEdit={editable}
          name="effectiveTime"
          addonAfter={intl.get(`spcm.common.model.days`).d('天')}
          renderer={({ value }) =>
            value
              ? editable
                ? value
                : `${value}${intl.get(`spcm.common.model.days`).d('天')}`
              : ''
          }
        />
        {!!acceptFlag && (
          <ConstructForm
            formType="Select"
            isEdit={editable}
            name="acceptType"
            optionsFilter={this.handleFilterAcceptType}
          />
        )}
        <ConstructForm formType="DatePicker" isEdit={editable} name="startDateActive" />
        <ConstructForm formType="DatePicker" isEdit={editable} name="endDateActive" />
        <ConstructForm formType="Lov" isEdit={editable} name="mainContractIdLov" />
        <ConstructForm formType="Lov" isEdit={editable} name="companyOrgIdLov" />
        <ConstructForm formType="Lov" isEdit={editable} name="costAnchDepIdLov" />
        <ConstructForm formType="Switch" isEdit={editable} name="overseasProcurement" />
        <ConstructForm formType="TextField" isEdit={editable} name="archiveCode" />
        <Output
          name="pcSourceCode"
          renderer={({ record }) => {
            return record && record.data && record.data.pcSourceCodeMeaning;
          }}
        />
        <ConstructForm formType="Switch" isEdit={editable} name="globalFlag" />
        <ConstructForm formType="Select" isEdit={editable && !isMaintain} name="contractPurpose" />
        <ConstructForm formType="TextField" isEdit={editable} name="signDescription" />
        <ConstructForm formType="TextField" isEdit={editable} name="signAddress" />
        {terminateReasonFlag && (
          <ConstructForm formType="TextField" isEdit={editable} name="terminationReason" />
        )}
        {pcSourceCode === 'PURCHASE_ORDER' && (
          <ConstructForm formType="TextField" name="termsName" />
        )}
        <ConstructForm formType="Lov" isEdit={editable} name="unitIdLov" />
        <ConstructForm formType="Lov" isEdit={editable} name="creatorUnitId" />
        {purchaseFlag && (
          <ConstructForm
            formType="TextArea"
            isEdit={editable}
            name="internalPostil"
            resize="both"
          />
        )}
        <ConstructForm formType="TextArea" isEdit={editable} name="remark" resize="both" />
        <Output
          name="signatureTypeMeaning"
          renderer={({ record }) => {
            if (record) {
              const authType = record.get('authType');
              const electricSignFlag = record.get('electricSignFlag');
              const signatureType = record.get('signatureType');
              const signatureTypeMeaning = record.get('signatureTypeMeaning');
              if ((electricSignFlag === 1 || pcStatusCode === 'PENDING') && authType === 'ESIGN') {
                if (
                  ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCodeValue) &&
                  signatureType === 'TEXT_SIGNATURE'
                ) {
                  return '';
                }
                return signatureTypeMeaning;
              } else {
                return '';
              }
            }
          }}
        />
        <Output name="taxIncludeAmountChinese" />
        <Output name="amountChinese" />
        <Output name="pcHeaderTaxAmountChinese" />
        <Output name="totalQuantity" />
        <Output name="totalSecondaryQuantity" />
        <Output name="contractCalculateMethod" />
        <ConstructForm name="cnfApplicability" formType="Select" isEdit={editable} />
        <ConstructForm
          name="controlApplicability"
          isEdit={editable}
          formType="Select"
          showHelp="tooltip"
          hidden={cnfApplicability !== '2'}
        />
        {payPlanNum && (
          <Output
            name="payPlanNum"
            renderer={({ record }) => (
              <a
                onClick={() => {
                  return openTermsModal({ record: headerInfoCurrent }, data);
                }}
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
          isEdit={editable && maxContractAmountFlag}
        />
        <Output name="maxContractAmountChinese" />
        <Output name="taxIncludeOccupiedAmount" hidden={amountControlDimension !== 'HEAD'} />
        <Output name="occupiedAmount" hidden={amountControlDimension !== 'HEAD'} />
        <Output
          name="amountField"
          showHelp="label"
          renderer={({ record }) => record?.get('amountFieldMeaning')}
        />
        <ConstructForm
          formType="NumberField"
          name="orderOccupiedAmountRatio"
          hidden={amountControlDimension !== 'HEAD'}
          isEdit={editable}
          disabled
          showHelp="label"
        />
        <Output name="silentSealPositionY" hidden={!electricAndSaasSignFlag} />
        {remote
          ? remote.process('SPCM_CONTROL_DETAIL_HEADER_FORM_ITEM', <></>, {
              props: this.props,
            })
          : null}
      </Form>
    );
  }
}
