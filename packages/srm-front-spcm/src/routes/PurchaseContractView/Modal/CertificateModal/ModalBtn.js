/*
 * CertificateModal - 法大大查看存证弹框
 * @date: 2021-12-16
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ContentModal from './children';

const CertificateModal = (props) => {
  const { children, record, onClickESIGN } = props;

  // 法大大查看存证
  const goReferenceDocument = () => {
    Modal.open({
      key: Modal.key(),
      title: intl.get('spcm.common.view.title.viewCertificate').d('查看存证'),
      children: <ContentModal data={record} />,
      closable: true,
      style: {
        width: ['FDD', 'FDD_SAAS'].includes(record.authType) ? '800px' : '600px',
        height: ['FDD', 'FDD_SAAS'].includes(record.authType) ? '400px' : '300px',
      },
      footer: null,
    });
  };
  const DomColne = React.cloneElement(children, {
    onClick: record.authType === 'ESIGN' ? onClickESIGN : goReferenceDocument,
  });
  return DomColne;
};

export default CertificateModal;
