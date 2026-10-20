import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

@observer
class SchemaPage extends Component {
  render() {
    return (
      <>
        <Table
          rowNumber={false}
          queryBar="professionalBar"
          columnResizable
          columnHideable
          columnTitleEditable
          columnDraggable
          editMode="cell"
          customizable={false}
          border
          columns={[
            {
              hideable: true,
              titleEditable: true,
              name: 'schemaName',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              name: 'schemaDesc',
              type: 'string',
            },
          ]}
          dataSet={this.props.schemaDS}
        />
      </>
    );
  }
}

export default SchemaPage;
