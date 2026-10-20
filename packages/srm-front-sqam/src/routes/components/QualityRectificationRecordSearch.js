import React, { Component } from 'react';
import { Form, Select, Row, Col, Button, DatePicker } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
} from 'utils/constants';
import moment from 'moment';
import { getDateFormat } from 'utils/utils';
import { Bind } from 'lodash-decorators';

@formatterCollections({
  code: ['sqam.common', 'entity.item', 'hzero.common'],
})
@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    // 兼容一下class组件 forwardRef
    props.onRef(this);
    this.state = {
      showMore: false,
    };
  }

  /**
   * 重置表单点击事件
   */
  @Bind()
  reset() {
    this.props.form.resetFields();
  }

  /**
   * 更多查询条件显隐切换
   */
  @Bind()
  showMore() {
    const { showMore } = this.state;
    this.setState({
      showMore: !showMore,
    });
  }

  @Bind()
  handleSearch() {
    const { handleSearch } = this.props;
    if (handleSearch) handleSearch();
  }

  render() {
    const { form, isExport, actionList } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          {isExport && (
            <Col {...FORM_COL_4_LAYOUT}>
              <Form.Item
                label={intl.get('sqam.common.operate.processStatus').d('操作节点')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('operationActionCode')(
                  <Select allowClear>
                    {actionList.map((item) => (
                      <Select.Option
                        key={item.operationActionCode}
                        value={item.operationActionCode}
                      >
                        {item.operationActionCodeMeaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          )}
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hzero.common.date.operationCreation.from').d('操作日期从')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createdDateStart')(
                <DatePicker
                  placeholder=""
                  format={getDateFormat()}
                  disabledDate={(currentDate) =>
                    getFieldValue('createdDateEnd') &&
                    moment(getFieldValue('createdDateEnd')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hzero.common.date.operationCreation.to').d('操作日期至')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createdDateEnd')(
                <DatePicker
                  placeholder=""
                  format={getDateFormat()}
                  disabledDate={(currentDate) =>
                    getFieldValue('createdDateStart') &&
                    moment(getFieldValue('createdDateStart')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
