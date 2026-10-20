import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Collapse, Form, Row, Col, Icon, Spin } from 'hzero-ui';
import { isString, min, max, sum, isNumber, isEmpty, isNil, keyBy, merge, values } from 'lodash';
import intl from 'utils/intl';
import UploadModal from 'components/Upload';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';

import { EDIT_FORM_ROW_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';
import styles from './index.less';

const { Panel } = Collapse;
const FormItem = Form.Item;

export default class CatelogRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }

  componentDidMount() {}

  @Bind()
  getWidthFromWord(
    word,
    minWidth = 80,
    maxWidth,
    defaultWidth = 100,
    fontWidth = 14,
    paddingWidth = 36
  ) {
    let ret = defaultWidth;
    if (isString(word)) {
      ret = word.length * fontWidth;
      if (min) {
        ret = max([ret, minWidth]);
      }
      if (max) {
        ret = min([ret, maxWidth]);
      }
      ret += paddingWidth;
    }
    return ret;
  }

  @Bind()
  handleCollapse() {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  @Bind()
  renderForm(fields) {
    const {
      data = {},
      isNewFlag,
      customizeForm,
      customizeUnitCode,
      form = {},
      custConfig = {},
      custLoading,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    if (isEmpty(custConfig) || isEmpty(data)) {
      return;
    }

    if (isEmpty(data)) {
      return (
        <div className="not-found-content">
          {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
        </div>
      );
    }

    const itemList = (custConfig[customizeUnitCode]?.fields || [])
      .map((field) => {
        const { fieldCode, fieldType, fieldName, visible, standardField } = field;
        if (fieldCode.includes('Lov') || visible === 0) return null;
        const { dataIndex, dataIndexFlagRender, transformResponse, label, hiddenFlag } =
          fields.find((item) => item.dataIndex === fieldCode) || {};
        if (!standardField && visible === -1) return null;
        if ((standardField && !dataIndex) || (hiddenFlag && hiddenFlag(data))) return null;
        // 有些类型(如LINK)的走个性化render，无法做标红处里，不做标红处里
        if (fieldType === 'LINK') return null;
        const newLabel = visible === -1 ? label || fieldName : fieldName || label;
        return (
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem label={newLabel}>
                {getFieldDecorator(dataIndex || fieldCode, {
                  initialValue: transformResponse
                    ? transformResponse(data[dataIndex], data, dataIndex)
                    : componentType_[fieldType]
                    ? componentType_[fieldType](data[fieldCode], field, data)
                    : data[`${fieldCode}Meaning`] || data[fieldCode],
                })(
                  <span
                    className={
                      data &&
                      isNewFlag &&
                      (data[`${dataIndex || fieldCode}Flag`] === 'UPDATE' ||
                        data[`${dataIndexFlagRender || fieldCode}Flag`] === 'UPDATE') &&
                      styles.changed
                    }
                  >
                    {transformResponse
                      ? transformResponse(data[dataIndex], data, dataIndex)
                      : componentType_[fieldType]
                      ? componentType_[fieldType](data[fieldCode], field, data)
                      : data[`${fieldCode}Meaning`] || data[fieldCode]}
                  </span>
                )}
              </FormItem>
            </Col>
          </Row>
        );
      })
      .filter(Boolean);

    const FromFragment = <Form custLoading={custLoading}>{itemList}</Form>;

    return customizeForm
      ? customizeForm(
          {
            code: customizeUnitCode,
            form,
            readOnly: true,
            dataSource: data,
          },
          FromFragment
        )
      : FromFragment;
  }

  @Bind()
  renderTable(fields) {
    const {
      data = [],
      isNewFlag,
      customizeTable,
      customizeUnitCode,
      custConfig = {},
      catelogId,
    } = this.props;
    const { contextParams } = this;
    if (isEmpty(custConfig) || isEmpty(data)) {
      return;
    }
    const standardFields = fields.filter((f) => !!f);
    let merged = fields;
    if (customizeUnitCode && custConfig[customizeUnitCode]?.fields) {
      // 合并fields和个性化单元fields的值。
      merged = values(
        merge(
          keyBy(custConfig[customizeUnitCode]?.fields, 'fieldCode'),
          keyBy(standardFields, 'dataIndex')
        )
      );
    }
    let columns = (merged || []).map((field) => {
      const {
        fieldCode,
        fieldType,
        fieldName,
        visible,
        standardField,
        dataIndex,
        transformResponse,
        label,
        hiddenFlag,
      } = field;
      if ((fieldCode && fieldCode.includes('Lov')) || visible === 0) return null;
      const newFieldCode = dataIndex || fieldCode;
      if (!standardField && visible === -1) return null;
      if ((standardField && !dataIndex) || (hiddenFlag && hiddenFlag(data))) return null;
      const newLabel = visible === -1 ? label || fieldName : fieldName || label;
      // 有些类型(如LINK)的走个性化render，无法做标红处里，不做标红处里
      const renderColumns =
        fieldType !== 'LINK'
          ? {
              render: (val, record) => (
                <div
                  className={
                    isNewFlag &&
                    (record[`${newFieldCode}Flag`] === 'UPDATE' ||
                      record.objectFlag === 'CREATE') &&
                    styles.changed
                  }
                >
                  {transformResponse
                    ? transformResponse(val, record)
                    : componentType_[fieldType]
                    ? componentType_[fieldType](
                        val,
                        { ...field, fieldCode: newFieldCode },
                        record,
                        contextParams
                      )
                    : val}
                </div>
              ),
            }
          : {};
      return {
        title: newLabel,
        dataIndex: newFieldCode,
        width: this.getWidthFromWord(newLabel),
        ...renderColumns,
      };
    });
    columns = columns.filter((item) => !!item);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable ? (
      customizeTable(
        {
          code: customizeUnitCode,
          namespace: catelogId,
        },
        <EditTable
          style={{ margin: '0px' }}
          dataSource={data}
          rowClassName={(record) => record.objectFlag === 'DELETE' && 'table-row-line-through'}
          columns={columns}
          bordered
          pagination={false}
          scroll={{ x: scrollX }}
        />
      )
    ) : (
      <EditTable
        style={{ margin: '0px' }}
        dataSource={data}
        rowClassName={(record) => record.objectFlag === 'DELETE' && 'table-row-line-through'}
        columns={columns}
        bordered
        pagination={false}
        scroll={{ x: scrollX }}
      />
    );
  }

  render() {
    const { loading, catelogId, catelogTitle, fields, isTable, isCollpased } = this.props;
    const { collapsed } = this.state;

    return (
      <div className="collapse-wrapper">
        <Collapse onChange={this.handleCollapse} defaultActiveKey={isCollpased ? '1' : '0'}>
          <Panel
            key="1"
            id={catelogId}
            className="form-collapse"
            header={
              <Fragment>
                <a>{<Icon style={{ fontSize: '17px' }} type={collapsed ? 'up' : 'down'} />}</a>
                <h3>{catelogTitle}</h3>
              </Fragment>
            }
            showArrow={false}
          >
            <Spin spinning={loading}>
              {isTable ? this.renderTable(fields) : this.renderForm(fields)}
            </Spin>
          </Panel>
        </Collapse>
      </div>
    );
  }
}

const componentType_ = {
  UPLOAD: (val) => (
    <UploadModal
      attachmentUUID={val}
      filePreview
      bucketName={PRIVATE_BUCKET}
      bucketDirectory="spfm-comp"
      viewOnly
    />
  ),
  SELECT: (val, field, data) => {
    const { fieldCode } = field;
    const value = data[fieldCode];
    let meaning = data[`${fieldCode}Meaning`];
    if (!isNil(meaning)) {
      meaning = typeof meaning === 'object' ? Object.values(meaning).join('/') : meaning;
    } else {
      meaning = value;
    }
    return meaning;
  },
  LOV: (val, field, data) => {
    const { multipleFlag, fieldCode, lovCode } = field;
    const meaning = data[`${fieldCode}Meaning`] || data[`${fieldCode}Name`] || val;
    if (multipleFlag) {
      return <LovMulti value={val} translateData={meaning} code={lovCode} viewOnly />;
    }
    return meaning;
  },
  SWITCH: (val) => yesOrNoRender(Number(val || 0)),
  CHECKBOX: (val) => yesOrNoRender(Number(val || 0)),
  DATE_PICKER: (val) => dateRender(val),
  INPUT: (val) => val,
  INPUT_NUMBER: (val) => val,
  TEXT_AREA: (val) => val,
};
