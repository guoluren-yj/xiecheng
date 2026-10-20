import React from 'react';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { Table } from 'hzero-ui';
import { Pagination } from 'choerodon-ui/pro';
import { stringify } from 'querystring';
import { createPagination } from 'utils/utils';
import FlexLinkModal from '@/routes/components/FlexLinkModal';

import styles from './index.less';

@connect(({ loading = {}, contractTemplate = {} }) => ({
  loading: loading.effects['contractTemplate/versionTemplate'],
  contractTemplate,
}))
@formatterCollections({
  code: ['spcm.contractTemplate', 'spcm.common', 'hzero.common', 'hzero.common'],
})
export default class HistoricVersion extends React.Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { pcTemplateId },
        state = {},
      },
      onLoad,
    } = this.props;
    this.pcTemplateId = pcTemplateId;
    this.state = {
      resPage: {},
      data: [],
      onLoad: onLoad || state?.onLoad,
    };
  }

  isPub = this.props.location.pathname.includes('/pub');

  // 判断是否为pub页面
  componentDidMount() {
    this.handleFetchVersionTemplate({ page: 0, size: 10 });
    this.fetchEnum();
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractTemplate/init',
    });
  }

  @Bind()
  handleFetchVersionTemplate(page) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractTemplate/versionTemplate',
      payload: { pcTemplateId: this.pcTemplateId, ...page },
    }).then(res => {
      if (res) {
        let content = res.content || [];
        if (content.length > 0) {
          content = content.map(item => {
            if (Array.isArray(item.children) && item.children.length > 0) {
              const children = item.children.sort((a, b) => {
                return a.sort - b.sort;
              });
              /**
               * 针对时间特殊处理
               */
              // eslint-disable-next-line
              item._level = 1;
              // eslint-disable-next-line
              item._others = children[0];
              const childrenOther = children.slice(1);
              // eslint-disable-next-line
              item.children = childrenOther.length === 0 ? null : childrenOther;
            }
            return { ...item };
          });
        }
        this.setState({
          resPage: res || {},
          data: content,
        });
      }
    });
  }

  @Bind()
  redirectDetail(record, revisionFlag) {
    const { pcTemplateId, pcTemplateFileId, _others } = record;
    this.props.history.push({
      pathname: this.isPub
        ? `/pub/spcm/contract-template/detail`
        : `/spcm/contract-template/detail`,
      search: pcTemplateId
        ? stringify({
            pcTemplateId: _others && _others.pcTemplateId ? _others.pcTemplateId : pcTemplateId,
            pcTemplateFileId:
              _others && _others.pcTemplateFileId ? _others.pcTemplateFileId : pcTemplateFileId,
            backUrl: 'version',
            versionId: this.pcTemplateId,
            revisionFlag,
          })
        : stringify({}),
    });
  }

  renderLine(data) {
    return data || '-';
  }

  renderTime(data) {
    return data ? (data || '').split(' ')[0] : '-';
  }

  getBackPath = () => {
    const { onLoad } = this.state;
    if (onLoad) {
      return null;
    }
    return this.isPub
    ? `/pub/spcm/contract-template/list/${this.pcTemplateId}`
    : '/spcm/contract-template/list';
  }

  linkElement = (record = {}, text, revisionFlag) => {
    const { onLoad } = this.state;
    if (onLoad) {
      const path = `/spcm/contract-template/detail`;
      const { pcTemplateId, pcTemplateFileId, _others } = record;
      const search = pcTemplateId
        ? stringify({
            pcTemplateId: _others && _others.pcTemplateId ? _others.pcTemplateId : pcTemplateId,
            pcTemplateFileId:
              _others && _others.pcTemplateFileId ? _others.pcTemplateFileId : pcTemplateFileId,
            backUrl: 'version',
            versionId: this.pcTemplateId,
            revisionFlag,
          })
        : stringify({});
      const _location = {
        hash: '',
        pathname: path,
        search: `?${search}`,
      };
      const flexLinkProps = {
        path,
        type: 'c7n',
        text,
        location: _location,
        match: {
          path,
          state: { onLoad },
        },
        history: {
          ...window.dvaApp._history,
          location: _location,
        },
        modalProps: {
          closable: false,
          footer: (okBtn, cancelBtn) => cancelBtn,
          cancelText: intl.get('hzero.common.btn.close').d('关闭'),
          cancelProps: {
            color: 'primary',
          },
        },
      };
      return <FlexLinkModal {...flexLinkProps} />;
    } else {
      return (
        <a onClick={() => this.redirectDetail(record, revisionFlag)}>
          {text}
        </a>
      );
    }
  };

  render() {
    const { resPage, data } = this.state;
    const {
      loading,
      contractTemplate: {
        enumMap: { langList = [] },
      },
    } = this.props;
    const columns = [
      {
        title: intl.get('spcm.contractTemplate.model.versionNum').d('版本号'),
        dataIndex: 'version',
        width: 100,
        // treeCol: true,
      },
      {
        title: intl.get('spcm.contractTemplate.model.templateName').d('模板协议名称'),
        dataIndex: 'templateName',
        width: 200,
        render: this.renderLine,
      },
      {
        title: intl.get('spcm.contractTemplate.model.contract.pcTypeName').d('协议类型'),
        width: 150,
        dataIndex: 'pcTypeName',
        render: this.renderLine,
      },
      {
        title: intl.get('spcm.common.model.templateType').d('模板类型'),
        width: 180,
        dataIndex: 'templateType',
        render: (val, record) => record.templateTypeMeaning || '-',
      },
      {
        title: intl.get('spcm.contractTemplate.model.templateFileName').d('模板文件名称'),
        width: 200,
        dataIndex: 'templateFileUrl',
        render: (val, record) => {
          const templateFileUrl = record._others
            ? record._others.templateFileUrl
            : record.templateFileUrl;
          return templateFileUrl && templateFileUrl !== 'NULL_TEMPLATE' ? (
            this.linkElement(record, templateFileUrl.split('@')[1] || '-')
          ) : (
            '-'
          );
        },
      },
      {
        title: intl.get('spcm.contractTemplate.model.cleanFileName').d('清稿版本文件'),
        width: 200,
        dataIndex: 'cleanDocumentFileName',
        render: (val, record) => {
          const cleanDocumentFileName = record._others
            ? record._others.cleanDocumentFileName
            : record.cleanDocumentFileName;
          return cleanDocumentFileName ? (
            this.linkElement(record, cleanDocumentFileName, 1)
          ) : (
            '-'
          );
        },
      },
      {
        title: intl.get('spcm.contractTemplate.model.startDateActive').d('模板起始日期'),
        width: 150,
        dataIndex: 'startDateActive',
        render: this.renderTime,
      },
      {
        title: intl.get('spcm.contractTemplate.model.endDateActive').d('模板终止日期'),
        width: 150,
        dataIndex: 'endDateActive',
        render: this.renderTime,
      },
      {
        title: intl.get('spcm.contractTemplate.model.lang').d('语言'),
        width: 100,
        dataIndex: 'lang',
        render: (val, rowData) => {
          const lang = rowData._others ? rowData._others.lang : rowData.lang;
          const langData = langList.find(item => {
            return item.value === lang;
          });
          return langData && langData.meaning;
        },
      },
      {
        title: intl.get('spcm.contractTemplate.model.enableFlag').d('是否启用'),
        width: 150,
        dataIndex: 'enabledFlag',
        render: (val, record) => {
          const enabledFlag = record._others ? record._others.enabledFlag : record.enabledFlag;
          return enabledFlag === 1
            ? intl.get('hzero.common.status.yes').d('是')
            : intl.get('hzero.common.status.no').d('否');
        },
      },
      {
        title: intl.get('spcm.contractTemplate.model.createName').d('操作人'),
        width: 150,
        dataIndex: 'createName',
        render: this.renderLine,
      },
      {
        title: intl.get('spcm.contractTemplate.model.creationDate').d('创建时间'),
        width: 150,
        dataIndex: 'creationDate',
        render: (val, record) => {
          if (record._level === 1) {
            return record.creationDate;
          } else {
            return this.renderTime('');
          }
        },
      },
    ];
    return (
      <React.Fragment>
        <Header
          backPath={this.getBackPath()}
          title={intl.get('spcm.contractTemplate.model.version').d('版本历史记录')}
        />
        <Content>
          <Table
            // isTree
            rowKey="backTemplateId"
            dataSource={data || []}
            border={false}
            columns={columns}
            minHeight={260}
            height={400}
            loading={loading}
            className={styles.table}
            pagination={false}
          />
          <div style={{ float: 'right', marginTop: 8 }}>
            <Pagination
              {...createPagination(resPage)}
              page={resPage.number + 1}
              pageSize={resPage.size}
              showTotal
              onShowSizeChange={(current, pageSize) =>
                this.handleFetchVersionTemplate({
                  size: pageSize,
                  page: current ? current - 1 : 0,
                })
              }
              onChange={(current, pageSize) => {
                this.handleFetchVersionTemplate({
                  size: pageSize,
                  page: current ? current - 1 : 0,
                });
              }}
            />
          </div>
        </Content>
      </React.Fragment>
    );
  }
}
