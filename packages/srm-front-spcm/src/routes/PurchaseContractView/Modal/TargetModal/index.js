import React, { Component } from 'react';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { renderThousandthNum } from '@/utils/util';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import stageRecordDS from './stageRecordDS';
import targetRecordDS from './targetRecordDS';

const commonPrompt = 'spcm.common.model.common';

export default class TargetModal extends Component {
  @Bind()
  getColumns() {
    const columns = [
      {
        title: intl.get(`${commonPrompt}.orderSeq`).d('序号'),
        name: 'lineNum',
        width: 80,
        render: (val) => Number(val),
      },
      {
        title: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
        name: 'displayLineNum',
        width: 120,
      },
      {
        name: 'itemCode',
        type: 'string',
        title: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        title: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
      },
      {
        name: 'categoryName',
        type: 'string',
        title: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
      },
      {
        name: 'quantity',
        type: 'string',
        title: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      },
      {
        title: intl.get(`${commonPrompt}.pcStatusCode`).d('状态'),
        name: 'statusCodeMeaning',
        width: 85,
      },
      {
        title: intl.get(`${commonPrompt}.acceptListNumber`).d('验收单据编号'),
        name: 'acceptListNum',
        type: 'string',
        width: 200,
      },
      {
        title: intl.get(`${commonPrompt}.acceptListTitle`).d('验收单据标题'),
        name: 'title',
        type: 'string',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.acceptedQuantity`).d('本次验收数量'),
        name: 'acceptedQuantity',
        width: 150,
        render: (val) => renderThousandthNum(val, 2),
      },
      {
        title: intl.get(`${commonPrompt}.accepterUserName`).d('验收人'),
        name: 'acceptorName',
      },
      {
        title: intl.get(`${commonPrompt}.acceptDate`).d('验收日期'),
        name: 'acceptDate',
        type: 'string',
        width: 150,
        render: dateRender,
      },
    ];
    return columns;
  }

  @Bind()
  getStageColumns() {
    const columns = [
      {
        title: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
        name: 'stageCode',
        width: 165,
      },
      {
        title: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
        name: 'stageName',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.milestoneTime`).d('里程碑时间'),
        name: 'milestoneTime',
        width: 175,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.currencyCode`).d('原币币种'),
        name: 'supplierCurrencyCode',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
        name: 'purchaseCurrencyCode',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
        name: 'exchangeRate',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.supplierCostQuantity`).d('原币费用'),
        name: 'costQuantity',
        width: 175,
        render: (val) => renderThousandthNum(val, 2),
      },
      {
        title: intl.get('spcm.common.model.purchaseCostQuantity').d('本币费用'),
        name: 'purchaseCostQuantity',
        width: 150,
        render: (val) => renderThousandthNum(val, 2),
      },
      {
        title: intl.get('spcm.common.model.common.termId').d('付款条款'),
        name: 'termName',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.common.typeId').d('付款方式'),
        name: 'typeName',
        width: 150,
      },
      {
        title: intl.get('hzero.common.explain').d('说明'),
        name: 'remark',
        width: 175,
      },
      {
        title: intl.get('spcm.common.model.common.acceptStatus').d('验收状态'),
        name: 'statusCodeMeaning',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.common.acceptListNum').d('验收单据'),
        name: 'acceptListNum',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.acceptedQuantity2`).d('验收费用'),
        name: 'acceptCostQuantity',
        width: 150,
        type: 'string',
      },
      {
        title: intl.get(`${commonPrompt}.acceptDate`).d('验收日期'),
        name: 'acceptDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.model.common.accepterUserName`).d('验收人'),
        name: 'acceptorName',
        width: 150,
        // render: (val) => val.join(','),
      },
    ];
    return columns;
  }

  @Bind()
  openModel() {
    const { record, detailFlag } = this.props;
    let columns = [];
    let title = '';
    if (record.acceptType === 'target') {
      this.recordDS = new DataSet(targetRecordDS());
      this.recordDS.setQueryParameter('pcHeaderId', record.pcHeaderId);
      this.recordDS.setQueryParameter('detailFlag', detailFlag);
      if (detailFlag) {
        this.recordDS.setQueryParameter('pcSubjectId', record.pcSubjectId);
      }
      columns = this.getColumns();
      title = intl.get(`spcm.common.model.common.acceptTypeTarget`).d('按标的验收');
    } else {
      this.recordDS = new DataSet(stageRecordDS());
      this.recordDS.setQueryParameter('pcHeaderId', record.pcHeaderId);
      columns = this.getStageColumns();
      title = intl.get(`spcm.common.model.common.acceptTypeStage`).d('按阶段验收');
    }
    this.recordDS.query();
    // 按阶段验收
    Modal.open({
      key: Modal.key(),
      title,
      style: {
        width: 800,
      },
      children: (
        <div>
          <Table
            // rowkey="approvalCode"
            // rowNumber
            dataSet={this.recordDS}
            columns={columns}
          />
        </div>
      ),
      onOk: () => null,
      onCancel: () => null,
      afterClose: () => null,
    });
  }

  render() {
    // isLink 本来button有一个link属性的 结果这组件
    const { children, isLink, record, ...restPorps } = this.props;
    return isLink ? (
      <a {...restPorps} onClick={this.openModel}>
        {children}
      </a>
    ) : (
      <Button {...restPorps} onClick={this.openModel}>
        {children}
      </Button>
    );
  }
}
