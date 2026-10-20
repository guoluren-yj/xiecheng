/**
 * OrganizationAndStaffForm.js - 采购组织及人员
 * @date: 2021-08-02
 * @author: yujie.shao@going-link.com
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Form, Lov, DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { action } from 'mobx';

import OrganizationAndStaffFormDS from './OrganizationAndStaffFormDS';
// import Style from './index.less';
import { ComponentDiffLovRender } from './utils';
import ApplyToOtherSection from './ApplyToOtherSection';

export default class OrganizationAndStaffForm extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.OrganizationAndStaffFormDS = new DataSet(OrganizationAndStaffFormDS(props.bidFlag));
  }

  getBidLov(newDataList, oldDataList) {
    const list = [];
    let flag = true;
    newDataList.forEach((newItem) => {
      flag = true;
      oldDataList.forEach((oldItem) => {
        if (newItem.id === oldItem.id) {
          flag = false;
          list.push({ ...newItem, ...oldItem });
        }
      });
      if (flag) {
        list.push(newItem);
      }
    });
    return list;
  }

  // 寻源小组数据整合
  rfxMemberListData() {
    const orgInfo = this.OrganizationAndStaffFormDS.current.data;

    // const commonParams = {}
    let rfxMemberList = [];
    if (isEmpty(orgInfo)) {
      return rfxMemberList;
    }

    const {
      openBidLov = [],
      prequalCheckerLov = [],
      inquierLov = [],
      checkPriceLov = [],
      passwordFlag = 0,
      currentListDTO = {},
      observeLov = [],
    } = orgInfo || {};

    const {
      openBidLov: oldOpenBidLov,
      prequalCheckerLov: oldPrequalCheckerLov,
      inquierLov: oldInquierLov,
      checkPriceLov: oldCheckPriceLov,
      observeLov: oldObserveLov,
    } = currentListDTO;

    const getLovData = (newDataList = [], type = null, oldDataList = []) => {
      if (isEmpty(newDataList) || !type) {
        return [];
      }

      const list = [];
      let flag = true;
      newDataList.forEach((newItem) => {
        flag = true;
        oldDataList.forEach((oldItem) => {
          if (newItem.id === oldItem.id) {
            flag = false;
            list.push({ ...oldItem, ...newItem });
          }
        });
        if (flag) {
          list.push({
            ...newItem,
            userId: newItem.userId || newItem.id,
            id: newItem.userId || newItem.id,
            passwordFlag,
            rfxRole: newItem.rfxRole || type,
          });
        }
      });
      return list;
    };

    const getSingleLovData = (item = [], type = null, oldData) => {
      if (isEmpty(item) || !type) {
        return {};
      }

      return {
        ...oldData,
        ...item,
        // ...commonParams,
        userId: item.userId || item.id,
        passwordFlag,
        rfxRole: item.rfxRole || type,
      };
    };

    rfxMemberList = [
      ...getLovData(openBidLov, 'OPENED_BY', oldOpenBidLov),
      getSingleLovData(prequalCheckerLov, 'PRETRIAL_BY', oldPrequalCheckerLov),
      getSingleLovData(inquierLov, 'RFX_BY', oldInquierLov),
      getSingleLovData(checkPriceLov, 'CHECKED_BY', oldCheckPriceLov),
      ...getLovData(observeLov, 'OBSERVE_BY', oldObserveLov),
    ].filter((item) => !isEmpty(item));

    this.OrganizationAndStaffFormDS.current.set('rfxMemberAdjustList', rfxMemberList);

    return this.OrganizationAndStaffFormDS?.current.toJSONData();
  }

  // 处理采购组织及人员字段
  getBidMemberList(data = []) {
    const openBidLov = [];
    let prequalCheckerLov = {};
    let inquierLov = {};
    let checkPriceLov = {};
    const observeLov = [];

    if (!Array.isArray(data) || isEmpty(data)) {
      return {};
    }

    data.forEach((item) => {
      const { rfxRole = null } = item;
      if (rfxRole === 'OPENED_BY') {
        openBidLov.push(item);
      }
      if (rfxRole === 'PRETRIAL_BY') {
        prequalCheckerLov = Object.assign({}, item);
      }
      if (rfxRole === 'RFX_BY') {
        inquierLov = Object.assign({}, item);
      }
      if (rfxRole === 'CHECKED_BY') {
        checkPriceLov = Object.assign({}, item);
      }
      if (rfxRole === 'OBSERVE_BY') {
        observeLov.push(item);
      }
    });

    const bidMemberList = {
      openBidLov,
      prequalCheckerLov,
      inquierLov,
      checkPriceLov,
      observeLov,
    };

    // 处理采购组织成员字段，如果上述对象中key对应的value为空，则设置初始值为undefined，以解决个性化校验不生效问题
    const filterBidMemberList = {};

    Object.keys(bidMemberList).forEach((key) => {
      filterBidMemberList[key] = isEmpty(bidMemberList[key]) ? undefined : bidMemberList[key];
    });

    return filterBidMemberList;
  }

  // 初始化ds
  @action
  initDSFields(result = []) {
    const { header: { rfxHeaderBaseInfoAdjustDTO = {} } = {} } = this.props;
    const {
      openerFlag = 0,
      sealedQuotationFlag = 0,
      pretrialFlag = 0,
      allOpenedFlag = 0,
      pretrialStatus = '',
    } = rfxHeaderBaseInfoAdjustDTO || {};
    const judgeFlag = {
      openerFlag,
      sealedQuotationFlag,
      pretrialFlag,
      allOpenedFlag,
      pretrialStatus,
    };
    const { rfxMemberAdjustList = {}, rfxMemberHisList = {} } = result[0] ? result[0] : {};
    // const { openBidLov = [] } = rfxMemberAdjustList;
    const lovMemberLst = this.getBidMemberList(rfxMemberAdjustList) || {};
    const lovMemberHisList = this.getBidMemberList(rfxMemberHisList) || {};
    // const passwordFlag = !isEmpty(openBidLov) ? openBidLov[0].passwordFlag : 0;
    const currentDTO = { currentListDTO: lovMemberLst };
    const historyDTO = { historyCompareDTO: lovMemberHisList };
    this.OrganizationAndStaffFormDS.loadData([
      { ...result[0], ...lovMemberLst, ...historyDTO, ...currentDTO, ...judgeFlag },
    ]);
    this.forceUpdate();
  }

  // 开标员lov
  @Bind()
  changeOpenBidLov(data = {}) {
    this.OrganizationAndStaffFormDS.current.set('openBidLov', data);
  }

  render() {
    const {
      customizeForm,
      custLoading,
      header = {},
      custKey,
      rfxId,
      organizationId,
      handleSave,
      isSection,
      remote,
      newBiddingFlag = false,
    } = this.props;
    const { rfxHeaderBaseInfoAdjustDTO } = header || {};
    const { openerFlag = 0, sealedQuotationFlag = 0, pretrialFlag = 0 } =
      rfxHeaderBaseInfoAdjustDTO || {};
    const record = this.OrganizationAndStaffFormDS;
    const applyToOtherSectionProps = {
      rfxId,
      handleSave,
      organizationId,
      adjustType: 'PURCHASE',
      remote,
    };

    return (
      <div>
        {customizeForm(
          {
            code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF`,
            dataSet: this.OrganizationAndStaffFormDS,
          },
          <Form
            dataSet={this.OrganizationAndStaffFormDS}
            labelLayout="float"
            columns={3}
            custLoading={custLoading}
            useWidthPercent
          >
            {!!openerFlag && !!sealedQuotationFlag && (
              <ComponentDiffLovRender
                record={record}
                historyDTO="historyCompareDTO"
                lovName="openBidLov"
                name="openBidLov"
                textName="realName"
                bindId="id"
              >
                {/* 询价单关联的寻源模板-启用了开标人、询价单密封报价时，显示该字段 */}
                <Lov name="openBidLov" onChange={(value) => this.changeOpenBidLov(value)} />
              </ComponentDiffLovRender>
            )}
            {!!pretrialFlag && (
              <ComponentDiffLovRender
                record={record}
                historyDTO="historyCompareDTO"
                lovName="prequalCheckerLov"
                name="prequalCheckerLov"
                textName="realName"
                bindId="id"
              >
                {/* 寻源模板启用【询价初审】时，显示该字段  */}
                <Lov name="prequalCheckerLov" />
              </ComponentDiffLovRender>
            )}

            <ComponentDiffLovRender
              record={record}
              historyDTO="historyCompareDTO"
              lovName="inquierLov"
              name="inquierLov"
              textName="realName"
              bindId="id"
            >
              <Lov name="inquierLov" />
            </ComponentDiffLovRender>

            <ComponentDiffLovRender
              record={record}
              historyDTO="historyCompareDTO"
              lovName="checkPriceLov"
              name="checkPriceLov"
              textName="realName"
              bindId="id"
            >
              <Lov name="checkPriceLov" />
            </ComponentDiffLovRender>
            <ComponentDiffLovRender
              record={record}
              historyDTO="historyCompareDTO"
              lovName="observeLov"
              name="observeLov"
              textName="realName"
              bindId="id"
            >
              <Lov name="observeLov" />
            </ComponentDiffLovRender>
          </Form>
        )}
        {isSection && !newBiddingFlag && <ApplyToOtherSection {...applyToOtherSectionProps} />}
      </div>
    );
  }
}
