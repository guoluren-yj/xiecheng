// 签章Modal
import React, { useMemo, useEffect, useState } from 'react';
import { DataSet, Modal, Picture } from 'choerodon-ui/pro';
import { getResponse, getUserOrganizationId } from 'utils/utils';
import classNames from 'classnames';
import intl from 'utils/intl';

import { phoneInfoDs as phoneInfoDS } from './mainDS';
import {
  querySealPictures,
  getSignInfo,
  verifiedSign,
} from '@/services/reconciliationWorkbenchService';
import TimeModal from './time';

import styles from './index.less';

const tenantId = getUserOrganizationId();
const SignatureModal = (props) => {
  const { modal, headerDS, onOk, actionCamp } = props;
  const { companyId, supplierCompanyId, billHeaderId } = headerDS.current?.toData();

  const [picDataSource, setPicDataSource] = useState([]);
  const [record, setRecord] = useState({});
  const [sealType, setSealType] = useState('ESIGN');

  const phoneInfoDs = useMemo(() => new DataSet(phoneInfoDS()), []);

  useEffect(() => {
    getSignInfo().then((res) => {
      if (getResponse(res)) {
        const { sealType: type } = res;
        setSealType(type);
        getQuerySealPictures(type);
      }
    });
  }, []);

  useEffect(() => {
    modal.handleOk(handleOk);
    modal.update({
      okProps: { disabled: !record.sealId },
    });
  }, [record, modal]);

  const getQuerySealPictures = (type) => {
    querySealPictures({
      lovCode: 'SPFM.COMPANY_SEAL',
      companyId: actionCamp === 'SUPPLIER' ? supplierCompanyId : companyId,
      tenantId,
      sealType: type,
    }).then((res) => {
      if (getResponse(res)) {
        const list = res.filter((item) => {
          return item.sealFileUrl !== null && item.enabledFlag !== 0;
        });
        setPicDataSource(list);
      }
    });
  };

  const handleOk = () => {
    // 如果是供应商阵营supplierCompanyId和companyId对换一下
    const cId = actionCamp === 'SUPPLIER' ? supplierCompanyId : companyId;
    const sId = actionCamp === 'SUPPLIER' ? companyId : supplierCompanyId;
    phoneInfoDs.setQueryParameter('companyId', cId);
    phoneInfoDs.setQueryParameter('supplierCompanyId', sId);
    phoneInfoDs.setQueryParameter('authType', sealType);
    phoneInfoDs.query().then(() => {
      openModal();
    });
    return false;
  };

  const openModal = () => {
    Modal.open({
      title: intl.get('ssta.common.model.common.messageVerify').d('短信验证'),
      style: { width: '380px' },
      className: styles['ssta-message-code'],
      children: (
        <TimeModal phoneInfoDs={phoneInfoDs} authType={sealType} billHeaderId={billHeaderId} />
      ),
      border: false,
      okProps: {
        disabled: true,
      },
      onOk: () =>
        new Promise((resolve) => {
          const { phone, verifiCode } = phoneInfoDs.current?.toData();
          const { sealId, sealPictureUrl } = record;
          verifiedSign({
            verifiCode,
            mobile: phone,
            authType: sealType,
            // 参数sealType不同于authType
            sealType: 'KEY_WORD_SEAL',
            sealId,
            sealPictureUrl,
            billHeaderId,
            actionCamp,
          }).then((res) => {
            if (getResponse(res)) {
              // 刷新数据
              onOk();
              modal.close();
              resolve();
            } else {
              resolve(false);
            }
          });
        }),
    });
  };

  const handleClickImg = (item) => {
    setRecord(item);
  };

  return (
    <div>
      {picDataSource.map((el) => (
        <div
          key={el.sealId}
          className={classNames(styles.signature, {
            [styles.activeSignature]: el.sealId === record.sealId,
          })}
          onClick={() => handleClickImg(el)}
        >
          <Picture preview={false} lazy src={el.sealFileUrl} className={styles['signature-img']} />
        </div>
      ))}
    </div>
  );
};

export default SignatureModal;
