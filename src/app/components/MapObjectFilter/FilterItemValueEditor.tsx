import {Divider, Slider} from '@material-ui/core';
import {
  AvailabilityAssessmentNode,
  FeatureComplexNode,
  FeatureNode,
} from 'app/model/FeatureMember';
import {SequenceField} from 'app/views/ObjectEditorContent';
import SosiMunicipalityField from 'app/views/SosiMunicipalityField';
import React, {useRef, useState} from 'react';
import {getSchema} from 'sosi/schema_impl';
import {XsdPrimitiveType, XsdSimpleType} from 'sosi/xsd';
import {GreenCheckbox} from '../CheckBox';

interface FilterItemValueEditorProps {
  node: FeatureNode;
  yesNoType: boolean;
  onChange: () => void;
}

enum CheckType {
  yes,
  no,
}

export default function FilterItemValueEditor (
  props: FilterItemValueEditorProps,
) {
  const node = props.node;

  const sliderRef = useRef<any>();

  const itemName = node.xsdElement?.displayName ?? node.name;

  const [, updateState] = React.useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  /// YES NO TYPES
  const handleOnCheckChanged = (val: boolean, checkType: CheckType) => {
    if (checkType == CheckType.yes) {
      if (val == true) node.value = 'Ja';
      else node.value = undefined;
    } else {
      if (val == true) node.value = 'Nei';
      else node.value = undefined;
    }
    props.onChange();
    forceUpdate();
  };

  /// SLIDER TYPES I.E nodes that contains plausibility validation fields

  const plausibility = node.plausibilityValidation!;

  const getSliderNodeValue = (): number[] => {
    if (plausibility == undefined) return [];

    let values;

    if (node.value != undefined && node.value.length) {
      const valueList = (node.value as string).split(',');
      if (node.validationType == XsdPrimitiveType.integer) {
        values = [Number.parseInt(valueList[0]), Number.parseInt(valueList[1])];
      } else if (node.validationType == XsdPrimitiveType.double) {
        values = [
          Number.parseFloat(valueList[0]),
          Number.parseFloat(valueList[1]),
        ];
      } else throw 'VALUE CAN NOT BE NUMBER';
    } else {
      values = [plausibility?.min, plausibility?.max ?? 0];
    }
    node.value = values[0].toString() + ',' + values[1].toString();

    node.filterMinMaxAllowance = {
      min: values[0],
      max: values[1],
    };

    return values;
  };

  const [customTimeout, setCustomTimeout] = useState<any>();

  const handleChange = (event, newValue) => {
    setSliderValues(newValue);

    node.filterMinMaxAllowance!.min! = newValue[0];
    node.filterMinMaxAllowance!.max! = newValue[1];
    node.value = newValue[0].toString() + ',' + newValue[1].toString();

    clearTimeout(customTimeout);

    let timeOut = setTimeout(() => {
      props.onChange();
    }, 1000);

    setCustomTimeout(timeOut);
  };

  const [sliderValues, setSliderValues] = useState<number[]>(() => {
    const values = getSliderNodeValue();
    props.onChange();
    return values;
  });

  if (props.yesNoType)
    return (
      <div style={{width: '100%', paddingTop: '10px'}}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
          }}>
          <div style={{width: '150px'}}>
            <text
              style={{
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: '14,26px',
                color: 'rgba(0, 0, 0, 0.87)',
              }}>
              {itemName}
            </text>
          </div>
          <GreenCheckbox
            checked={node.value?.toLowerCase() == 'ja' ? true : false}
            onChange={event =>
              handleOnCheckChanged(event.target.checked, CheckType.yes)
            }></GreenCheckbox>
          <div style={{width: '12px'}}></div>

          <GreenCheckbox
            checked={node.value?.toLowerCase() == 'nei' ? true : false}
            onChange={event =>
              handleOnCheckChanged(event.target.checked, CheckType.no)
            }></GreenCheckbox>
        </div>
        <div style={{height: '10px'}}></div>
        <Divider></Divider>
      </div>
    );

  if (plausibility) {
    return (
      <div style={{paddingTop: '20px'}}>
        <text
          style={{
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: '14,26px',
            color: 'rgba(0, 0, 0, 0.87)',
          }}>
          {itemName}
        </text>
        <div style={{height: '12px'}}></div>
        <Slider
          ref={sliderRef}
          style={{
            color: 'rgb(36, 148, 70)',
          }}
          onChange={(event, val) => handleChange(event, val)}
          // value={sliderValues}
          defaultValue={getSliderNodeValue()}
          min={plausibility.min}
          max={plausibility.max}></Slider>
        <text
          style={{
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '12.23px',
            fontFamily: 'Arial',
          }}>{`Vis fra ${sliderValues[0]?.toString()} ${plausibility.type
            } til ${sliderValues[1]?.toString()} til ${plausibility.type}`}</text>
      </div>
    );
  } else if (node.name.toLowerCase() == 'kommune') {
    return (
      <div style={{paddingTop: '20px'}}>
        <SosiMunicipalityField
          node={node}
          onFieldChange={() => props.onChange()}
          withoutMargin={true}></SosiMunicipalityField>
      </div>
    );
  }

  const simpleType = node.xsdElement?.type as XsdSimpleType;
  const unionMemberTypes = simpleType.unionMemberTypes;

  if (unionMemberTypes) {
    return (
      <div style={{paddingTop: '20px'}}>
        <SequenceField
          node={node}
          onFieldChange={() => props.onChange()}
          withDescription={false}></SequenceField>
      </div>
    );
  }

  return <div></div>;
}

export interface FilterAvailabilityAssessmentProps {
  availabilityNode: AvailabilityAssessmentNode;
  onChange: () => void;
}

enum AvailabilityType {
  wheelchair,
  electricWheelchair,
}

export function FilterAvailabilityAssessment (
  props: FilterAvailabilityAssessmentProps,
) {
  props.availabilityNode.filterNode!.isApplied = true;

  if (props.availabilityNode.filterNode?.electricWheelChair == undefined) {
    props.availabilityNode.filterNode!.electricWheelChair = new Map();
  }

  if (props.availabilityNode.filterNode?.wheelchair == undefined) {
    props.availabilityNode.filterNode!.wheelchair = new Map();
  }

  const elWheelchairMap = props.availabilityNode.filterNode
    ?.electricWheelChair!;

  const wheelchairMap = props.availabilityNode.filterNode?.wheelchair!;

  const sosiSchema = getSchema();

  const type = sosiSchema
    .getObjectTypeByName('Sittegruppe')
    ?.elements.find(e => e.name.toLowerCase() == 'tilgjengvurderingrulleman')
    ?.type as XsdSimpleType;

  const enumerations: string[] = [];

  enumerations.push('Ikke valgt');

  type.unionMemberTypes
    ?.find(e => e.restriction.enumeration !== undefined)
    ?.restriction.enumeration!.map(e => enumerations.push(e.value))!;

  if (!enumerations)
    throw 'FILTERITEMVALUE EDITOR ENUMERATIONS CAN NOT BE UNDEFINEd';

  if (elWheelchairMap.size < 4 || wheelchairMap.size < 4) {
    enumerations.map(enumeration => {
      elWheelchairMap.set(enumeration, true);
      wheelchairMap.set(enumeration, true);
    });
  }

  const [, updateState] = React.useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const handleOnCheckChanged = (
    val: boolean,
    availabilityType: AvailabilityType,
    nodeName: string,
  ) => {
    if (availabilityType == AvailabilityType.wheelchair) {
      wheelchairMap.set(nodeName, val);
    } else {
      elWheelchairMap.set(nodeName, val);
    }
    props.onChange();
    forceUpdate();
  };

  return (
    <div style={{padding: '20px 0px'}}>
      <text
        style={{
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fontSize: '14,26px',
          color: 'rgba(0, 0, 0, 0.87)',
        }}>
        Tilgjengelighetsvurdering
      </text>
      <div style={{height: '10px'}}></div>
      <div
        style={{
          width: '100%',
          color: 'rgba(0, 0, 0, 0.6)',
          fontSize: '12.23px',
          fontFamily: 'Arial',
        }}>
        <div
          style={{
            paddingLeft: '144px',
            paddingBottom: '10px',
          }}>
          <text>Rullestol</text>
          <text
            style={{
              paddingLeft: '14px',
            }}>
            El.rullestol
          </text>
        </div>
      </div>
      {enumerations.map(enumeration => (
        <div style={{width: '100%', paddingTop: '10px'}}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
            }}>
            <div style={{width: '150px'}}>
              <text
                style={{
                  fontFamily: 'Arial',
                  fontWeight: 'bold',
                  fontSize: '14,26px',
                  color: 'rgba(0, 0, 0, 0.87)',
                }}>
                {enumeration}
              </text>
            </div>
            <GreenCheckbox
              checked={wheelchairMap.get(enumeration) ?? false}
              onChange={event =>
                handleOnCheckChanged(
                  event.target.checked,
                  AvailabilityType.wheelchair,
                  enumeration,
                )
              }></GreenCheckbox>
            <div style={{width: '24px'}}></div>

            <GreenCheckbox
              checked={elWheelchairMap.get(enumeration) ?? false}
              onChange={event =>
                handleOnCheckChanged(
                  event.target.checked,
                  AvailabilityType.electricWheelchair,
                  enumeration,
                )
              }></GreenCheckbox>
          </div>
          <div style={{height: '10px'}}></div>
          <Divider></Divider>
        </div>
      ))}
    </div>
  );
}
