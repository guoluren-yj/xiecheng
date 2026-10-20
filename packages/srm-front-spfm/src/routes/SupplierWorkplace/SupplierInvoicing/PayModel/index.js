/**
 * 发票信息弹窗
 * @Author qingxiang.luo@going-link.com
 * @Date 2022-01-07
 */
import React from 'react';
import { Modal } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';
import classNames from 'classnames';
import formatterCollections from 'utils/intl/formatterCollections';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';

import styles from './index.less';

const { Sidebar } = Modal;

const PayModel = props => {
  const { visible, localRecord, onCancel = () => {} } = props;

  const path = '/spfm/supplier-common-payment';

  const handleCloseModal = () => {
    onCancel();
  };

  const { tenantId } = getCurrentUser();
  const supplierPaymentId = localRecord?.get('supplierPaymentId') ?? '';
  const supplierTenantCode = localRecord?.get('supplierTenantCode') ?? '';
  const coreTenantCode = localRecord?.get('coreTenantCode') ?? '';

  const embedProps = {
    path,
    pageData: {},
    location: {
      path,
      pathname: path,
      search: `?tenantId=${tenantId}&coreTenantCode=${coreTenantCode}&supplierTenantCode=${supplierTenantCode}&supplierPaymentId=${supplierPaymentId}&prePayFlag=false`,
    },
    match: {
      path,
    },
    history: {
      ...window.dvaApp._history,
    },
  };

  return (
    <Sidebar
      title={intl.get('spfm.supplierInvoic.model.renewalBillOrder').d('缴费账单')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={handleCloseModal}
      className={classNames(styles['renewal-modal-footer'])}
      width={800}
      footer={
        <>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </>
      }
    >
      <>
        <EmbedPage href={path} {...embedProps} />
      </>
    </Sidebar>
  );
};

export default formatterCollections({
  code: ['spfm.supplierInvoic'],
})(PayModel);
