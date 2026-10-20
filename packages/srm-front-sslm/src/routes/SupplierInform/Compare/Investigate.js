import React from 'react';
import { sum, isNumber } from 'lodash';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import TransferLov from 'srm-front-cuz/lib/components/Customize/LovMulti/index';

import { formatInternationalTel } from '@/routes/components/utils';
import { getWidthFromWord } from './utils';
import '@/routes/index.less';

// const FormItem = Form.Item;

// const formItemLayout = {
//   labelCol: { span: 9 },
//   wrapperCol: { span: 15 },
// };

const componentType_ = {
  Upload: val => (
    <UploadModal
      attachmentUUID={val}
      filePreview
      bucketName={PRIVATE_BUCKET}
      bucketDirectory="spfm-comp"
      viewOnly
    />
  ),
  ValueList: (val, fieldCode, data) => data[`${fieldCode}Meaning`] || val,
  Lov: (val, fieldCode, data) => data[`${fieldCode}Meaning`] || val,
  Switch: val =>
    val === 1
      ? intl.get('hzero.common.status.yes').d('是')
      : intl.get('hzero.common.status.no').d('否'),
  Checkbox: val =>
    +val === 1
      ? intl.get('hzero.common.status.yes').d('是')
      : intl.get('hzero.common.status.no').d('否'),
  DatePicker: val => dateRender(val),
  TransferLov: (val, fieldCode, data, other = {}) => {
    const { lovCode = '', tenantId, props = [] } = other;
    const queryUsePostAttribute = props.find(item => item.attributeName === 'queryUsePost');
    const postFlag = queryUsePostAttribute ? queryUsePostAttribute.attributeValue : false;
    return (
      <TransferLov
        code={lovCode}
        value={val}
        queryParams={{ tenantId }}
        viewOnly
        queryUsePost={!!postFlag}
      />
    );
  },
};

// 处理调查表配置属性
const getComponentProps = (props = []) => {
  const allProps = {};
  props.forEach(prop => {
    const dealProp = prop.attributeValue;
    if (dealProp !== undefined) {
      allProps[prop.attributeName] = dealProp;
    }
  });
  return allProps;
};

const InvestigateTable = ({ configData, dataSource }) => {
  const { configName, lines } = configData;
  const columns = (lines || []).map(({ fieldDescription, fieldCode, componentType, ...other }) => {
    const componentProps = getComponentProps(other.props);
    return {
      title: fieldDescription,
      dataIndex: fieldCode,
      width: componentProps.mobilephoneFlag ? 250 : getWidthFromWord(fieldDescription),
      render: (val, record) => (
        <div
          className={
            record.firmChangeBeanStateFlag === 'insert' ||
            (componentProps.mobilephoneFlag &&
              record.internationalTelCodeStateFlag !== 'original') ||
            record[`${fieldCode}StateFlag`] !== 'original'
              ? 'sslm-compare-info-style'
              : ''
          }
        >
          {componentProps.mobilephoneFlag
            ? formatInternationalTel(record.internationalTelMeaning, val)
            : configName === 'sslmInvestgAddress' && fieldCode === 'regionId'
            ? record.regionPathName
            : fieldCode === 'attachmentType'
            ? record[`${fieldCode}Meaning`] || val
            : componentType_[componentType]
            ? componentType_[componentType](val, fieldCode, record, other)
            : val}
        </div>
      ),
    };
  });
  const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      bordered
      pagination={false}
      scroll={{ x: scrollX }}
    />
  );
};

// form 暂时无数据未处理
const InvestigateForm = () => {
  // const data_ = data[0] || {};
  // return (configData[investgCfHeaderId] || []).map(
  //   ({ fieldDescription, fieldCode, componentType }) => {
  //     return (
  //       <Col span={12}>
  //         <FormItem {...formItemLayout} label={fieldDescription}>
  //           <div
  //             style={{
  //               color: data_[`${fieldCode}StateFlag`] !== 'original' && 'red',
  //             }}
  //           >
  //             {componentType_[componentType]
  //               ? componentType_[componentType](data_[fieldCode], fieldCode, data_)
  //               : data_[fieldCode]}
  //           </div>
  //         </FormItem>
  //       </Col>
  //     );
  //   }
  // );
  return <div>1</div>;
};

export { InvestigateTable, InvestigateForm };
