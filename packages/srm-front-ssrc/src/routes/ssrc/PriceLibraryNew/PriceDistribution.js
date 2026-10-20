import React from 'react';
import { PerformanceTable, Button } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { isEmpty, isFunction, isArray } from 'lodash';
import { getResponse } from 'utils/utils';
import { getEditPerformanceTableData } from '@/utils/utils';
import { distributionPriceLib, fetchBlacklistConfig } from '@/services/priceLibraryNewService';

import { PriceLibraryNew, HOCComponent } from './Update';

class PriceDistribution extends PriceLibraryNew {
  componentDidMount() {
    const { distribueColumnList } = this.props;
    this.handleAfterQueryFields(distribueColumnList);
    this.updateModal();
    // 查询配置表【价格库新功能黑名单】价格库新功能黑名单
    this.fetchBlacklistConfig();
  }

  componentDidUpdate() {
    const { modal } = this.props;
    const { tableData, releaseLoading } = this.state;
    modal.update({
      okProps: {
        disabled: isEmpty(tableData),
        loading: releaseLoading,
      },
    });
  }

  @Bind
  updateModal() {
    const { modal } = this.props;
    modal.update({
      onOk: () => {
        return this.handleConfirm();
      },
    });
  }

  @Bind()
  async fetchBlacklistConfig() {
    const res = getResponse(await fetchBlacklistConfig());
    if (res) {
      this.setState({ invOrganizationItemCheckFlag: res?.invOrganizationItemCheckFlag });
    }
  }

  /**
   * 设置必输项
   */
  @Bind()
  renderRequired() {
    return false;
  }

  /**
   * 渲染fieldType
   */
  @Bind()
  renderFieldType(field = {}, currencyCodeFlag) {
    let fieldConfig = super.renderFieldType(field, currencyCodeFlag) || {};
    // let fieldConfig={};
    switch (field.fieldWidget) {
      case 'SELECT':
        fieldConfig = {
          ...fieldConfig,
          // multiple: Number(field.multipleFlag) === 1 ? ',' : false,
          multiple: Number(field.multipleFlag) === 1,
        };
        break;
      case 'LOV':
        fieldConfig = {
          ...fieldConfig,
          multiple: Number(field.multipleFlag) === 1,
          // transformRequest: value => (isObject(value) ? value[field.valueField] : value),
        };
        console.log(fieldConfig);
        break;
      default:
        break;
    }
    return fieldConfig;
  }

  @Bind
  getTableButtons() {
    const { checkValues } = this.state;
    return [
      <Button
        onClick={() => this.handleAdd()}
        type="c7n-pro"
        icon="playlist_add"
        funcType="flat"
        key="add"
        color="primary"
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        icon="delete_sweep"
        color="primary"
        funcType="flat"
        onClick={() => this.handleDelete()}
        key="delete"
        disabled={checkValues.length === 0}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>,
    ];
  }

  renderQueryParams(field, record) {
    let queryParams = {};
    if (!isEmpty(field.priceLibLovParamList)) {
      field.priceLibLovParamList.forEach((item) => {
        if (item.paramType === 'FIXED_VALUE') {
          queryParams = { ...queryParams, [item.paramName]: item.paramValue };
        } else if (item.paramType === 'DIMENSION') {
          const value = record.get(`${item.paramValue}`);
          queryParams = { ...queryParams, [item.paramName]: isArray(value) ? undefined : value };
        }
      });
    }
    return queryParams;
  }

  @Bind
  async handleConfirm() {
    const {
      checkValues,
      distribueColumnList = [],
      onRefresh,
      routerParams: { viewCode },
    } = this.props;
    const { tableData: stateTableData } = this.state;
    // 获取弹窗里的数据
    const dataSource = await getEditPerformanceTableData(stateTableData, [
      'priceLibId',
      'sourceFromId',
      'sourceFromNum',
      'sourceFromLnId',
      'sourceFromLnNum',
    ]);

    const tableData = [];
    // 组合数据
    dataSource.forEach((item) => {
      const columnData = [];
      distribueColumnList.forEach((column) => {
        const { dimensionCode, dimensionFrom } = column;
        if (item[dimensionCode] && !isEmpty(item[dimensionCode])) {
          columnData.push({
            dimensionCode,
            dimensionFrom,
            dimensionValue: isArray(item[dimensionCode])
              ? item[dimensionCode]
              : [item[dimensionCode]],
          });
        }
      });
      tableData.push(columnData);
    });
    if (tableData.some((data) => isEmpty(data))) {
      notification.error({
        message: intl.get('ssrc.priceLibraryNew.message.blankData').d('存在空行数据，请检查。'),
      });
      return false;
    }
    const params = {
      tableData,
      viewCode,
      priceLibIds: checkValues,
    };
    const result = getResponse(await distributionPriceLib(params));
    if (result) {
      notification.success();
      if (isFunction(onRefresh)) {
        onRefresh();
      }
    } else {
      return false;
    }
    // this.releasePriceLibrary(distribueData);
  }

  // /**
  //  * 发布 - 支持跨页勾选发布
  //  */
  // @Bind()
  // releasePriceLibrary(distribueData) {
  //   const {
  //     match: { params },
  //   } = this.props;
  //   const { routerParams } = this.state;
  //   if (!isEmpty(distribueData)) {
  //     const validateData = distribueData.filter((n) => n.record);
  //     return Promise.all(validateData?.map((r) => r?.record?.validate(true, true))).then(
  //       async (results) => {
  //         if (results.every((result) => result)) {
  //           const dataSource = await this.getEditPerformanceTableData(
  //             distribueData,
  //             ['priceLibId', 'sourceFromId', 'sourceFromNum', 'sourceFromLnId', 'sourceFromLnNum'],
  //             {
  //               templateCode: params.templateCode,
  //               reqType: 'RELEASE',
  //               viewCode: routerParams.viewCode,
  //             }
  //           );
  //           if (!isEmpty(dataSource)) {
  //             this.releaseConfirmMethod(dataSource);
  //           }
  //         } else {
  //           notification.warning({
  //             message: intl
  //               .get('ssrc.priceLibraryNew.view.notification.validate.required')
  //               .d('存在必填项未填写，请重新维护!'),
  //           });
  //         }
  //       }
  //     );
  //   }
  // }

  // /**
  //  * 获取行内编辑表格中的值
  //  * @param {array} dataSource - 表格数据源
  //  * @param {array} filterList - 过滤新增操作中的属性字段，例如：['children', 'unitId']，默认过滤 record
  //  * @param {object} attributes - 用于每行记录新增字段，例如：{templateCode}
  //  * @param {string} treeChildrenAlias = 'children' - 指定树形结构行内编辑的子节点名称
  //  */
  // async getEditPerformanceTableData(
  //   dataSource = [],
  //   filterList = [],
  //   attributes = {},
  //   treeChildrenAlias = 'children'
  // ) {
  //   const paramsList = [];
  //   const fetchForm = (source, list) => {
  //     if (Array.isArray(source)) {
  //       for (let i = 0; i < source.length; i++) {
  //         if (source[i].record && source[i]._status) {
  //           const values = source[i].record.toJSONData();
  //           const { record, ...otherProps } = source[i];
  //           const { __id, _status, __dirty, ...otherValues } = values;
  //           if (Array.isArray(filterList) && filterList.length > 0) {
  //             for (const name of filterList) {
  //               // 如果record中存在需要过滤的值，且是新增操作，执行过滤，默认过滤record
  //               // eslint-disable-next-line
  //               if (source[i][name] && source[i]._status === 'create') {
  //                 delete otherProps[name];
  //                 // eslint-disable-next-line
  //                 delete values[name];
  //               }
  //             }
  //           }
  //           list.push(
  //             {
  //               ...otherProps,
  //               ...otherValues,
  //               ...attributes,
  //               sourceFrom: 'MANUL',
  //               approveMethod: 'SELF',
  //             } // 手工、自审批
  //           );
  //         } else {
  //           const { record, ...otherProps } = source[i];
  //           list.push({ ...attributes, ...otherProps });
  //         }
  //         if (source[i][treeChildrenAlias] && Array.isArray(source[i][treeChildrenAlias])) {
  //           fetchForm(source[i][treeChildrenAlias], list);
  //         }
  //       }
  //     }
  //   };
  //   fetchForm(dataSource, paramsList);
  //   return paramsList;
  // }

  render() {
    const { tableData, invOrganizationItemCheckFlag } = this.state;
    const columns = this.columns
      .filter((item) => item.dataIndex !== 'edit')
      .map((column) => ({ ...column, flexGrow: column.key !== 'priceLibId' && 1 }));
    return (
      <>
        {!!invOrganizationItemCheckFlag && (
          <Alert
            showIcon
            message={intl
              .get('ssrc.priceLibraryNew.view.message.associatedOrganization')
              .d('下发物料需与库存组织存在关联关系，否则会导致下发失败')}
            type="info"
            iconType="help"
            closable
            banner
            style={{ alignItems: 'center', marginBottom: '16px' }}
          />
        )}
        <div style={{ paddingBottom: '10px' }}>{this.getTableButtons()}</div>
        <PerformanceTable
          style={{ maxHeight: 600 }}
          columns={columns}
          virtualized
          cellBordered
          bordered={false}
          headerHeight={36}
          height={429}
          data={tableData}
          rowHeight={38}
        />
      </>
    );
  }
}

export default HOCComponent(PriceDistribution);
