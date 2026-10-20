import React, { Fragment, useCallback, useContext, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Spin, Collapse } from 'choerodon-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';

import BasicInfo from './components/BasicInfo';
import StoreProvider, { Store } from './stores';
import commonStyles from '../../../common.less';
import AttachmentInfo from './components/AttachmentInfo';
import { formatDynamicBtns } from '../../../utils/utils';
import { DetailBtnsCustCode, DetailCollapseCode } from '../utils/type';
import { getCustomValidationResponse } from '../../../components/CustomValidation';

const { Panel } = Collapse;

const defaultActiveKey = ['basic', 'attachment'];

const Detail = observer(() => {

  const {
    loading,
    boolMap,
    history,
    headerDs,
    customizeBtnGroup,
    customizeCollapse,
  } = useContext(Store);

  const handleBackList = useCallback(() => {
    notification.success({});
    history.push({
      pathname: '/sbsm/bank-bill-pool/list',
      state: { _back: 1 },
    });
  }, [history]);

  const handleCreate = useCallback(async () => {
    const validRes = await headerDs
      .setState('submitType', 'createValidate')
      .submit();
    if (!validRes) return;
    const handleRealSubmit = async () => {
      const createRes = await headerDs
        .setState('submitType', 'create')
        .submit();
      if (!createRes) return;
      handleBackList();
    };
    return getCustomValidationResponse(validRes?.content[0] || {}, handleRealSubmit);
  }, [headerDs, handleBackList]);

  const handlePublish = useCallback(async () => {
    if (boolMap.createFlag) return handleCreate();
    const res = await headerDs.setState('submitType', 'update').submit();
    if (!res) return;
    handleBackList();
  }, [boolMap, headerDs, handleCreate, handleBackList]);

  const buttons = useMemo(() => {
    return formatDynamicBtns([
      (boolMap.editFlag || boolMap.createFlag) && {
        name: 'publish',
        child: intl.get(`hzero.common.button.publish`).d('发布'),
        btnProps: { icon: 'publish2', wait: 1000, onClick: handlePublish },
      },
    ]);
  }, [
    boolMap,
    handlePublish,
  ]);

  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get('sbsm.bankBillPool.view.title.billInfo').d('票据信息'),
        content: <BasicInfo />,
      },
      {
        key: 'attachment',
        header: intl.get('sbsm.bankBillPool.view.title.attachment').d('附件'),
        content: <AttachmentInfo />,
      },
    ].filter(Boolean);
  }, []);

  const title = useMemo(() => {
    if (boolMap.createFlag) return intl.get('sbsm.bankBillPool.view.title.createBill').d('新建票据');
    if (boolMap.editFlag) return intl.get('sbsm.bankBillPool.view.title.editBill').d('编辑票据');
    return intl.get('sbsm.bankBillPool.view.title.viewBill').d('查看票据');
  }, [boolMap]);

  return (
    <Fragment>
      <Header backPath='/sbsm/bank-bill-pool/list' title={title}>
        {customizeBtnGroup(
          { code: DetailBtnsCustCode, pro: true },
          <DynamicButtons defaultBtnType="c7n-pro" maxNum={5} buttons={buttons} />
        )}
      </Header>
      <Content
        wrapperClassName={`${boolMap.modalFlag && commonStyles['collapse-content-modal']} ${commonStyles['collapse-content-wrap']}`}
        className={commonStyles[`collapse-content`]}
      >
        <Spin spinning={loading}>
          {customizeCollapse(
              { code: DetailCollapseCode },
            <Collapse
              ghost
              trigger="icon"
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              {paneList.map((item) => {
                  const { content, ...panelProps } = item;
                  return (
                    <Panel showArrow={false} {...panelProps}>
                      {content}
                    </Panel>
                  );
                })}
            </Collapse>
            )}
        </Spin>
      </Content>
    </Fragment>
  );

});

const BankBillPoolDetail = (props) => <StoreProvider {...props}><Detail /></StoreProvider>;

export default BankBillPoolDetail;