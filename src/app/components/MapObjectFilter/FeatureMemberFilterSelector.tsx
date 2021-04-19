import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { FeatureMember, FeatureNode } from 'app/model/FeatureMember';
import React from 'react';
import {
  FeatureMemberFilter,
  FilterItemProps,
} from './FeatureMemberFilterView';

interface FeatureMemberFilterSelectorProps {
  featureMemberFilter: FeatureMemberFilter;
  onSelect: (props: FilterItemProps) => void;
}

export default function FeatureMemberFilterSelector(
  props: FeatureMemberFilterSelectorProps,
) {
  const onChange = event => {
    const selectedNode = getNodes().find(
      e => e.name == event.target.value,
    );

    props.onSelect({
      type: selectedNode!.name,
      name: selectedNode?.xsdElement?.displayName!,
    });
    forceUpdate();
  };

  const [, updateState] = React.useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const getNodes = (): FeatureNode[] => {
    const nodes: FeatureNode[] = props.featureMemberFilter.featureMember!.nodes.filter(
      e => {
        const exists = props.featureMemberFilter.appliedNodeFilterItems.find(
          item => item.type.toLowerCase() == e.name.toLowerCase(),
        );
        if (exists) return false;
        else return true;
      },
    );

    const rampNode = props.featureMemberFilter.featureMember?.rampNode;

    const stairNode = props.featureMemberFilter.featureMember?.stairNode;

    if (rampNode) {
      for (const node of rampNode.nodes) {
        nodes.push(node);
      }
    }

    if (stairNode) {
      for (const node of stairNode.nodes) {
        nodes.push(node);
      }
    }

    return nodes;
  };

  return (
    <FormControl focused={false} variant="filled" fullWidth>
      <InputLabel
        style={{
          fontSize: '16,3px',
          color: '#000000',
          opacity: 0.6,
          fontFamily: 'Arial',
          fontWeight: 'bold',
        }}>
        Legg til filter
      </InputLabel>

      <Select onChange={event => onChange(event)} value="">
        {getNodes().map(node => {
          return (
            <MenuItem key={node.name} value={node.name}>
              {node.xsdElement?.displayName ?? node.name}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
