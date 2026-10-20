import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { headerFormDS, subjectDS, stageDS, rebateDS, partnerDS, businessTermsDS } from '../DataSet';
import CollapseRender from './CollapseRender';
import styles from '../../index.less';

class DsRender extends React.Component {
  constructor(props) {
    super(props);
    const { pcHeaderId, editable, _linkFlag, changeCompareData, mainContractId } = props;
    const {
      newPcHeader,
      oldPcHeader,
      newPartneres,
      oldPartneres,
      newTerms,
      oldTerms,
    } = changeCompareData;
    this.newHeaderDs = new DataSet(headerFormDS({ pcHeaderId, editable, _linkFlag }));
    this.newHeaderDs.create(newPcHeader);
    this.oldHeaderDs = new DataSet(headerFormDS({ pcHeaderId, editable, _linkFlag }));
    this.oldHeaderDs.create(oldPcHeader);
    this.newPartnerDs = new DataSet(partnerDS({ pcHeaderId, editable, data: newPartneres }));
    this.oldPartnerDs = new DataSet(partnerDS({ pcHeaderId, editable, data: oldPartneres }));
    this.newBusinessTermsDs = new DataSet(
      businessTermsDS({
        pcHeaderId,
        editable,
        currentMode: 'current',
        data: newTerms,
        mainContractId,
      })
    );
    this.oldBusinessTermsDs = new DataSet(
      businessTermsDS({
        pcHeaderId,
        editable,
        currentMode: 'history',
        data: oldTerms,
        mainContractId,
      })
    );
  }

  componentDidMount() {
    const { pcHeaderId, editable, changeCompareData, mainContractId, rebateFlag } = this.props;
    const {
      newPcHeader,
      oldPcHeader,
      // newSubjects,
      // oldSubjects,
      // oldStages,
      // newStages,
      newRebates,
      oldRebates,
    } = changeCompareData;
    if (this.newHeaderDs) {
      // 获取分页
      const pcSubjectCustCode = editable
        ? 'SPCM.WORKSPACE_DETAIL.SUBJECT'
        : 'SPCM.WORKSPACE_DETAIL.SUBJECT.READONLY';
      const pcSubjectPageSize = this.getCustConfigPageSize(pcSubjectCustCode);
      this.newPcSubjectDs = new DataSet(
        subjectDS({
          pcHeaderId,
          editable,
          headerFormDs: this.newHeaderDs,
          newPcHeader,
          currentMode: 'current',
          mainContractId,
          pageSize: pcSubjectPageSize,
        })
      );
      this.oldPcSubjectDs = new DataSet(
        subjectDS({
          pcHeaderId,
          editable,
          headerFormDs: this.oldHeaderDs,
          oldPcHeader,
          currentMode: 'history',
          mainContractId,
          pageSize: pcSubjectPageSize,
        })
      );
      this.newPcSubjectDs.setQueryParameter('customizeUnitCode', pcSubjectCustCode);
      this.oldPcSubjectDs.setQueryParameter('customizeUnitCode', pcSubjectCustCode);
      this.newPcSubjectDs.query();
      this.oldPcSubjectDs.query();
      const pcStageCustCode = editable
        ? 'SPCM.WORKSPACE_DETAIL.STAGE'
        : 'SPCM.WORKSPACE_DETAIL.STAGE.READONLY';
      const pcStagePageSize = this.getCustConfigPageSize(pcStageCustCode);
      this.newStageDS = new DataSet(
        stageDS({
          pcHeaderId,
          editable,
          currentMode: 'current',
          mainContractId,
          pageSize: pcStagePageSize,
        })
      );
      this.oldStageDS = new DataSet(
        stageDS({
          pcHeaderId,
          editable,
          currentMode: 'history',
          mainContractId,
          pageSize: pcStagePageSize,
        })
      );
      this.newStageDS.setQueryParameter('customizeUnitCode', pcStageCustCode);
      this.oldStageDS.setQueryParameter('customizeUnitCode', pcStageCustCode);
      this.newStageDS.query();
      this.oldStageDS.query();
      if (rebateFlag) {
        this.newRebateDs = new DataSet(
          rebateDS({ pcHeaderId, editable, currentMode: 'current', mainContractId })
        );
        this.oldRebateDs = new DataSet(
          rebateDS({ pcHeaderId, editable, currentMode: 'history', mainContractId })
        );
        this.newRebateDs.loadData(newRebates);
        this.oldRebateDs.loadData(oldRebates);
      }
    }
  }

  /**
   * 查询个性化单元中配置默认页码
   */
  @Bind()
  getCustConfigPageSize(customizeUnitCode) {
    const { custConfig = {} } = this.props;
    const { pageSize = 10 } = custConfig[customizeUnitCode] || {};
    return pageSize || 10;
  }

  render() {
    const { changeCompareData = {} } = this.props;
    const { newPcHeader = {}, oldPcHeader = {}, changeCount } = changeCompareData;
    return (
      <Row gutter={8} className={styles.controllerDetailContainer}>
        <Col span={12}>
          <CollapseRender
            {...this.props}
            currentMode="current"
            headerFormDs={this.newHeaderDs}
            oldData={oldPcHeader}
            editable={false}
            headerInfo={newPcHeader}
            pcSubjectDs={this.newPcSubjectDs}
            partnerDs={this.newPartnerDs}
            pcStageDs={this.newStageDS}
            rebateDs={this.newRebateDs}
            businessTermsDs={this.newBusinessTermsDs}
            changeCount={changeCount}
          />
        </Col>
        <Col span={12}>
          <CollapseRender
            currentMode="history"
            {...this.props}
            headerFormDs={this.oldHeaderDs}
            editable={false}
            headerInfo={oldPcHeader}
            pcSubjectDs={this.oldPcSubjectDs}
            partnerDs={this.oldPartnerDs}
            pcStageDs={this.oldStageDS}
            rebateDs={this.oldRebateDs}
            businessTermsDs={this.oldBusinessTermsDs}
          />
        </Col>
      </Row>
    );
  }
}

export default DsRender;
