import type { ReactElement } from 'react';
import React, { useMemo, Fragment, useEffect } from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { flow } from 'lodash';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import type { DocType } from './storeDS';
import InvoiceLine from './InvoiceLine';
import InvoiceHeader from './InvoiceHeader';
import { invoiceHeaderDS, invoiceLineDS } from './storeDS';
import styles from './index.less';

const defaultActiveKey = [
  'header',
  'line',
];

interface InvoiceDetailProps {
  modal?: any,
  docType: DocType,
  invoiceHeaderId: string | number,
}

const { Panel } = Collapse;

const InvoiceDetail = flow(
  observer,
  formatterCollections({ code: ['ssta.invoice', 'ssta.common'] }),
)((props) => {
  const { modal, docType, invoiceHeaderId } = props;
  const modalFlag = Boolean(modal);
  const invoiceLineDs = useMemo<DataSet>(() => new DataSet(invoiceLineDS(invoiceHeaderId, docType)), [invoiceHeaderId, docType]);
  const invoiceHeaderDs = useMemo<DataSet>(() => new DataSet(invoiceHeaderDS(invoiceHeaderId, docType)), [invoiceHeaderId, docType]);
  const loading = invoiceHeaderDs.status !== 'ready';
  const showLineFlag = invoiceHeaderDs.current?.get('invoiceMode') === 'DIRECT';

  useEffect(() => {
    if (showLineFlag) invoiceLineDs.bind(invoiceHeaderDs, 'invoiceLineList');
  }, [showLineFlag, invoiceLineDs, invoiceHeaderDs]);

  const contentClassName = useMemo(() => {
    return classNames({
      [styles['ssta-detail-modal-content']]: modalFlag,
      [styles['ssta-detail-content-invoiceDetail']]: true,
      [styles[`ssta-detail-content-invoiceDetail-nopanel`]]: !showLineFlag,
    });
  }, [modalFlag, showLineFlag]);

  if (!invoiceHeaderDs.current) return <Spin />;

  return (
    <Fragment>
      <Content className={contentClassName}>
        <Spin spinning={loading}>
          {showLineFlag ? (
            <Collapse
              ghost
              trigger="icon"
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              <Panel key="header" header={intl.get(`ssta.invoice.view.title.invoiceHeaderInfo`).d('发票头信息')}>
                <InvoiceHeader invoiceHeaderDs={invoiceHeaderDs} />
              </Panel>
              <Panel key="line" header={intl.get(`ssta.invoice.view.title.invoiceLineInfo`).d('发票行信息')}>
                <InvoiceLine invoiceLineDs={invoiceLineDs} />
              </Panel>
            </Collapse>
          ) : (
            <InvoiceHeader invoiceHeaderDs={invoiceHeaderDs} />
          )}
        </Spin>
      </Content>
    </Fragment>
  );
}) as (props: InvoiceDetailProps) => ReactElement;

export default InvoiceDetail;
