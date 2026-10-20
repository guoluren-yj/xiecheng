/*
 * @Description: c7n通用导出
 * @Date: 2020-07-30 14:46:08
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
/**
 * ExportDynamicExcel - 动态导出excel
 * @date: 2020-07-21
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Form, TextField, Tree, Select, NumberField, Modal } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isArray } from 'lodash';
import { Button as PermissionButton } from 'components/Permission';
import request from 'utils/request';
import { getDatas } from '@/utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { basicFormDS, dynamicColDS } from './mainDS';
import style from './index.less';

const { Option } = Select;
const modalKey = Modal.key();

/**
 *
 * @param {Object} res - 树形数据结构
 * @returns {Array} - 平铺数据结构
 */
function dealWithData(res) {
  const temp = [];
  const loop = (item = {}) => {
    temp.push(item); // 先放进外层对象
    if (isArray(item.children)) {
      item.children.forEach((_item) => {
        loop(_item);
      });
    }
  };
  loop(res);
  return temp;
}

/**
 * 纯组件 - 展示型组件
 * @extends {PureComponent} React.PureComponent
 * @reactProps {string} [requestUrl=''] - 请求的url
 * @reactProps {Object} [queryParams={}] - 查询的参数
 * @return React.element
 */
export default class ExportDynamicExcel extends PureComponent {
  basicFormDS = new DataSet(basicFormDS());

  dynamicColDS = new DataSet(dynamicColDS());

  modalRef;

  fileName;

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

  /**
   * 渲染基础表单form
   */
  renderBasicForm() {
    const { enableAsync = false } = this.props;
    return (
      <Form
        dataSet={this.basicFormDS}
        columns={2}
        // useColon
      >
        <TextField name="fileName" />
        <Select name="fillerType" />
        <Select name="async" disabled={!enableAsync}>
          <Option value="false" key="false">
            {intl.get('hzero.common.status.no').d('否')}
          </Option>
          <Option value="true" key="true">
            {intl.get('hzero.common.status.yes').d('是')}
          </Option>
        </Select>
        <NumberField name="singleExcelMaxSheetNum" />
        <NumberField name="singleSheetMaxRow" />
      </Form>
    );
  }

  /**
   * 渲染树形动态列
   */
  renderDynamicCol() {
    return (
      <Tree
        dataSet={this.dynamicColDS}
        checkable
        defaultExpandAll
        // checkField='isChecked'
        renderer={this.renderNode}
      />
    );
  }

  /**
   * 获取rowKeys
   */
  getSelectedRowKeys() {
    const {
      queryParams: { selectedRowKeys = [] },
    } = this.props;
    return [...selectedRowKeys];
  }

  /**
   * 打开导出弹窗
   */
  @Bind()
  async handleShowModal() {
    const { requestUrl } = this.props;
    if (this.modalRef) {
      this.basicFormDS.loadData([]);
      this.basicFormDS.create({}, 0);
      this.modalRef.open();
    } else {
      this.basicFormDS.loadData([]);
      this.basicFormDS.create({}, 0);
      this.modalRef = Modal.open({
        key: modalKey,
        title: intl.get('sbud.budgeting.view.message.title.exportExcel').d('导出Excel'),
        style: {
          width: 550,
        },
        destroyOnClose: true,
        children: (
          <div className={style.container}>
            {this.renderBasicForm()}
            <Divider />
            <div className={style['sub-title']}>
              <span>
                {intl.get('sbud.budgeting.view.message.chooseExportColumns').d('选择要导出的列')}
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
            const shieldCodeList = this.dynamicColDS.records
              .filter((item) => item && !item.toData().isChecked)
              .map((item) => item.toData().budgetItemCode); // 为勾选数据

            if (shieldCodeList.length === this.dynamicColDS.records.length) {
              notification.warning({
                message: intl
                  .get('sbud.budgeting.message.validation.atLeast')
                  .d('请至少勾选一列导出'),
              });
              return false;
            }
            this.modalRef.update({
              okProps: {
                loading: true,
              },
            });
            console.log(this.basicFormDS.current, this.basicFormDS);
            const basicInfo = this.basicFormDS.current.toData();
            const selectedRowKeys = this.getSelectedRowKeys(); // 获取最新的rowKeys
            const { queryParams } = this.props;
            this.basicFormDS.setQueryParameter('queryParams', {
              basicInfo,
              requestUrl,
              ...queryParams,
              selectedRowKeys,
              shieldCodeList,
            });
            const { fileName, fillerType, singleSheetMaxRow, singleExcelMaxSheetNum } = basicInfo;
            const {
              templateCode,
              selectedRowKeys: paramsSelectedRowKeys,
              ...othersParams
            } = queryParams;
            const others = getDatas(othersParams);
            const queryFormValues = this.basicFormDS.current.toData();
            console.log(requestUrl, others);
            const res = await request(requestUrl, {
              method: 'GET',
              responseType: 'blob',
              query: {
                fileName,
                fillerType,
                templateCode,
                singleSheetMaxRow,
                singleExcelMaxSheetNum,
                budgetIds: selectedRowKeys.join(','),
                exportColumnFlag: 0,
                shieldCodeList: shieldCodeList.join(','),
                paramMap: JSON.stringify({
                  ...others,
                }),
              },
            });
            // const res1 = await this.basicFormDS.query();
            const { newFileName = this.fileName } = queryFormValues;
            const blobObj = new Blob([res], { type: 'application/vnd.ms-excel' });

            if (window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(blobObj, `${newFileName}.xls`);
            } else {
              const blobUrl = window.URL.createObjectURL(blobObj);
              const a = document.createElement('a');
              a.download = decodeURIComponent(`${newFileName}.xls`);
              a.href = blobUrl;
              a.click();
            }
            return true;
          } catch (e) {
            console.log(e);
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
      });
      const result = await this.dynamicColDS.query();
      const { fileName } = result;
      this.fileName = fileName;
      this.dynamicColDS.loadData(dealWithData(result));
    }
  }

  render() {
    const { disabled = true } = this.props;
    return (
      <Fragment>
        <PermissionButton
          type="c7n-pro"
          icon="export"
          disabled={disabled}
          onClick={this.handleShowModal}
          permissionList={[
            {
              code: 'srm.finance.budget_management.budgeting.ps.button.export',
              type: 'button',
              meaning: '批量导出按钮权限',
            },
          ]}
        >
          {intl.get('sbud.budgeting.view.message.button.batchExport').d('批量导出')}
        </PermissionButton>
      </Fragment>
    );
  }
}
