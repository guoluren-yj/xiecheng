import React from 'react';
import classNames from 'classnames';
import { TextField, Form, Attachment, Lov, Select, Modal, Button, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import Image from '@/components/Image';
import styles from './index.less';

const accept = [
  '.rar',
  '.zip',
  '.doc',
  '.docx',
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.xls',
  '.xlsx',
  '.csv',
];

const imageAccept = ['.jpg', '.jpeg', '.png'];

const CustomView = ({ customList }) => {
  const customMap = {
    LOV: Lov,
    SELECT: Select,
    IMAGE: ({ label, required }) => (
      <div className="attr-image">
        <div className={classNames({ 'attr-label': true, 'attr-required': required })}>
          {label}
          {required && '*'}
        </div>
        <Image width={80} height={80} />
      </div>
    ),
    UPLOAD: (props) => (
      <Attachment
        {...props}
        max={1}
        labelLayout="float"
        viewMode="list"
        showValidation="newLine"
        help={intl
          .get('smpc.product.view.attProps.help', { accept: accept.join(',') })
          .d(`支持${accept.join(',')}格式，且不能大于5M`)}
      />
    ),
    UPLOADIMAGE: (props) => (
      <Attachment
        {...props}
        labelLayout="float"
        max={1}
        listType="picture-card"
        showValidation="newLine"
        required
        accept={imageAccept}
        help={intl
          .get('smpc.product.view.attProps.help', { accept: imageAccept.join(',') })
          .d(`支持${imageAccept.join(',')}格式，且不能大于5M`)}
      />
    ),
  };

  return (
    <div className={styles['custom-view-wrapper']}>
      {customList.map((m) => {
        const { attrGroupName, customDetailList, shipperFlag, shipper } = m;
        return (
          <div className="custom-view-group">
            <div className="attr-group-title">
              {attrGroupName}
              <Tooltip title={intl.get('smpc.product.view.custom.shipper').d('辅助单位')}>
                <span>{!!shipperFlag && `(${shipper})`}</span>
              </Tooltip>
            </div>
            <Form labelLayout="float" columns={1}>
              {customDetailList?.map((custom) => {
                const { inputMethod, componentName, requiredFlag } = custom;
                const componentType =
                  custom.componentType === 'IMAGE' && inputMethod === 'MANUAL'
                    ? 'UPLOADIMAGE'
                    : custom.componentType;
                const Comp = customMap[componentType] || TextField;
                return (
                  <Comp
                    disabled
                    name={componentType}
                    label={componentName}
                    required={!!requiredFlag}
                  />
                );
              })}
            </Form>
          </div>
        );
      })}
    </div>
  );
};

export default function openCustom(customList) {
  const modal = Modal.open({
    title: intl.get('smpc.product.view.specCustom').d('规格定制'),
    style: { width: 380 },
    drawer: true,
    closable: true,
    footer: (
      <Button
        onClick={() => modal.close()}
        style={{ background: '#f56349', color: '#fff', borderColor: '#f56349' }}
      >
        {intl.get('hzero.common.button.close').d('关闭')}
      </Button>
    ),
    children: <CustomView customList={customList} />,
  });
}
