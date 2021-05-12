import { Divider, IconButton, Paper } from '@material-ui/core';
import {
  AvailabilityAssessmentNode,
  FeatureComplexNode,
  FeatureMember,
  FeatureNode,
  getPlausibilityValidation,
} from 'app/model/FeatureMember';
import useWindowDimensions from 'app/utils/windowDimensions';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import ArrowLeftIcon from '@material-ui/icons/ChevronLeft';
import CancelIcon from '@material-ui/icons/Cancel';
import { getSchema } from 'sosi/schema_impl';
import { XsdPrimitiveType, XsdSimpleType } from 'sosi/xsd';
import FeatureMemberFilterSelector from './FeatureMemberFilterSelector';
import FilterItemValueEditor, {
  FilterAvailabilityAssessment,
} from './FilterItemValueEditor';

export type FeatureMemberFilter = {
  featureMember?: FeatureMember;
  appliedNodeFilterItems: FilterItemProps[];
};

interface FeatureMemberFilterViewProps {
  objectType: string;
  featureMemberFilter?: FeatureMemberFilter;
  onPop: () => void;
  onChanged: (featureMember: FeatureMember) => void;
}

export type FilterItemProps = {
  type: string;
  name: string;
};

export default function FeatureMemberFilterView(
  props: FeatureMemberFilterViewProps,
) {
  const { height, width } = useWindowDimensions();

  const containerRef = useRef<any>();

  const [scrollable, setScrollable] = useState<boolean>(false);

  const addFeatureNodesIfMissing = (
    featureMemberFilter: FeatureMemberFilter,
  ): FeatureMemberFilter => {
    const feature = featureMemberFilter.featureMember!;
    const appliedNodes: FilterItemProps[] = [];
    const sosiSchema = getSchema();

    const xsdElement = sosiSchema.getObjectTypeByName(feature.type!)!;

    for (let element of xsdElement.elements) {
      const featureNode = feature.nodes.find(
        e => e.name.toLowerCase() == element.name.toLowerCase(),
      );
      if (featureNode?.value != undefined) {
        appliedNodes.push({ type: element.name, name: element.displayName });
      } else if (featureNode == undefined && doCheck(element))
        feature.nodes.push(
          new FeatureNode(
            element.name,
            undefined,
            true,
            element.type as XsdPrimitiveType,
            element,
            getPlausibilityValidation(feature.type!, element.name),
          ),
        );
    }
    /// Add availability assesment node
    if (
      feature.nodes.find(e => e.name == 'Tilgjengelighetsvurdering') ==
      undefined
    ) {
      feature.nodes.push(
        new FeatureNode('Tilgjengelighetsvurdering', undefined, true),
      );
    }

    if (feature.availabilityNode?.filterNode?.isApplied == true) {
      appliedNodes.push({
        type: 'Tilgjengelighetsvurdering',
        name: 'Tilgjengelighetsvurdering',
      });
    }

    console.log(xsdElement);

    return {
      featureMember: feature,
      appliedNodeFilterItems: appliedNodes,
    };
  };

  const initNewFeatureMemberFilter = (): FeatureMemberFilter => {
    const member = new FeatureMember();

    const schema = getSchema();

    const objectType = schema.getObjectTypeByName(props.objectType)!;

    member.sosiElement = objectType;

    member.type = objectType.name;

    if (member.nodes.length < 1) {
      const elements = objectType.elements;

      for (let element of elements) {
        if (doCheck(element))
          member.nodes.push({
            value: undefined,
            validationType: element.type as XsdPrimitiveType,
            valid: true,
            name: element.name,
            xsdElement: element,
            plausibilityValidation: getPlausibilityValidation(
              member.type,
              element.name,
            ),
          });
      }

      if (objectType.hasRampFields) {
        const rampType = schema.getObjectTypeByName('rampe');

        const required =
          elements.find(element => element.name == 'rampe')?.minOccurs! > 0;

        const children = rampType?.elements.map(
          element =>
            new FeatureNode(
              element.name,
              undefined,
              true,
              element.type as XsdPrimitiveType,
              element,
              getPlausibilityValidation(member.type!, element.name),
            ),
        );

        member.rampNode = new FeatureComplexNode('Rampe', children!, required);
      }

      if (objectType.hasStairFields) {
        const stairType = schema.getObjectTypeByName('trapp');

        const required =
          elements.find(element => element.name == 'trapp')?.minOccurs! > 0;

        const children = stairType?.elements.map(
          element =>
            new FeatureNode(
              element.name,
              undefined,
              true,
              element.type as XsdPrimitiveType,
              element,
              getPlausibilityValidation(member.type!, element.name),
            ),
        );

        member.stairNode = new FeatureComplexNode('Trapp', children!, required);
      }

      /// Handle availability

      const subNodes = elements
        .filter(e => e.name.includes('tilgjengvurdering'))
        .map(
          element =>
            new FeatureNode(
              element.name,
              undefined,
              true,
              element.type as XsdPrimitiveType,
              element,
            ),
        );

      member.availabilityNode = new AvailabilityAssessmentNode(
        new FeatureComplexNode('Tilgjengelighetsvurdering', subNodes, true),
        {
          wheelchair: new Map(),
          electricWheelChair: new Map(),
          isApplied: false,
        },
      );

      /// Add availability assesment node
      if (
        member.nodes.find(e => e.name == 'Tilgjengelighetsvurdering') ==
        undefined
      ) {
        member.nodes.push(
          new FeatureNode('Tilgjengelighetsvurdering', undefined, true),
        );
      }
    }

    return {
      featureMember: member,
      appliedNodeFilterItems: [],
    };
  };

  const [featureMemberFilter, setFeatureMemberFilter] = useState<
    FeatureMemberFilter
  >(() => {
    if (props.featureMemberFilter != undefined)
      return addFeatureNodesIfMissing(props.featureMemberFilter);
    else return initNewFeatureMemberFilter();
  });

  useEffect(() => {
    const containerHeight = containerRef?.current?.clientHeight;

    if (!containerHeight) setScrollable(true);
    else {
      if (containerHeight > height - 48) setScrollable(true);
      else setScrollable(false);
    }
  });

  const onSelectFilterItem = (filterItemProps: FilterItemProps) => {
    const exist = featureMemberFilter.appliedNodeFilterItems.find(
      e => e.type == filterItemProps.type,
    );

    if (exist == undefined) {
      featureMemberFilter.appliedNodeFilterItems.push(filterItemProps);
      setFeatureMemberFilter({
        ...featureMemberFilter,
        appliedNodeFilterItems: featureMemberFilter.appliedNodeFilterItems,
      });
    }

    if (filterItemProps.type == 'Tilgjengelighetsvurdering') {
      featureMemberFilter!.featureMember!.availabilityNode!.filterNode!.isApplied! = true;
      onValueChanged();
    }
  };

  const removeFilterItem = (item: FilterItemProps) => {
    let nodes = featureMemberFilter.featureMember!.nodes;

    if (featureMemberFilter.featureMember!.rampNode) {
      nodes = nodes.concat(featureMemberFilter.featureMember!.rampNode.nodes);
    }
    if (featureMemberFilter.featureMember!.stairNode) {
      nodes = nodes.concat(featureMemberFilter.featureMember!.stairNode.nodes);
    }

    const node = nodes.find(
      element => element.name.toLowerCase() == item.type.toLowerCase(),
    );

    if (node?.name == 'Tilgjengelighetsvurdering') {
      featureMemberFilter.featureMember!.availabilityNode!.filterNode!.isApplied = false;
    }

    if (node) node.value = undefined;

    onValueChanged();

    setFeatureMemberFilter({
      ...featureMemberFilter,
      appliedNodeFilterItems: featureMemberFilter.appliedNodeFilterItems.filter(
        e => e.type.toLowerCase() != item.type.toLowerCase(),
      ),
    });
  };

  const onValueChanged = () => {
    props.onChanged(featureMemberFilter.featureMember!);
  };

  const getFilterItemValueEditors = (yesNoType: boolean): any => {
    let featureNodes: FeatureNode[] = [];

    if (yesNoType) {
      for (const item of featureMemberFilter.appliedNodeFilterItems) {
        let node =
          featureMemberFilter?.featureMember?.nodes.find(
            e =>
              e.name == item.type &&
              (e.validationType as any)?.name?.toLowerCase() == 'janeitype' &&
              e.name != 'Tilgjengelighetsvurdering',
          ) ??
          featureMemberFilter?.featureMember?.rampNode?.nodes.find(
            e =>
              e.name == item.type &&
              (e.validationType as any)?.name?.toLowerCase() == 'janeitype' &&
              e.name != 'Tilgjengelighetsvurdering',
          ) ??
          featureMemberFilter?.featureMember?.stairNode?.nodes.find(
            e =>
              e.name == item.type &&
              (e.validationType as any)?.name?.toLowerCase() == 'janeitype' &&
              e.name != 'Tilgjengelighetsvurdering',
          );

        if (node) featureNodes.push(node);
      }
    } else {
      for (const item of featureMemberFilter.appliedNodeFilterItems) {
        let node =
          featureMemberFilter?.featureMember?.nodes.find(
            e =>
              e.name.toLowerCase() == item.type.toLowerCase() &&
              (e.validationType as any)?.name?.toLowerCase() != 'janeitype' &&
              e.name != 'Tilgjengelighetsvurdering',
          ) ??
          featureMemberFilter?.featureMember?.rampNode?.nodes.find(
            e =>
              e.name == item.type &&
              (e.validationType as any)?.name?.toLowerCase() != 'janeitype' &&
              e.name != 'Tilgjengelighetsvurdering',
          ) ??
          featureMemberFilter?.featureMember?.stairNode?.nodes.find(
            e =>
              e.name == item.type &&
              (e.validationType as any)?.name?.toLowerCase() != 'janeitype' &&
              e.name != 'Tilgjengelighetsvurdering',
          );

        if (node) featureNodes.push(node);
      }
    }

    const editors = featureNodes.map(node => (
      <FilterItemValueEditor
        node={node}
        yesNoType={yesNoType}
        onChange={() => onValueChanged()}></FilterItemValueEditor>
    ));

    return editors;
  };

  return (
    <Paper
      ref={containerRef}
      elevation={10}
      style={{
        width: scrollable ? '342px' : '332px',
        overflowY: scrollable ? 'scroll' : 'auto',
        maxHeight: height,
        margin: 0,
        backgroundColor: 'white',
      }}>
      <div
        style={{
          padding: '26px',
          width: '100%',
          paddingTop: '0px',
        }}>
        <div style={{ display: 'inline-flex', width: '100%' }}>
          <p
            style={{
              fontSize: '16px',
              color: '#000000',
              fontFamily: 'Arial',
              fontWeight: 'bold',
              flex: '1',
              paddingTop: '24px',
            }}>
            {props.objectType}
          </p>
          <IconButton
            style={{ color: 'black' }}
            size="small"
            onClick={() => props.onPop()}>
            <ArrowLeftIcon></ArrowLeftIcon>
          </IconButton>
        </div>
        <Divider></Divider>
        <div style={{ height: '20px' }}></div>
        <div
          style={{
            display: 'table',
            overflow: 'clip',
            height: 'auto',
          }}>
          {featureMemberFilter.appliedNodeFilterItems.map(item => (
            <div
              style={{
                display: 'inline-flex',
                marginRight: '8px',
                marginBottom: '10px',
                width: 'auto',
                padding: '6px 8px',
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderRadius: '8px',
              }}>
              <a
                style={{
                  color: 'rgba(0, 0, 0, 0.87)',
                  fontFamily: 'Arial',
                  fontSize: '14.26',
                }}>
                {item.name ?? item.type}
              </a>
              <div style={{ width: '6px' }}></div>
              <CancelIcon
                onClick={() => removeFilterItem(item)}
                style={{
                  padding: '0px',
                  color: 'rgba(0, 0, 0, 0.38)',
                  width: '18px',
                }}></CancelIcon>
            </div>
          ))}
        </div>

        <div style={{ height: '20px' }}></div>
        <FeatureMemberFilterSelector
          onSelect={props => onSelectFilterItem(props)}
          featureMemberFilter={
            featureMemberFilter
          }></FeatureMemberFilterSelector>
        {/* YES/NO TYPES: */}
        {getFilterItemValueEditors(true)?.length > 0 ? (
          <div style={{ padding: '20px 0px' }}>
            <div
              style={{
                width: '100%',
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '12.23px',
                fontFamily: 'Arial',
              }}>
              <div
                style={{
                  paddingLeft: '164px',
                  paddingBottom: '10px',
                }}>
                <text>Ja</text>
                {/* <div style={{width: "54px"}}></div> */}
                <text
                  style={{
                    float: 'right',
                    paddingRight: '46px',
                  }}>
                  Nei
                </text>
              </div>
            </div>
            {getFilterItemValueEditors(true)}
          </div>
        ) : null}
        {getFilterItemValueEditors(false)}
        {featureMemberFilter.appliedNodeFilterItems.find(
          e => e.type == 'Tilgjengelighetsvurdering',
        ) != undefined ? (
          <FilterAvailabilityAssessment
            availabilityNode={
              featureMemberFilter.featureMember?.availabilityNode!
            }
            onChange={() => onValueChanged()}></FilterAvailabilityAssessment>
        ) : null}
      </div>
    </Paper>
  );
}

const doCheck = (element: any): boolean => {
  if (
    (element.type as XsdPrimitiveType) != XsdPrimitiveType.string &&
    !element.name?.toLowerCase().includes('bildefil') &&
    !element.name?.toLowerCase().includes('identifikasjon') &&
    !element.name?.toLowerCase().includes('tilgjengvurdering') &&
    !element.name?.toLowerCase().includes('rampe') &&
    !element.name?.toLowerCase().includes('objektnr') &&
    !element.name?.toLowerCase().includes('opphav') &&
    !element.name?.toLowerCase().includes('kommentar') &&
    !element.name?.toLowerCase().includes('geometri') &&
    !element.name?.toLowerCase().includes('forbedringsforslag') &&
    !element.name?.toLowerCase().includes('kommreel') &&
    !element.name?.toLowerCase().includes('trapp') &&
    !element.name?.toLowerCase().includes('datafangstdato')
  )
    return true;

  return false;
};
