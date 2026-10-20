/*
 * ToBeReleased - 订单明细页-订单发布
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Spin, Collapse } from 'choerodon-ui';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { queryCommonDoubleUomConfig, getDisplayDocAndDocFlow } from '@/routes/components/utils';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import remotes from 'utils/remote';

import AttachmentInfo from '@/routes/components/AttachmentInfo';
import OrderAffix from '@/routes/components/OrderAffix';
import C7nOperationApprove from '@/routes/components/C7nOperationApprove';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import { detailPublish } from '@/services/orderWorkspaceService';
import remoteConfig from './remote';
import { basicInfo, organizationInfo, receiptInfo, billingInfo } from './store/toBeReleasedDs';
import { detailInfo } from './store/OrderDetailLineDs';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import OrderDetailLine from './OrderDetailLine';
import ReceiptInfo from './ReceiptInfo';
import BillingInfo from './BillingInfo';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const prefix = 'sodr.workspace';
const { Panel } = Collapse;
const defaultActiveKey = [
  'basicInfo',
  'organizationInfo',
  'detailInfo',
  'giftInfo',
  'receiptInfo',
  'billingInfo',
  'paymentTermInfo',
];
const ToBeReleased = (props) => {
  const {
    history,
    match: {
      params: { id },
    },
    location: { state: { source, sourceType, sourceId } = {} },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const [loadings, setLoadings] = useState({});
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const backPath = useMemo(
    () =>
      source === 'all'
        ? `/sodr/order-workspace/detail/all-orders/${id}`
        : sourceType === 'copy'
        ? `/sodr/order-workspace/detail/all-orders/${sourceId}`
        : '/sodr/order-workspace/list',
    [source, sourceType]
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
          submit: ({ dataSet }) => {
            const lineDs = dataSet.getState('detailInfoDs');
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/detail-approve`,
              method: 'POST',
              data: [
                {
                  poHeaderDetailDTO: dataSet.toJSONData()[0],
                  poLineDetailDTOs: lineDs.toJSONData(),
                },
              ],
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
        ...(remote
          ? remote.process(
              'SODR.WORKSPACE_MAINTENANCE_TOBERELEASED_PROCESS_DETAIL_DS',
              detailInfo(),
              { props }
            )
          : detailInfo()),
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
  const giftInfoDs = useMemo(
    () =>
      new DataSet(
        giftInfoDsConfig({
          poHeaderId: id,
          params: { customizeUnitCode: 'SODR.WORKSPACE_TOBERELEASED_DETAIL.GIFTINFO' },
        })
      ),
    [id]
  );
  const paymentTermInfoDs = useMemo(() => new DataSet(paymentTermInfo()), [id]);
  // 是否展示赠品行
  const basicCurrent = basicInfoDs.current;
  const { giftFlag, poSourcePlatform, oldTermHideFlag } = basicCurrent.get([
    'giftFlag',
    'poSourcePlatform',
    'oldTermHideFlag',
  ]);
  const hasGift = useMemo(() => {
    return id && giftFlag;
  }, [id, giftFlag]);
  const receiptInfoDs = useMemo(() => new DataSet(receiptInfo()), []);
  const billingInfoDs = useMemo(() => new DataSet(billingInfo()), []);
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [1, 0, 1],
    }),
    []
  );
  // 金额字段是否根据sourceCode判断处理
  const bySourceCode = useMemo(() => remote.process('bySourceCode'), []);

  const getValues = useCallback(() => {
    const poHeaderDetailDTO = basicInfoDs.toJSONData()[0];
    const poLineDetailDTOs = detailInfoDs.toJSONData();
    const values = {
      poHeaderDetailDTO: { ...poHeaderDetailDTO, poWorkbenchFlag: 1 },
      poLineDetailDTOs,
    };
    return values;
  }, [basicInfoDs, detailInfoDs]);

  const contentList = useMemo(() => {
    const list = [
      {
        key: 'basicInfo',
        content: (
          <Panel
            key="basicInfo"
            id="order-workSpace-detail-content-basicInfo"
            header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
          >
            <BasicInfo ds={basicInfoDs} customizeForm={customizeForm} bySourceCode={bySourceCode} />
          </Panel>
        ),
      },
      {
        key: 'organizationInfo',
        content: (
          <Panel
            key="organizationInfo"
            id="order-workSpace-detail-content-organizationInfo"
            header={intl.get('sodr.workspace.view.panel.organization').d('交易方及采买组织信息')}
          >
            <OrganizationInfo ds={organizationInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'detailInfo',
        content: (
          <Panel
            key="detailInfo"
            id="order-workSpace-detail-content-detailInfo"
            header={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
          >
            <OrderDetailLine
              remotes={remote}
              ds={detailInfoDs}
              basicInfoDs={basicInfoDs}
              customizeTable={customizeTable}
              bySourceCode={bySourceCode}
              displayDocAndDocFlow={displayDocAndDocFlow}
            />
          </Panel>
        ),
      },
      {
        key: 'giftInfo',
        content: (
          <Panel
            hidden={!hasGift}
            key="giftInfo"
            id="order-workSpace-detail-content-giftInfo"
            header={intl.get('sodr.workspace.view.panel.giftInfo').d('赠品明细信息')}
          >
            <GiftInfo
              ds={giftInfoDs}
              customizeTable={customizeTable}
              code="SODR.WORKSPACE_TOBERELEASED_DETAIL.GIFTINFO"
            />
          </Panel>
        ),
      },
      {
        key: 'paymentTermInfo',
        content: (
          <Panel
            hidden={!oldTermHideFlag}
            key="paymentTermInfo"
            id="order-workSpace-detail-content-paymentTermInfo"
            header={intl.get('sodr.workspace.view.panel.paymentTermInfo').d('订单付款条款信息')}
          >
            <PaymentTermInfo
              ds={paymentTermInfoDs}
              customizeForm={customizeForm}
              customizeCode="SODR.WORKSPACE_TOBERELEASED_DETAIL.PAYMENTTERMINFO"
              getValues={getValues}
            />
          </Panel>
        ),
      },
      {
        key: 'receiptInfo',
        content: (
          <Panel
            key="receiptInfo"
            id="order-workSpace-detail-content-receiptInfo"
            header={intl.get('sodr.workspace.view.panel.receiptInfo').d('收货/收单信息')}
          >
            <ReceiptInfo ds={receiptInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'billingInfo',
        content: (
          <Panel
            key="billingInfo"
            id="order-workSpace-detail-content-billingInfo"
            header={intl.get('sodr.workspace.view.panel.billingInfo').d('开票信息')}
          >
            <BillingInfo ds={billingInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'attachmentInfo',
        content: (
          <Content className={styles['order-workspace-detail-content']}>
            <AttachmentInfo
              ds={basicInfoDs}
              poHeaderId={id}
              attachmentConfig={attachmentConfig}
              customizeForm={customizeForm}
              customizeCode={[
                'SODR.WORKSPACE_TOBERELEASED_DETAIL.ATTACHMENTINFO',
                'SODR.WORKSPACE_TOBERELEASED_DETAIL.ATTACHMENTINFO_EXTERNAL',
              ]}
            />
          </Content>
        ),
      },
    ];
    const panels = remote.process('processPanels', list, { basicInfoDs, id });
    if (poSourcePlatform === 'CATALOGUE') {
      return panels.filter((i) => i.key !== 'billingInfo');
    } else if (poSourcePlatform === 'E-COMMERCE') {
      return panels;
    } else {
      return panels.filter((i) => !['receiptInfo', 'billingInfo'].includes(i.key));
    }
  });

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs].forEach((i) => {
      i.setState(state);
    });
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  useEffect(() => {
    useSetstate({
      loading,
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      doubleUnitEnabled: 0,
    });
    if (id) {
      loading({ all: true });
      fetchDoubleUom();
      getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
      basicInfoDs.query().then((res) => {
        loading({ all: false });
        if (res) {
          if (res.giftFlag) {
            giftInfoDs.query();
          }
          organizationInfoDs.loadData([res]);
          paymentTermInfoDs.loadData([res]);
          receiptInfoDs.create(res);
          billingInfoDs.loadData([res]);
        }
      });
      // detailInfoDs.query();
    }
  }, []);

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  const action = (type) => {
    const data = [
      {
        poHeaderDetailDTO: basicInfoDs.toJSONData()[0],
        poLineDetailDTOs: detailInfoDs.toJSONData(),
      },
    ];
    const result = remote ? remote.process('beforeDetaileveryFuncion', true, { type, data }) : true;
    if (!result) return false;
    loading({ [type]: true });
    detailPublish(data).then((response) => {
      loading({ [type]: false });
      const res = getResponse(response);
      if (res) {
        const list = Object.keys(res);
        if (list.length === 0) {
          notification.success();
          history.push({
            pathname: backPath,
            state: { _back: -1 },
          });
        } else {
          notification.warning({
            message: `${JSON.stringify(list)}${res[list[0]].desc}`,
          });
        }
      }
      // if (getResponse(res)) {
      //   notification.success();
      //   history.push({
      //     pathname: backPath,
      //   });
      // }
    });
  };
  const handleRecord = () => {
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get(`${prefix}.view.title.operationHistory`).d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 800 },
      children: <C7nOperationApprove poHeaderId={id} modal={modal} />,
      onOk: () => {},
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const HeaderButtons = observer(() => {
    const headerBtns = [
      {
        name: 'record',
        btnComp: Button,
        child: intl.get('sodr.workspace.view.button.operationRecord').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: handleRecord,
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.tobereleased.record',
              type: 'c7n-pro',
              meaning: '订单工作台-待发布明细-操作记录',
            },
          ],
        },
      },
      {
        name: 'release',
        btnComp: Button,
        child: intl.get(`sodr.workspace.view.button.release`).d('发布'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'publish2',
          type: 'c7n-pro',
          color: 'primary',
          onClick: () => action('release'),
          loading:
            loadings.release || basicInfoDs.status !== 'ready' || detailInfoDs.status !== 'ready',
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.tobereleased.release',
              type: 'c7n-pro',
              meaning: '订单工作台-待发布明细-发布',
            },
          ],
        },
      },
    ];
    const newHeaderBtns = remote
      ? remote.process('processHeaderButtons', headerBtns, {
          poHeaderId: id,
          basicInfoDs,
          props,
          loading,
          loadings,
          setLoadings,
          detailInfoDs,
        })
      : headerBtns;
    return customizeBtnGroup(
      {
        code: 'SODR.WORKSPACE_TOBERELEASED_DETAIL.BUTTONS',
        pro: true,
      },
      <DynamicButtons buttons={newHeaderBtns} />
    );
  });

  return (
    <Fragment>
      <OrderAffix />
      <Header
        backPath={backPath}
        title={intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')}
      >
        <HeaderButtons />
      </Header>
      <div
        className={styles['order-workspace-detail-container']}
        id="order-workspace-detail-container"
      >
        <Spin spinning={loadings.all}>
          {customizeCollapse(
            {
              code: 'SODR.WORKSPACE_TOBERELEASED_DETAIL.COLLAPSE',
            },
            <Collapse
              trigger="text-icon"
              ghost
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              {contentList.map((i) => i.content)}
            </Collapse>
          )}
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.BASICINFO',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.DETAILINFO',
      // 'SODR.WORKSPACE_TOBERELEASED_DETAIL.OTHERINFO',
      // 'SODR.WORKSPACE_TOBERELEASED_DETAIL.PARTNER',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.BOM',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.TABS',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.BUTTONS',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.GIFTINFO',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  remotes(...remoteConfig)
)(ToBeReleased);
