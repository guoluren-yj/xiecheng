/**
 * ApplyToProject - 引用申请转立项
 */

import React, { Component, createRef } from 'react';
import intl from 'utils/intl';
import { isEmpty, isNil, compose } from 'lodash';
import querystring from 'querystring';
import { Debounce } from 'lodash-decorators';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { queryEnableDoubleUnit } from '@/services/commonService';
import { createQuoteApproval } from '@/services/projectSetupService';
import { newBatchValidatePurchase } from '@/services/inquiryHallService';
import { applyToNotification, isText, getTableFixSelfAdaptStyle } from '@/utils/utils';
import { getPromptMessage } from '@/routes/components/ConfirmModal';

import PurchaseRequestContent from '../PurchaseRequestContent.js';
import PurchaseRequestDS from '../PurchaseRequestDS.js';

class ApplyToProject extends Component {
  constructor(props) {
    super(props);
    if (props?.onRef) {
      props.onRef(this);
    }

    this.organizationId = getCurrentOrganizationId();

    this.purchaseRequestDs = new DataSet(PurchaseRequestDS());

    this.contentRef = createRef();

    this.pageLoading = false;

    this.state = {
      loading: false,
      doubleUnitFlag: false,
    };
  }

  toggleLoading = (loading = false) => {
    this.pageLoading = loading;
    this.setState({
      loading,
    });
  };

  componentDidMount() {
    this.queryDoubleUnit();
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.purchaseRequestDs.setState('doubleUnitFlag', !!Number(res));
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  clearDsSelect = () => {
    this.purchaseRequestDs.clearCachedSelected();
    this.purchaseRequestDs.unSelectAll();
  };

  setContentRef = (ref) => {
    this.contentRef = ref || {};
  };

  @Debounce(300)
  create = async () => {
    const { organizationId } = this;
    const { history, location } = this.props;

    const { selected } = this.purchaseRequestDs || {};
    const selectedRowKeys = selected.map((ele) => ele.toData().prLineId);
    const { routeFrom } = querystring.parse(location.search.substr(1));
    const search = querystring.stringify({
      pubFlag: routeFrom,
    });
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.message.pleaseSelectAtleastOneData')
          .d('请至少选择一条数据'),
      });
      return false;
    }
    const res = await newBatchValidatePurchase({
      organizationId,
      prLineIdList: selectedRowKeys,
      customizeUnitCode: 'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT_NEW.LIST',
      configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
      sourceDocumentType: 'PROJECT',
    });

    this.toggleLoading(true);
    if (getResponse(res)) {
      const { secondaryUomInconsistentFlag, highestValidatorType, secondaryUomInconsistentMes } =
        res || {};
      const onOk = () => {
        if (secondaryUomInconsistentFlag === 1) {
          applyToNotification(secondaryUomInconsistentMes);
        }
        return createQuoteApproval({
          organizationId,
          prLineIdList: selectedRowKeys,
        }).then((response) => {
          this.toggleLoading();
          this.clearDsSelect();
          if (getResponse(response)) {
            notification.success();
            const { sourceProject = {} } = response || {};
            const { sourceProjectId = '' } = sourceProject || {};
            if (!sourceProjectId) {
              return;
            }

            history.replace({
              pathname: `/ssrc/new-project-setup/sp-update/${sourceProjectId}`,
              search,
            });
          } else {
            return false;
          }
        });
      };
      if (res === true || isEmpty(res)) {
        return onOk();
      }

      if (res && !isNil(highestValidatorType) && highestValidatorType !== 'SUCCESS') {
        switch (highestValidatorType) {
          case 'WARNING':
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: getPromptMessage({ response: res, validatorArrName: 'validateResults' }),
              onOk: () => onOk(),
              bodyStyle: { maxHeight: 'calc(100vh - 2.5rem)' },
            });
            break;
          case 'ERROR':
            notification.error({
              message: intl.get('hzero.common.message.confirm.title').d('提示'),
              description: getPromptMessage({ response: res, validatorArrName: 'validateResults' }),
            });
            break;
          default:
            Modal.info({
              children: getPromptMessage({ response: res, validatorArrName: 'validateResults' }),
              bodyStyle: { maxHeight: 'calc(100vh - 2.5rem)' },
            });
            break;
        }
      }
      // 代表有错误内容，阻断弹窗关闭
      if (res?.returnDetail) {
        this.toggleLoading();
        this.clearDsSelect();
        return false;
      }

      if (!res?.returnDetail) {
        // 校验不通过， 后端返回returnDetail对象
        if (res.secondaryUomInconsistentFlag === 1) {
          applyToNotification(res.secondaryUomInconsistentMes);
        }
        const result = await createQuoteApproval({
          organizationId,
          prLineIdList: selectedRowKeys,
        });
        this.toggleLoading(false);
        this.clearDsSelect();
        if (getResponse(result)) {
          notification.success();
          const { sourceProject = {} } = result || {};
          const { sourceProjectId = '' } = sourceProject || {};
          if (!sourceProjectId) {
            return;
          }

          history.replace({
            pathname: `/ssrc/new-project-setup/sp-update/${sourceProjectId}`,
            search,
          });
        }
      }

      this.clearDsSelect();
      this.toggleLoading();
    } else {
      this.toggleLoading();
      this.clearDsSelect();
      return false;
    }
  };

  render() {
    const { loading, doubleUnitFlag } = this.state;
    const Props = {
      organizationId: this.organizationId,
      PurchaseRequestDS: this.purchaseRequestDs,
      doubleUnitFlag,
      executionLinkFlag: 1,
      tableStyle: {
        maxHeight: 'auto',
        height: '680px',
      },
      onRef: this.setContentRef,
    };

    const tableFixSelfAdaptStyle = getTableFixSelfAdaptStyle(true) || {};

    return (
      <React.Fragment>
        <Header
          backPath={null}
          title={intl.get(`ssrc.common.view.message.applyToProject`).d('申请转立项')}
        >
          <Button color="primary" onClick={this.create} loading={loading}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div style={tableFixSelfAdaptStyle.wrapperStyle}>
            <PurchaseRequestContent {...Props} />
          </div>
        </Content>
      </React.Fragment>
    );
  }
}

const HocComponent = (NewComponent) => {
  return compose(
    remoteHoc(
      {
        code: 'APPLY_TO_PROJECT_NEW',
        name: 'remote',
      },
      {
        events: {},
      }
    ),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.projectSetup', 'scux.ssrc', 'sscux.ssrc'],
    })
  )(observer(NewComponent));
};

export default HocComponent(ApplyToProject);
