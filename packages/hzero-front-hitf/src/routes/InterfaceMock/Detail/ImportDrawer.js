/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/6/11
 * @copyright HAND ® 2021
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { DataSet, Form, CodeArea, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { keys, isArray, isObject } from 'lodash';
// 引入格式化器
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
import 'codemirror/mode/javascript/javascript';
import { importFormDS } from '@/stores/InterfaceMock/InterfaceMockDS';
import getLang from '@/langs/interfaceMockLang';
import { MOCK_TAB_KEYS } from '@/constants/constants';

export default class ImportDrawer extends React.Component {
  constructor(props) {
    super(props);

    this.importFormDS = new DataSet(importFormDS());
  }

  componentDidMount() {
    const { tenantId, actionType, httpParamType, mockId } = this.props;
    this.importFormDS.create({ tenantId, actionType, httpParamType, mockId });
    this.updateDrawerProps();
  }

  updateDrawerProps() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.importFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { httpParamType, actionTypeName } = this.props;
    const { dataStr } = this.importFormDS.current.toData();
    if (!this.isValidJson(dataStr)) {
      notification.error({
        message: getLang('JSON_VALIDATE'),
      });
      return false;
    }
    if (httpParamType !== MOCK_TAB_KEYS.BODY && !this.isSingleObject(dataStr)) {
      notification.error({
        message: `${actionTypeName}${getLang('SINGLE_OBJECT_VALIDATE')}`,
      });
      return false;
    }
    const { mockId, onRefresh } = this.props;
    const confirmResult = await Modal.confirm({
      children: getLang('IMPORT_CONFIRM'),
    });
    if (confirmResult === 'cancel') {
      return false;
    }
    return this.importFormDS.submit().then((res) => {
      if (res && res.success) {
        onRefresh(mockId);
      }
    });
  }

  /**
   * 转换为JOSN结构
   */
  isValidJson(data) {
    try {
      JSON.parse(data);
    } catch (error) {
      return false;
    }
    return true;
  }

  /**
   * 是否为单层map结构
   */
  isSingleObject(data) {
    const temp = JSON.parse(data);
    if (isArray(temp)) {
      return false;
    }
    const tempKeys = keys(temp);
    for (let index = 0; index < tempKeys.length; index++) {
      const key = tempKeys[index];
      const value = temp[key];
      if (isObject(value)) {
        return false;
      }
    }
    return true;
  }

  render() {
    return (
      <Form dataSet={this.importFormDS}>
        <CodeArea
          name="dataStr"
          style={{ height: '78vh' }}
          formatter={JSONFormatter}
          options={{
            mode: { name: 'javascript', json: true },
          }}
        />
      </Form>
    );
  }
}
