/**
 * ExportDynamicExcel - 动态导出excel
 * @date: 2020-07-21
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Form, TextField, Tree, Select, Button, Modal } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { basicFormDS, dynamicColDS } from './exportDS';
import style from './index.less';

const { Option } = Select;
const modalKey = Modal.key();

/**
 *
 * @param {Object} res - 树形数据结构
 * @returns {Array} - 平铺数据结构
 */
// function dealWithData(res) {
//   const temp = [];
//   const loop = (item = {}) => {
//     temp.push(item); // 先放进外层对象
//     if (isArray(item.children)) {
//       item.children.forEach((_item) => {
//         loop(_item);
//       });
//     }
//   };
//   loop(res);
//   return temp.filter((item, index) => index === 0 || Number(item.fieldVisible));
// }

/**
 * 纯组件 - 展示型组件
 * @extends {PureComponent} React.PureComponent
 * @reactProps {string} [requestUrl=''] - 请求的url
 * @reactProps {Object} [queryParams={}] - 查询的参数
 * @return React.element
 */
export default class ExportDynamicExcel extends PureComponent {
  constructor(props) {
    const { getDynamicColDS } = props;
    super(props);
    this.dynamicColDS = new DataSet(dynamicColDS());
    getDynamicColDS(this.dynamicColDS);
  }

  basicFormDS = new DataSet(basicFormDS());

  modalRef;

  async componentDidMount() {
    // this.basicFormDS.loadData();
    // const res = await this.dynamicColDS.query();
  }

  /**
   * 渲染节点
   */
  renderNode({ record }) {
    return record.get('title');
  }

  getTreeNode({ record, dataSet }) {
    if (
      dataSet.getState('exportAppScopeMethod') === 'IMPORT' &&
      !['applicationScope', 'ladderQuotation'].includes(record.get('dimensionCode'))
    ) {
      return { disabled: true };
    }
  }

  /**
   * 渲染基础表单form
   */
  renderBasicForm() {
    const { enableAsync = true } = this.props;
    return (
      <Form
        dataSet={this.basicFormDS}
        columns={2}
        // useColon
      >
        <TextField name="fileName" />
        {/* <Select name="fillerType" /> */}
        <Select name="async" disabled={!enableAsync}>
          <Option value="false" key="false">
            {intl.get('hzero.common.status.no').d('否')}
          </Option>
          <Option value="true" key="true">
            {intl.get('hzero.common.status.yes').d('是')}
          </Option>
        </Select>
        {/* <NumberField name="singleExcelMaxSheetNum" />
        <NumberField name="singleSheetMaxRow" /> */}
      </Form>
    );
  }

  /**
   * 渲染树形动态列
   */
  renderDynamicCol() {
    const DynamicCol = observer(() => {
      return (
        <Tree
          dataSet={this.dynamicColDS}
          checkable
          defaultExpandAll
          onTreeNode={this.getTreeNode}
          // checkField='isChecked'
          renderer={this.renderNode}
        />
      );
    });
    return <DynamicCol />;
  }

  /**
   * 从props => 获取最新的参数
   * 由于闭包限制!!!
   */
  getLatestParams() {
    const {
      queryParams: { selectedRowKeys = [], viewCode, queryData = {}, pageCode },
    } = this.props;
    return {
      viewCode,
      queryData,
      selectedRowKeys: [...selectedRowKeys],
      pageCode,
    };
  }

  /**
   * 打开导出弹窗
   */
  @Bind()
  async handleShowModal() {
    const {
      requestUrl,
      configNode,
      queryParams: {
        templateCode,
        // selectedRowKeys = [], // 此刻形成了闭包, 变量释放不成功
      },
    } = this.props;
    if (!this.basicFormDS.current) {
      this.basicFormDS.create({});
    }
    if (this.modalRef) {
      this.modalRef.open();
    } else {
      this.modalRef = Modal.open({
        key: modalKey,
        title: (
          <React.Fragment>
            {intl.get('ssrc.common.view.message.title.exportExcel').d('导出Excel')}
            {configNode}
          </React.Fragment>
        ),
        style: {
          width: 550,
        },
        children: (
          <div className={style.container}>
            {this.renderBasicForm()}
            <Divider />
            <div className={style['sub-title']}>
              <span>
                {intl.get('ssrc.common.view.message.chooseExportColumns').d('选择要导出的列')}
              </span>
            </div>
            {this.renderDynamicCol()}
          </div>
        ),
        // okProps: {
        //   loading,
        // },
        onOk: async () => {
          // if (!await this.dynamicColDS.validate()) return false; // 校验不通过则直接return
          try {
            const shieldDimCodeList = this.dynamicColDS.records
              .filter((item) => item && !item.toData().isChecked)
              .map((item) => item.toData().dimensionCode); // 为勾选数据
            if (shieldDimCodeList.length === this.dynamicColDS.records.length) {
              notification.warning({
                message: intl.get('ssrc.common.message.validation.atLeast').d('请至少勾选一列导出'),
              });
              return false;
            }
            this.modalRef.update({
              okProps: {
                loading: true,
              },
            });
            const basicInfo = this.basicFormDS.current.toData();
            const { selectedRowKeys = [], viewCode, queryData = {}, pageCode } = this.getLatestParams(); // 获取最新的参数
            console.log('ceshi', pageCode);
            this.basicFormDS.setQueryParameter('queryParams', {
              viewCode,
              basicInfo,
              queryData,
              requestUrl,
              templateCode,
              selectedRowKeys,
              shieldDimCodeList,
              pageCode,
            });
            const res = await this.basicFormDS.query();
            this.downloadFile(
              res && res.priceLibraryExportUrl,
              res && res.asyncFlag,
              res && res.autoAsyncFlag
            );
          } catch (e) {
            // error统一处理
          } finally {
            this.modalRef.update({
              okProps: {
                loading: false,
              },
            });
          }
          return false;
        },
        // onCancel: () => true,
        afterClose: () => {
          this.basicFormDS.reset();
          this.dynamicColDS.reset();
        },
      });
      this.dynamicColDS.setQueryParameter('queryParams', {
        requestUrl,
        templateCode,
      });
      await this.dynamicColDS.query();
      // this.dynamicColDS.loadData(dealWithData(result));
    }
  }

  /**
   * 通过url下载文件
   * @param {string} url - download url
   * @param {string} fileName - download fileName
   */
  downloadFile(url, asyncFlag, autoAsyncFlag) {
    if (autoAsyncFlag) {
      setTimeout(() => {
        notification.success({
          message: intl
            .get('ssrc.common.message.operation.autoAsyncFlagExportSuccess')
            .d('操作成功,由于数据量太大，已经自动转为异步导出，请至文件汇总页面查看'),
        });
      }, 1000);
    } else if (asyncFlag) {
      // setTimeout(() => {
      //   notification.success({
      //     message: intl
      //       .get('ssrc.common.message.operation.asyncExportSuccess')
      //       .d('操作成功, 请至文件汇总页面查看'),
      //   });
      // }, 1000);
    } else {
      const a = document.createElement('a');
      if (url) {
        a.href = url;
        a.click();
      } else {
        notification.success({
          message: intl.get('ssrc.common.message.query.temporarilyNoData').d('暂无数据'),
        });
      }
    }

    /**
     * @remember
     * 基于后端桶名由 `public` -> 'private'
     */

    // const downloadName = fileName
    //   ? `${fileName}.xls`
    //   : `${intl.get('ssrc.common.message.export.priceLibraryDetail').d('价格库明细')}.xls`; // 或者取baseInfo中filename
    // fetch(url)
    //   .then((data) => data.blob())
    //   .then((blob) => {
    //     // IE兼容性处理
    //     if (window.navigator.msSaveOrOpenBlob) {
    //       window.navigator.msSaveOrOpenBlob(blob, downloadName);
    //     } else {
    //       const blobUrl = window.URL.createObjectURL(blob);
    //       const a = document.createElement('a');
    //       a.download = decodeURIComponent(downloadName);
    //       a.href = blobUrl;
    //       a.click();
    //     }
    //   });
  }

  render() {
    const { disabled = false, buttonName, ...other } = this.props;
    return (
      <Fragment>
        <Button disabled={disabled} {...other} onClick={this.handleShowModal} icon="unarchive">
          {buttonName || intl.get('ssrc.common.view.message.button.batchExport').d('批量导出')}
        </Button>
      </Fragment>
    );
  }
}
