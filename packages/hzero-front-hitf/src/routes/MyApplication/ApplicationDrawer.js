import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty, uniqBy } from 'lodash';
import { interfaceTableDS } from '@/stores/MyApplication/MyApplicationDS';
import getLang from '@/langs/myApplicationLang';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import { SOURCE_TYPE_TAG } from '@/constants/constants';
import ApplyModal from './ApplyModal';

export default class ApplicationDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.interfaceTableDS = new DataSet(
      interfaceTableDS({
        onLoad: this.handleLoad,
        onUnSelect: this.handleUnSelect,
      })
    );
    this.state = {
      currentSelectedInterface: props.prevSelectedInterface,
    };
  }

  componentDidMount() {
    this.updateModalProps();
  }

  @Bind()
  updateModalProps() {
    this.props.modal.update({
      onOk: this.openApplyModal,
    });
  }

  @Bind()
  handleUnSelect({ record }) {
    const { currentSelectedInterface } = this.state;
    const temps = currentSelectedInterface.filter(
      (item) => record.get('interfaceId') !== item.interfaceId
    );
    this.setState({ currentSelectedInterface: temps });
  }

  @Bind()
  handleLoad({ dataSet }) {
    const { currentSelectedInterface } = this.state;
    const batchRecords = [];
    // 接口列表加载，自动勾选上已经选择的接口
    currentSelectedInterface.forEach((item) => {
      const existRecord = dataSet.find((record) => record.get('interfaceId') === item.interfaceId);
      if (existRecord) {
        batchRecords.push(existRecord);
      }
    });
    dataSet.batchSelect(batchRecords);
  }

  /**
   * 打开提交窗口
   */
  @Bind()
  openApplyModal() {
    const { applyId } = this.props;
    const { currentSelectedInterface } = this.state;
    const temps = [
      ...currentSelectedInterface,
      ...this.interfaceTableDS.selected.map((record) => record.toData()),
    ];
    const interfaces = uniqBy(temps, 'interfaceId');
    if (isEmpty(interfaces)) {
      notification.error({
        message: getLang('EMPTY_INTERFACE_VALIDATE'),
      });
      return false;
    }
    const modalProps = {
      applyId,
      interfaces,
      onCallback: this.handleCallback,
    };
    Modal.open({
      key: 'applyModal',
      title: getLang('HEADER'),
      closable: true,
      destroyOnClose: true,
      okText: getLang('SURE'),
      children: <ApplyModal {...modalProps} />,
    });
    return false;
  }

  @Bind()
  handleCallback() {
    const { onRefresh } = this.props;
    this.props.modal.close();
    onRefresh();
  }

  get interfaceColumns() {
    return [
      {
        name: 'interfaceCode',
        width: 150,
      },
      {
        name: 'interfaceName',
        width: 150,
      },
      {
        name: 'serverCode',
        width: 150,
      },
      {
        name: 'serverName',
        width: 150,
      },
      {
        name: 'namespace',
        width: 120,
      },
      {
        name: 'sourceType',
        width: 100,
        renderer: ({ value, text }) => TagRender(value, SOURCE_TYPE_TAG, text),
      },
    ];
  }

  render() {
    return <Table dataSet={this.interfaceTableDS} columns={this.interfaceColumns} />;
  }
}
