/**
 * @文件描述 海量报表编辑页面
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/01/25
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { Fragment, useEffect } from 'react';
import { DataSet, Form, Select, TextArea, DatePicker, Button } from 'choerodon-ui/pro';
import { RouteComponentProps } from 'react-router-dom';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor, ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import { flow } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { detailDs } from './stores/detailDs';

interface MatchProps {
  params: string;
}

interface IProps extends RouteComponentProps<MatchProps> {
  ds: DataSet;
}

const ReportEdit: React.FC<IProps> = (props) => {
  const { ds, match } = props;
  const queryDetail = () => {
    const {
      params: { params = '' },
    } = match;
    const paramsSplit = params.split(';');
    const keys = ['prLineId', 'rfxLineItemId', 'poLineLocationId', 'pcSubjectId'];
    keys.forEach((key, index) => {
      ds.setQueryParameter(key, paramsSplit[index]);
    });
    ds.query();
  };
  useEffect(() => {
    queryDetail();
  }, []);
  return (
    <Fragment>
      <Header title={intl.get('hzero.common.button.edit').d('编辑')} />
      <Content style={{ height: 'calc(100% - 32px)' }}>
        <Form dataSet={ds} labelLayout={LabelLayout.float} style={{ height: '100%' }}>
          <Select name="agreeFlag" />
          <Select name="incompleteReason" />
          <TextArea name="remark" />
          <DatePicker name="expectedDeliveryDate" />
          <Button color={ButtonColor.primary} type={ButtonType.submit} style={{ maxWidth: '100%' }}>
            {intl.get('hzero.common.view.button.save').d('保存')}
          </Button>
        </Form>
      </Content>
    </Fragment>
  );
};

export default flow([
  formatterCollections({
    code: ['spfm.sdrp', 'hzero.common'],
  }),
  withProps(
    () => ({
      ds: new DataSet(detailDs()),
    }),
    { cacheState: true }
  ),
])(ReportEdit);
