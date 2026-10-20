/*
 * @Description: 分屏模式-标的和阶段
 * @Date: 2025-01-21 19:19:44
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import intl from 'utils/intl';
import { flow } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { observer } from 'mobx-react-lite';

import NotExtract from '@/routes/components/NotExtract';

import BusinessTermsInfo from './BusinessTermsInfo';
import ContractBusinessTerms from '../../ContractBusinessTerms';

import styles from '../index.less';

const { Panel } = Collapse;

const defaultActiveKey = ['businessTerms'];

const BusinessTerms = props => {
  const { editable, contractBusinessTermsListProps, customizeForm } = props;
  const { businessTermsDs } = contractBusinessTermsListProps;

  const handleBusinessTerms = () => {
    const viewProps = editable
      ? {
          onOk: async () => {
            const validate = await businessTermsDs.validate();
            if (validate) {
              const res = await businessTermsDs.submit();
              return !!res;
            }
            return false;
          },
        }
      : {
          cancelProps: {
            color: 'primary',
          },
          cancelText: intl.get('hzero.common.button.close').d('关闭'),
          footer: (okBtn, cancelBtn) => cancelBtn,
        };
    Modal.open({
      drawer: true,
      closable: true,
      movable: false,
      key: Modal.key(),
      title: intl
        .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
        .d('采购协议业务条款'),
      style: {
        width: 1080,
      },
      children: <ContractBusinessTerms {...contractBusinessTermsListProps} />,
      ...viewProps,
    });
  };

  return (
    <div className={styles['spcm-workSpace-contract-extract']} id="spcm-workSpace-contract-extract">
      <Collapse
        trigger="text-icon"
        ghost
        expandIconPosition="text-right"
        defaultActiveKey={defaultActiveKey}
      >
        <Panel
          key="businessTerms"
          id="spcm-workSpace-contract-extract-businessTerms"
          header={intl
            .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
            .d('采购协议业务条款')}
          extra={
            businessTermsDs?.length ? (
              <Button onClick={handleBusinessTerms} size="small" funcType="link" color="primary">
                {intl.get('spcm.common.view.msg.viewAll').d('查看全部')}
              </Button>
            ) : null
          }
        >
          {businessTermsDs?.length ? (
            <BusinessTermsInfo {...contractBusinessTermsListProps} customizeForm={customizeForm} />
          ) : (
            <NotExtract
              title={intl
                .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
                .d('采购协议业务条款')}
              onNewLine={handleBusinessTerms}
            />
          )}
        </Panel>
      </Collapse>
    </div>
  );
};

// export default BusinessTerms;
export default flow(
  observer,
  withCustomize({
    unitCode: [
      'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS.EXTRACT',
    ],
  })
)(BusinessTerms);

