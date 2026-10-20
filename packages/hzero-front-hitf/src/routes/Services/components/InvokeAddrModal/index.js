import React, { PureComponent } from 'react';
import { DataSet, Table, Dropdown, Menu, Tooltip, Modal } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { INTERFACE_STATUS_TAGS, SERVICE_TYPE_TAGS } from '@/constants/constants';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { API_HOST, HZERO_HITF } from 'hzero-front/lib/utils/config';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import * as ClipBoard from 'clipboard-polyfill/text';
import { invokeAddrTableDS, requestPayloadDS } from '@/stores/Services/invokeAddrDS';
import RequestPayloadModal from './RequestPayloadModal';
import TestCaseModal from './TestCaseModal';

export default class InvokeAddrModal extends PureComponent {
  constructor(props) {
    super(props);

    this.invokeAddrTableDS = new DataSet(invokeAddrTableDS());
    this.requestPayloadDS = new DataSet(requestPayloadDS());
    this.state = {
      invokeUrlVersions: [],
    };
  }

  async componentDidMount() {
    const { interfaceServerId, tenantId, interfaceCode } = this.props;
    const result = (await this.requestPayloadDS.getField('invokeUrlVersion').fetchLookup()) || [];
    this.invokeAddrTableDS.setQueryParameter('interfaceServerId', interfaceServerId);
    this.invokeAddrTableDS.setQueryParameter('tenantId', tenantId);
    if (interfaceCode) {
      this.invokeAddrTableDS.setQueryParameter('interfaceCode', interfaceCode);
    }
    this.invokeAddrTableDS.query();
    this.setState({ invokeUrlVersions: result });
  }

  @Bind()
  handleCopyInvokeAddr(record = {}, invokeVersion = 'v1') {
    const { publishUrls = [] } = record;
    const publishUrl = publishUrls[invokeVersion];
    const absolutePublishUrl = this.getAbsolutePublishUrl(publishUrl);
    ClipBoard.writeText(absolutePublishUrl).then(
      // eslint-disable-next-line func-names
      function () {
        notification.success({
          message: intl.get('hitf.services.model.services.copySuccess').d('复制成功'),
        });
      }
    );
  }

  /**
   * 获取绝对路径的发布地址
   * @param publishUrl publishUrl
   * @returns {string} AbsolutePublishUrl
   */
  @Bind()
  getAbsolutePublishUrl(publishUrl = '') {
    return ''.concat(API_HOST).concat(HZERO_HITF).concat(publishUrl);
  }

  @Bind()
  openRequestPayloadModal(record) {
    const requestPayloadModalProps = {
      record,
    };
    Modal.open({
      title: intl.get('hitf.services.view.title.requestPayload').d('请求报文'),
      closable: true,
      style: { width: 1000 },
      okText: intl.get('hzero.common.button.copy').d('复制'),
      children: <RequestPayloadModal {...requestPayloadModalProps} />,
    });
  }

  @Bind()
  openTestCaseModal(record) {
    const { tenantId, hiddenRequestMethodOption, onFetchDocument = () => {} } = this.props;
    const { interfaceId } = record;
    const testCaseProps = {
      tenantId,
      interfaceId,
      hiddenRequestMethodOption,
    };
    onFetchDocument(interfaceId);
    Modal.open({
      title: intl.get('hitf.services.model.services.testcase').d('测试用例'),
      closable: true,
      style: { width: 1000 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
      children: <TestCaseModal {...testCaseProps} />,
    });
  }

  get invokeAddrTableColumns() {
    const { hiddenRequestPayload } = this.props;
    const { invokeUrlVersions } = this.state;
    const menu = (record, func) => {
      return (
        <Menu>
          {invokeUrlVersions.map((item) => (
            <Menu.Item key={item.value} onClick={() => func(record, item.value)}>
              {item.meaning}
            </Menu.Item>
          ))}
        </Menu>
      );
    };
    return [
      {
        name: 'interfaceName',
        width: 180,
      },
      {
        name: 'interfaceCode',
        width: 160,
      },
      {
        name: 'publishType',
        align: 'center',
        renderer: ({ value, record }) => {
          return TagRender(value, SERVICE_TYPE_TAGS, record.get('publishTypeMeaning'));
        },
        width: 100,
      },
      {
        name: 'status',
        align: 'center',
        width: 100,
        renderer: ({ value, record }) => {
          return TagRender(value, INTERFACE_STATUS_TAGS, record.get('statusMeaning'));
        },
      },
      {
        name: 'publishUrl',
        renderer: ({ value }) => {
          return this.getAbsolutePublishUrl(value);
        },
      },
      {
        name: 'formatVersion',
        width: 80,
        align: 'center',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: hiddenRequestPayload ? 180 : 270,
        align: 'center',
        lock: 'right',
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'copy',
              ele: (
                <Dropdown
                  overlay={menu(record.toData(), this.handleCopyInvokeAddr)}
                  trigger={['contextMenu']}
                >
                  <ButtonPermission
                    type="text"
                    onClick={() => this.handleCopyInvokeAddr(record.toData())}
                  >
                    <Tooltip
                      title={intl
                        .get('hitf.services.model.services.moreVersion')
                        .d('默认复制v1版本，右击可选择更多版本')}
                      placement="top"
                    >
                      {intl.get('hitf.services.model.services.copyAddr').d('复制透传地址')}
                    </Tooltip>
                  </ButtonPermission>
                </Dropdown>
              ),
              len: 6,
              title: intl.get('hitf.services.model.services.copyAddr').d('复制透传地址'),
            },
            !hiddenRequestPayload && {
              key: 'requestPayload',
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.openRequestPayloadModal(record.toData())}
                >
                  {intl.get('hitf.services.model.services.obtainRequestPayload').d('获取请求报文')}
                </ButtonPermission>
              ),
              len: 6,
            },
            {
              key: 'testcase',
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.openTestCaseModal(record.toData())}
                >
                  {intl.get('hitf.services.model.services.testcase').d('测试用例')}
                </ButtonPermission>
              ),
              len: 4,
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ];
  }

  render() {
    return <Table dataSet={this.invokeAddrTableDS} columns={this.invokeAddrTableColumns} />;
  }
}
