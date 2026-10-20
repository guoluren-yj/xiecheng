// 寻源 - 预览分权
import React, { Component } from 'react';
import { Table, Form, DataSet, Output } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

// import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { composedFunction } from '@/utils/utils';

import PreviewDS from './PreviewDS';

import { fetchPreviewScoreManager } from '@/services/inquiryHallNewService';

@observer
class PreviewScoreManager extends Component {
  constructor(props) {
    super(props);

    this.state = {
      componentType: null, // 弹窗组件类型
      loading: false, // loading
      fields: [], // 表单/表格字段
    };
  }

  PreviewDS = new DataSet(PreviewDS());

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevParams) {
      return;
    }

    const { match: { params: prevParams = {} } = {} } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams.rfxId || null;
    const id = params.rfxId || null;
    return prevId !== id;
  }

  componentDidMount() {
    this.initPageData();
  }

  componentDidUpdate(...rest) {
    if (rest[2]) {
      this.initPageData();
    }
  }

  componentWillUnmount() {
    this.clearAll();
  }

  clearAll = () => {
    this.PreviewDS.reset();
    this.PreviewDS.loadData();
  };

  initPageData = async () => {
    const { rfxId, organizationId } = this.props;
    let data = null;
    let composeFunction = null;
    this.togglePageLoading(true);

    try {
      data = await fetchPreviewScoreManager({
        organizationId,
        rfxHeaderId: rfxId,
      });
      data = getResponse(data);
      if (!data || isEmpty(data)) {
        return;
      }

      composeFunction = composedFunction(this.initConfigData, this.initConfig);
      composeFunction(data);
    } catch (e) {
      throw e;
    } finally {
      this.togglePageLoading();
      composeFunction = null;
    }
  };

  // ds 装载数据
  initConfigData = (data = []) => {
    let newData = data;
    if (!Array.isArray(data)) {
      newData = [data];
    }

    this.PreviewDS.loadData(newData);
  };

  // config init
  initConfig = (config = {}) => {
    const { columnType = [], data = [], showType = null } = config;
    if (isEmpty(columnType) || !showType) {
      return;
    }

    const fields = this.initDSFields(columnType);
    this.setState({
      fields,
      componentType: showType,
    });

    return data;
  };

  // 初始化ds 字段
  initDSFields = (columnTypes = []) => {
    if (isEmpty(columnTypes)) {
      return;
    }

    const sortedFields = columnTypes.sort((a = {}, b = {}) => {
      return a?.index - b?.index;
    });

    const fields = [];
    sortedFields.forEach((field = {}) => {
      const { colCode: name = null, colName: label = null, ...others } = field;
      if (!name) {
        return;
      }

      this.PreviewDS.addField(name, {
        label,
        name,
      });

      fields.push({
        name,
        ...others,
      });
    });

    return fields;
  };

  // toggle page loadding function
  togglePageLoading = (loading = false) => {
    this.setState({
      loading,
    });
  };

  // table columns
  getTableColumns = (fields = []) => {
    return fields;
  };

  // form fields
  getFormFields = (fields = []) => {
    const FormFields = [];
    if (isEmpty(fields)) {
      return FormFields;
    }

    fields.forEach((item) => {
      const { name = null, ...others } = item;
      if (!name) {
        return;
      }

      const component = <Output name={name} {...others} />;
      FormFields.push(component);
    });

    return FormFields;
  };

  // render modal main
  renderMain = () => {
    const { componentType = null, fields = [] } = this.state;
    let component = null;

    if (componentType === 'form') {
      const FormFields = this.getFormFields(fields);
      component = (
        <Form dataSet={this.PreviewDS} columns={2}>
          {FormFields}
        </Form>
      );
    }

    if (componentType === 'table') {
      component = <Table border dataSet={this.PreviewDS} rowKey="colCode" columns={fields} />;
    }

    return component;
  };

  render() {
    const { loading = false } = this.state;

    return <Spin spinning={loading}>{this.renderMain()}</Spin>;
  }
}

export default PreviewScoreManager;
