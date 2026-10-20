import React from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';
import { TextArea, DataSet, Select, Form } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';

import svgImage from './app_head.svg';
import styles from './index.less';

function SelectDs({ lovCode, fieldName, multiple, customUrl, routeName, lovTypeCode }) {
  const tenantId = getCurrentOrganizationId();
  return {
    autoQuery: true,
    fields:
      lovTypeCode === 'URL'
        ? [
            // 独立值集
            {
              name: 'selectFieldName',
              label: fieldName,
              type: 'string',
              lookupCode: lovCode,
              multiple,
              lookupAxiosConfig: () => {
                const url = customUrl ? customUrl.replace(/{(.*?)}/g, tenantId) : '';
                return {
                  url: `/${routeName}${url}`,
                  method: 'GET',
                };
              },
            },
          ]
        : [
            {
              name: 'selectFieldName',
              label: fieldName,
              type: 'string',
              lookupCode: lovCode,
              multiple,
            },
          ],
  };
}

function ButtonField(props) {
  const { type = 'default', text = 'button' } = props;
  return <div className={`preview-button-field button-field-${type}`}>{text}</div>;
}
function PreviewCard(prop) {
  const colorMap = {
    1: 'primary',
    2: 'info',
    3: 'plain',
  };
  const { dataSet, cardButtonEditDataSet, fields, cardVerticalContentEditSet, selectFields } = prop;

  return (
    <div className={styles['preview-container']}>
      <img className="preview-container-header" src={svgImage} alt="header" />
      <div className="preview-container-content">
        <div className="preview-card">
          <h3 className="preview-card-title">
            {dataSet?.current?.get('title') ||
              intl.get('smbl.purchaseRobotConfig.view.cardTitle').d('标题')}
          </h3>
          <div className="preview-card-subTitle">
            {dataSet?.current?.get('desc') ||
              intl.get('smbl.purchaseRobotConfig.view.cardDesc').d('描述')}
          </div>
          <div className="preview-card-picture">
            {dataSet?.current?.get('cardImag') && dataSet.current.get('cardImag') !== '-' && (
              <img
                alt=""
                className="preview-card-picture-img"
                src={dataSet.current.get('cardImag')}
              />
            )}
          </div>
          <div className="preview-card-field">
            {fields.map((field) => (
              <div className="preview-card-field-item" key={field.name}>
                <span>{field.fieldName || ''}：</span>
                <span>-</span>
              </div>
            ))}
          </div>
          <div className="preview-card-field">
            {selectFields.map((field) => {
              const ds = new DataSet(SelectDs({ ...field }));
              return (
                <div className="preview-card-field-item" key={field.name}>
                  <Form labelLayout="float" dataSet={ds}>
                    <Select name="selectFieldName" />
                  </Form>
                </div>
              );
            })}
          </div>
          {cardVerticalContentEditSet?.current && (
            <div className="preview-card-vertical-content">
              <h3 className="preview-card-vertical-content-title">
                {cardVerticalContentEditSet.current.get('title')}
              </h3>
              <TextArea
                className="preview-card-vertical-content-desc"
                style={{ width: '100%' }}
                autoSize
                value={cardVerticalContentEditSet.current.get('desc')}
              />
            </div>
          )}
          <div className="preview-card-button">
            {cardButtonEditDataSet.records.map((record) => (
              <ButtonField
                type={colorMap[record.get('buttonStyle')]}
                text={record.get('buttonName')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default formatterCollections({
  code: ['smbl.purchaseRobotConfig', 'smbl.common', 'hzero.common'],
})(observer(PreviewCard));
