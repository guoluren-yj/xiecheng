/*
 * EcommerceChange - 订单明细页-电商订单变更
 * @date: 2023/07/04 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { Spin, Collapse } from 'choerodon-ui';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import remotes from 'utils/remote';

import { queryCommonDoubleUomConfig, getDisplayDocAndDocFlow } from '@/routes/components/utils';
import OrderAffix from '@/routes/components/OrderAffix';
import AttachmentInfo from '@/routes/components/AttachmentInfo';
import { basicInfo, organizationInfo, detailInfo, receiptInfo, billingInfo } from './store';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { eCommerceChange } from '@/services/orderWorkspaceService';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import DetailInfo from './DetailInfo';
import ReceiptInfo from './ReceiptInfo';
import BillingInfo from './BillingInfo';
import remoteConfig from './remote';
import styles from '../index.less';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basicInfo',
  'organizationInfo',
  'detailInfo',
  'receiptInfo',
  'billingInfo',
];
const organizationId = getCurrentOrganizationId();

const EcommerceChange = (props) => {
  const {
    history,
    match: {
      params: { id },
    },
    location: { state: { source } = {} },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const [loadings, setLoadings] = useState({});
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  const backPath = useMemo(
    () =>
      source === 'all'
        ? `/sodr/order-workspace/detail/all-orders/${id}`
        : '/sodr/order-workspace/list',
    [source]
  );
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [0, 0, 1],
    }),
    []
  );
  const basicInfoDs = useMemo(
    () =>
      new DataSet({
        ...basicInfo(),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/${id}/detail`,
              method: 'GET',
            };
          },
        },
      }),
    []
  );
  const organizationInfoDs = useMemo(() => new DataSet(organizationInfo()), []);
  const detailInfoDs = useMemo(
    () =>
      new DataSet({
        ...detailInfo(),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${id}/detail`,
              method: 'GET',
            };
          },
        },
      }),
    []
  );
  const receiptInfoDs = useMemo(() => new DataSet(receiptInfo()), []);
  const billingInfoDs = useMemo(() => new DataSet(billingInfo()), []);

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs].forEach((i) => {
      i.setState(state);
    });
  };
  useMemo(
    () =>
      useSetstate({
        organizationInfoDs,
        basicInfoDs,
        detailInfoDs,
        doubleUnitEnabled: 0,
        changeFlag: false,
      }),
    []
  );
  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    basicInfoDs.loading = 'loading';
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  const fetchDetailHeader = () => {
    loading({ all: true });
    fetchDoubleUom();
    basicInfoDs.query().then((res) => {
      loading({ all: false });
      if (res) {
        organizationInfoDs.loadData([
          {
            ...res,
            displaySupplierName: res.supplierName || res.supplierCompanyName,
          },
        ]);
        receiptInfoDs.loadData([res]);
        billingInfoDs.loadData([res]);
        // detailInfoDs.query();
      }
    });
  };

  useEffect(() => {
    fetchDetailHeader();
    getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
  }, []);

  const setChangeFlag = () => {
    basicInfoDs.setState('changeFlag', true);
  };

  const handleSubmit = async () => {
    const validateList = [organizationInfoDs, basicInfoDs, detailInfoDs];
    if (!validateList.map((i) => i.dirty).includes(true) && !basicInfoDs.getState('changeFlag')) {
      notification.warning({
        message: intl.get(`sodr.workspace.view.message.noModifyData`).d('未修改任何数据'),
      });
      return;
    }
    Promise.all(validateList.map((i) => i.validate())).then(async (status) => {
      if (status.findIndex((i) => !i) === -1) {
        const data = {
          // poHeaderId: basicInfoDs?.current?.get('poHeaderId'),
          poHeaderDetailDTO: {
            ...basicInfoDs.toJSONData()[0],
            poWorkbenchFlag: 1,
          },
          poLineDetailDTOs: detailInfoDs.toJSONData(),
          customizeUnitCode: String([
            'SODR.WORKSPACE_EC_CHANGE_DETAIL.BASICINFO_NEW',
            'SODR.WORKSPACE_EC_CHANGE_DETAIL.ORGANIZATIONINFO',
            'SODR.WORKSPACE_EC_CHANGE_DETAIL.DETAILINFO',
            'SODR.WORKSPACE_EC_CHANGE_DETAIL.BILLINGINFO',
            'SODR.WORKSPACE_EC_CHANGE_DETAIL.RECEIPTINFO',
            'SODR.WORKSPACE_EC_CHANGE_DETAIL.ATTACHMENTINFO',
            'SODR.WORKSPACE_EC_CHANGE_DETAIL.ATTACHMENTINFO_EXTERNAL',
          ]),
        };
        loading({ handleSubmit: true });
        const res = getResponse(await eCommerceChange(data));
        loading({ handleSubmit: false });
        if (res) {
          notification.success();
          history.push({
            pathname: backPath,
            state: { _back: -1 },
          });
        }
      }
    });
  };

  const HeaderBtns = observer(() => {
    const headerBtnLoading =
      loadings.handleSubmit || basicInfoDs.status !== 'ready' || detailInfoDs.status !== 'ready';
    const buttons = [
      {
        name: 'submit',
        type: 'c7n-pro',
        btnComp: Button,
        child: intl.get(`sodr.workspace.view.button.submit`).d('提交'),
        btnProps: {
          wait: THROTTLE_TIME,
          color: 'primary',
          icon: 'check',
          type: 'c7n-pro',
          onClick: handleSubmit,
          loading: headerBtnLoading,
        },
      },
    ];
    return customizeBtnGroup(
      { code: 'SODR.WORKSPACE_EC_CHANGE_DETAIL.BUTTONS', pro: true },
      <DynamicButtons buttons={buttons} />
    );
  });

  return (
    <Fragment>
      <OrderAffix />
      <Header
        backPath={backPath}
        title={intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')}
      >
        <HeaderBtns />
      </Header>
      <div
        className={styles['order-workspace-detail-container']}
        id="order-workspace-detail-container"
      >
        <Spin spinning={loadings.all}>
          <Collapse
            trigger="text-icon"
            ghost
            expandIconPosition="text-right"
            defaultActiveKey={defaultActiveKey}
          >
            {customizeCollapse(
              { code: 'SODR.WORKSPACE_EC_CHANGE_DETAIL.COLLAPSE' },
              <Collapse
                trigger="text-icon"
                ghost
                expandIconPosition="text-right"
                defaultActiveKey={defaultActiveKey}
              >
                <Panel
                  key="basicInfo"
                  id="order-workSpace-detail-content-basicInfo"
                  header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
                >
                  <BasicInfo ds={basicInfoDs} customizeForm={customizeForm} />
                </Panel>
                <Panel
                  key="organizationInfo"
                  id="order-workSpace-detail-content-organizationInfo"
                  header={intl
                    .get('sodr.workspace.view.panel.organization')
                    .d('交易方及采买组织信息')}
                >
                  <OrganizationInfo ds={organizationInfoDs} customizeForm={customizeForm} />
                </Panel>
                <Panel
                  key="detailInfo"
                  id="order-workSpace-detail-content-detailInfo"
                  header={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
                >
                  <DetailInfo
                    remote={remote}
                    ds={detailInfoDs}
                    customizeTable={customizeTable}
                    setChangeFlag={setChangeFlag}
                    displayDocAndDocFlow={displayDocAndDocFlow}
                  />
                </Panel>
                <Panel
                  key="receiptInfo"
                  id="order-workSpace-detail-content-receiptInfo"
                  header={intl.get('sodr.workspace.view.panel.receiptInfo').d('收货/收单信息')}
                >
                  <ReceiptInfo ds={receiptInfoDs} customizeForm={customizeForm} />
                </Panel>
                <Panel
                  key="billingInfo"
                  id="order-workSpace-detail-content-billingInfo"
                  header={intl.get('sodr.workspace.view.panel.billingInfo').d('开票信息')}
                >
                  <BillingInfo ds={billingInfoDs} customizeForm={customizeForm} />
                </Panel>
              </Collapse>
            )}

            <Content className={styles['order-workspace-detail-content']}>
              <AttachmentInfo
                // insideAttachment={createPermsMap.get(`${createPrefix}.insideattachment`)}
                // externalAttachment={createPermsMap.get(`${createPrefix}.externalattachment`)}
                poHeaderId={id}
                ds={basicInfoDs}
                attachmentConfig={attachmentConfig}
                customizeForm={customizeForm}
                type="change"
                customizeCode={[
                  'SODR.WORKSPACE_EC_CHANGE_DETAIL.ATTACHMENTINFO',
                  'SODR.WORKSPACE_EC_CHANGE_DETAIL.ATTACHMENTINFO_EXTERNAL',
                ]}
                handleChangeAttachment={setChangeFlag}
              />
            </Content>
          </Collapse>
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.BUTTONS',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.BASICINFO_NEW',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_EC_CHANGE_DETAIL.COLLAPSE',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  remotes(...remoteConfig)
)(EcommerceChange);
