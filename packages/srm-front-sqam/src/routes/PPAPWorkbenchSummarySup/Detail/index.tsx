// PPAP详情
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Spin, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { Header, Content } from 'components/Page';
import classNames from 'classnames';
import { getCurrentOrganizationId } from 'utils/utils';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import StoreProvider, { Store } from './stores';
// import StoreProvider from './stores';
import type { StoreValueType } from './stores';
import OperationRecord from '../../PPAPWorkbench/Detail/components/OperationRecord';
import { formatDynamicBtns } from '../../utils';
import { DetailBtnCode } from '../utils/type';

import DetailInfo from './components/Detail';
import styles from '../../PPAPWorkbench/Detail/index.less';

const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SQAM}/v1/${organizationId}`;

const Detail = observer(() => {
  const {
    headerDs,
    location,
    customizeBtnGroup,
  } = useContext<StoreValueType>(Store);
  const loading = headerDs.status !== 'ready';
  const { projectHeaderId } = headerDs.current?.get(['projectHeaderId']) || {};

  const tltle: string = useMemo(() => {
    const titleContent = intl.get('sqam.ppap.view.title.ppapSumDetail').d('PPAP汇总工作台详情');
    return titleContent;
  }, []);



  const handleViewOperation = useCallback(() => {
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.button.operation').d('操作记录'),
      closable: true,
      key: Modal.key(),
      className: styles['sqam-medium-modal'],
      children: <OperationRecord id={projectHeaderId} type='project' />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [projectHeaderId]);


  const buttons = useCallback(() => {
    const btns = [
      {
        name: 'export',
        btnComp: ExcelExportPro,
        buttonText: intl.get(`hzero.common.button.export`).d('导出'),
        btnProps: {
          templateCode: 'SRM_C_SQAM_ACCESS_PROJECT_HEADER_SUM_EXPORT',
          allBody: true,
          method: 'POST',
          requestUrl: `${apiPrefix}/access-project-headers/sum/list/supplier/export`,
          queryParams: { projectHeaderId, action: 'ALL' },
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [{
              code: `srm.sqam.ppap.summary.workbench.sup.button.detail-export`,
              type: 'button',
            }],
          },
        },
      },
      {
        name: 'operate',
        child: intl.get('hzero.common.button.operation').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          color: 'default',
          onClick: handleViewOperation,
          loading,
        },
      },
    ];
    return formatDynamicBtns(btns);
  }, [handleViewOperation, loading, projectHeaderId]);


  const backPath = useMemo(() => {
    const { state } = location;
    return state?.backPath || '/sqam/PPAPWorkbenchSummarySup/list';
  }, [location]);

  return (
    <Fragment>
      <Header title={tltle} backPath={backPath}>
        {customizeBtnGroup(
          { code: DetailBtnCode, pro: true },
          <DynamicButtons buttons={buttons()} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <div className={classNames(styles['sqam-ppap-detail-auto'])}>
        <Content className={styles['sqam-detail-content-ppapWorkbench']}>
          <Spin spinning={loading} wrapperClassName="full-height-spinning">
            <DetailInfo />
          </Spin>
        </Content>
      </div>
    </Fragment>
  );
});

const PPAPWorkbenchDetail = (props) => {
  return <StoreProvider {...props}><Detail /></StoreProvider>;
};

export default PPAPWorkbenchDetail;
