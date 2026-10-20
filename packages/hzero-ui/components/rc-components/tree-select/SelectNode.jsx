import React from 'react';
import { TreeNode } from '../tree';

/**
 * SelectNode wrapped the tree node.
 * Let's use SelectNode instead of TreeNode
 * since TreeNode is so confuse here.
 */
const SelectNode = (props) => (
  <TreeNode {...props} />
);

// Let Tree trade as TreeNode to reuse this for performance saving.
SelectNode.isTreeNode = 1;

export default SelectNode;
