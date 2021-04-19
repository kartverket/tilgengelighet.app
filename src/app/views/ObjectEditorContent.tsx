import React, { memo, useState, useContext } from 'react';
import { getSchema } from '../../sosi/schema_impl';
import {
  XsdComplexType,
  XsdComplexTypeElement,
  XsdPrimitiveType,
  XsdSimpleType,
} from '../../sosi/xsd';
import {
  Collapse,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  IconButton,
} from '@material-ui/core';
import SosiImageField from './SosiImageField';
import SosiMunicipalityField from './SosiMunicipalityField';
import { keyBy } from 'lodash';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { SosiObjectType } from '../../sosi/schema';
import { FormGroup } from '../../sosi/form_config';
import ArrowDownIcon from '@material-ui/icons/ExpandMore';
import ArrowUpIcon from '@material-ui/icons/ExpandLess';
import CancelError from '@material-ui/icons/Cancel';
import ShowMoreText from 'react-show-more-text';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import {
  FeatureMember,
  FeatureNode,
  FeatureComplexNode,
  getPlausibilityValidation,
  getDependencyForFeatureNode,
  getRequiredForFeatureNode,
} from 'app/model/FeatureMember';
import {
  FieldVerificationResponse,
  verifyFieldInput,
} from 'app/containers/ObjectEditor/ObjectFieldValidation';
import { ValidationContext } from 'app/containers/ObjectEditor';
import { orderFeatureMemberElements } from 'app/model/FeatureMemberFlowOrder';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  sidebarLeft: {
    flex: '1',
    maxWidth: '500px',
  },
  sidebar: {
    flex: '1',
    maxWidth: '250px',
  },
  center: {
    flex: '3',
    maxWidth: '684px',
  },
  paper: {
    padding: '0px 16px',
  },
  headerName: {
    flex: 1,
    fontWeight: 'bold',
    letterSpacing: 0.15,
    fontSize: '16.3px',
    color: 'rgba(0, 0, 0, 0.87)',
  },
});

export type FormStep = {
  id: string;
  section: React.ReactNode;
  stepLabel: React.ReactNode;
};

export function createFormSteps(
  objectType: SosiObjectType,
  featureMember: FeatureMember,
  onFieldChange: () => void,
): FormStep[] {
  const steps: FormStep[] = [];

  if (objectType.hasMunicipalityFields) {
    steps.push({
      id: 'municipality',
      section: (
        <SosiMunicipalityField
          node={
            (featureMember.getNodeInstance('kommReel') ??
              featureMember.getNodeInstance('kommune'))!
          }
          onFieldChange={() => onFieldChange()}
        />
      ),
      stepLabel: 'Kommune',
    });
  }

  let rampStep;

  if (objectType.hasRampFields) {
    const rampType = getSchema().getObjectTypeByName('rampe');

    const nodes: FeatureNode[] = featureMember.rampNode?.nodes ?? [];

    for (const element of rampType?.elements!) {
      const correspondingNode = nodes.find(
        e => e.name?.toLowerCase() == element.name?.toLowerCase(),
      );

      if (correspondingNode == undefined) {
        const node = new FeatureNode(
          element.name,
          undefined,
          true,
          element.type as XsdPrimitiveType,
          element,
          getPlausibilityValidation(featureMember.type!, element.name),
          getDependencyForFeatureNode('rampe', element.name),
          getRequiredForFeatureNode('rampe', element.name),
        );
        nodes.push(node);
      } else {
        correspondingNode.plausibilityValidation = getPlausibilityValidation(
          featureMember.type!,
          element.name,
        );
        correspondingNode!.dependency = getDependencyForFeatureNode(
          'rampe',
          element.name,
        );
        correspondingNode.required = getRequiredForFeatureNode(
          'rampe',
          element.name,
        );
      }
    }

    if (featureMember.rampNode == undefined) {
      nodes![0].value = 'Nei';

      featureMember.rampNode = new FeatureComplexNode('rampe', nodes, true);
    }

    rampStep = {
      id: 'Rampe',
      section: (
        <SwitchableField
          description="Finnes det rampe?"
          nodes={featureMember.rampNode?.nodes}
          mainNode={featureMember.rampNode?.nodes[0]!}
          onFieldChange={() => onFieldChange()}
        />
      ),
      stepLabel: 'Rampe',
    };
  }

  let stairStep;

  if (objectType.hasStairFields) {
    const stairType = getSchema().getObjectTypeByName('trapp');

    const nodes: FeatureNode[] = featureMember.stairNode?.nodes ?? [];

    for (const element of stairType?.elements!) {
      const correspondingNode = nodes.find(
        e => e.name?.toLowerCase() == element.name?.toLowerCase(),
      );

      if (correspondingNode == undefined) {
        const node = new FeatureNode(
          element.name,
          undefined,
          true,
          element.type as XsdPrimitiveType,
          element,
          getPlausibilityValidation('rampe', element.name),
          getDependencyForFeatureNode('trapp', element.name),
          getRequiredForFeatureNode('trapp', element.name),
        );
        nodes.push(node);
      } else {
        correspondingNode.plausibilityValidation = getPlausibilityValidation(
          featureMember.type!,
          element.name,
        );
        correspondingNode!.dependency = getDependencyForFeatureNode(
          'trapp',
          element.name,
        );
        correspondingNode.required = getRequiredForFeatureNode(
          'trapp',
          element.name,
        );
      }
    }

    if (featureMember.stairNode == undefined) {
      nodes![0].value = 'Nei';

      featureMember.stairNode = new FeatureComplexNode('trapp', nodes, true);
    }

    if (featureMember.type == 'FriluftToalett') {
      nodes.find(n => n.name == 'rekkverkHøydeNedre')!.required = true;
    }

    stairStep = {
      id: 'Trapp',
      section: (
        <SwitchableField
          description="Er det trapp?"
          nodes={featureMember.stairNode?.nodes!}
          mainNode={featureMember.stairNode?.nodes[0]!}
          onFieldChange={() => onFieldChange()}
        />
      ),
      stepLabel: 'Trapp',
    };
  }

  const formGroupSteps: any[] = [];

  const configuration = objectType.formConfiguration;

  const elements = keyBy(objectType.elements, 'name');

  const handledAsformGroupNames: string[] = [];

  const formGroups = configuration.formGroups.map(formGroup => {
    return {
      name: formGroup.fields[0],
      fields: formGroup.fields
        .map(field => field)
        .filter(val => {
          if (val != 'tryggOvergang') return true;
          else return false;
        }),
    };
  });

  let imageRequired = false;

  if (
    featureMember.nodes.find(n => n.name?.toLowerCase() == 'byggingpågår')
      ?.value == 'Ja'
  ) {
    imageRequired = true;

    for (const node of featureMember.nodes) {
      if (
        node.name?.toLowerCase() != 'tilgjengvurderingrulleman' &&
        node.name?.toLowerCase() != 'tilgjengvurderingrulleauto' &&
        node.name?.toLowerCase() != 'gatetype' &&
        node.name?.toLowerCase() != 'tilgjengvurderingsyn' &&
        node.name?.toLowerCase() != 'byggningsfunksjon'
      ) {
        node.required = false;
        node.valid = true;
      }
    }
  }

  if (objectType.hasImageFields) {
    steps.splice(1, 0, {
      id: 'images',
      section: (
        <SosiImageField
          imageList={featureMember.images}
          required={imageRequired}
        />
      ),
      stepLabel: 'Last opp bilder',
    });
  }

  /// Create custom formgroups that has not been detected in XSD config

  for (const node of featureMember.nodes) {
    if (
      node.dependency != undefined &&
      node.dependency.dependsOnValue.toLowerCase() == 'ja'
    ) {
      const formGroup = formGroups.find(
        group =>
          group.name.toLowerCase() ==
          node.dependency?.dependsOnNodeName.toLowerCase(),
      );
      if (formGroup == undefined) {
        const newFormGroup = {
          name: node.dependency.dependsOnNodeName!,
          fields: [node.dependency.dependsOnNodeName!, node.name],
        };

        formGroups.push(newFormGroup);
      } else if (formGroup.fields.includes(node.name) == false) {
        formGroup.fields.push(node.name);
      }
    }
  }

  for (let formGroup of formGroups) {
    const nodes: FeatureNode[] = [];

    for (let field of formGroup.fields) {
      handledAsformGroupNames.push(field.toLowerCase());
      const node = featureMember.nodes.find(
        n => n.name.toLowerCase() == field.toLowerCase(),
      )!;
      if (node.dependency == undefined && node.value == undefined) {
        node.value = 'Nei';
      }
      nodes.push(node);
    }

    formGroupSteps.push({
      id: formGroup.name,
      section: (
        <SwitchableField
          description={
            nodes[0].name[0].toUpperCase() + nodes[0].name.substring(1)
          }
          nodes={nodes.slice(0)}
          mainNode={nodes[0]!}
          onFieldChange={() => onFieldChange()}
        />
      ),
      stepLabel: formGroup.name,
    });
  }

  const remainingElements: XsdComplexTypeElement[] = Object.values(elements);

  const accessibilityElements: XsdComplexTypeElement[] = [];

  for (let element of remainingElements) {
    const name = element.name;
    /// The nodes elements already proccessed as a formGroup
    if (handledAsformGroupNames.includes(name.toLowerCase())) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (
      name == 'objektNr' &&
      featureMember.nodes.find(n => n.name == 'objektNr')?.value == undefined
    ) {
      delete remainingElements[remainingElements.indexOf(element)];
    }
    if (name.startsWith('bilde')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.startsWith('identifikasjon')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.startsWith('opphav')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.startsWith('geometri')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.startsWith('kommReel')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.startsWith('kommune')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.startsWith('rampe')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.startsWith('grense')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.startsWith('trapp')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.startsWith('posisjon')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }
    if (name.startsWith('segmentLengde')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }

    if (name.toLowerCase().includes('datafangst')) {
      delete remainingElements[remainingElements.indexOf(element)];
    }
    if (name.toLowerCase().includes('tilgjengvurderingrulleman')) {
      accessibilityElements.push(element);
      delete remainingElements[remainingElements.indexOf(element)];
    }
    if (name.toLowerCase().includes('tilgjengvurderingrulleauto')) {
      accessibilityElements.push(element);
      delete remainingElements[remainingElements.indexOf(element)];
    }
    if (name.toLowerCase().includes('tilgjengvurderingelrull')) {
      accessibilityElements.push(element);
      delete remainingElements[remainingElements.indexOf(element)];
    }
    if (name.toLowerCase().includes('tilgjengvurderingsyn')) {
      accessibilityElements.push(element);
      delete remainingElements[remainingElements.indexOf(element)];
    }
  }

  const filteredRemainingElements = remainingElements.filter(
    e => e != undefined,
  );

  const orderAndElements = orderFeatureMemberElements(
    filteredRemainingElements,
    featureMember.type ?? objectType.name,
  );

  const getFieldsWithoutFormGroup = (
    elements: XsdComplexTypeElement[],
    index: number,
  ) => {
    return {
      id: 'other' + index.toString(),
      section: (
        <FormGroupStep
          formGroup={{
            name: 'Øvrige',
            fields: elements.map(e => e.name),
          }}
          featureMember={featureMember}
          elements={elements}
          objectType={objectType}
          onFieldChange={() => onFieldChange()}
          withoutPaper={true}
        />
      ),
      stepLabel: 'Øvrige',
    };
  };

  let otherElements: XsdComplexTypeElement[] = [];

  for (var i = 0; i < orderAndElements.order.length; i++) {
    const orderItemName = orderAndElements.order[i];

    const correspondingElement = orderAndElements.elements.find(
      e => e.name == orderItemName,
    );

    if (correspondingElement != undefined) {
      otherElements.push(correspondingElement);
      if (i == orderAndElements.order.length - 1) {
        steps.push(getFieldsWithoutFormGroup(otherElements, i));
        break;
      }
      continue;
    } else {
      if (otherElements.length > 0) {
        steps.push(getFieldsWithoutFormGroup(otherElements, i));
        otherElements = [];
      }

      if (orderItemName == 'rampe') {
        steps.push(rampStep);
      } else if (orderItemName == 'trapp') {
        steps.push(stairStep);
      } else if (formGroupSteps.length > 0) {
        for (const formGroup of formGroupSteps) {
          if (formGroup.id == orderItemName) {
            steps.push(formGroup);
          }
        }
      }
    }
  }

  if (accessibilityElements.length > 0) {
    /// Assert manual accessibility assesment is the first item
    const indexOfManualAccessibility = accessibilityElements.indexOf(
      accessibilityElements.find(
        e => e.name?.toLowerCase() == 'tilgjengvurderingrulleman',
      )!,
    );

    if (indexOfManualAccessibility != 0) {
      accessibilityElements.splice(
        0,
        0,
        accessibilityElements.splice(indexOfManualAccessibility, 1)[0],
      );
    }

    const autoWheelChair = accessibilityElements.find(
      e => e.name?.toLowerCase() == 'tilgjengvurderingrulleauto',
    );

    if (autoWheelChair && accessibilityElements.indexOf(autoWheelChair) != 1) {
      accessibilityElements.splice(
        1,
        0,
        accessibilityElements.splice(
          accessibilityElements.indexOf(autoWheelChair),
          1,
        )[0],
      );
    }

    const autoElWheelChair = accessibilityElements.find(
      e =>
        e.name?.toLowerCase() == 'tilgjengvurderingelrullestol' ||
        e.name?.toLowerCase() == 'tilgjengvurderingelrull',
    );

    if (
      autoElWheelChair &&
      accessibilityElements.indexOf(autoElWheelChair) != 1
    ) {
      accessibilityElements.splice(
        2,
        0,
        accessibilityElements.splice(
          accessibilityElements.indexOf(autoElWheelChair),
          1,
        )[0],
      );
    }

    steps.push({
      id: 'accessibility',
      section: (
        <FormGroupStep
          formGroup={{
            name: 'Tilgjengelighetsvurdering',
            fields: accessibilityElements.map(e => e.name),
          }}
          featureMember={featureMember}
          elements={accessibilityElements}
          objectType={objectType}
          onFieldChange={() => onFieldChange()}
        />
      ),
      stepLabel: 'Tilgjengelighetsvurdering',
    });
  }

  return steps;
}

const formGroupStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    height: '64px',
  },
  headerName: {
    flex: 1,
    fontWeight: 'bold',
    letterSpacing: 0.15,
    fontSize: '16.3px',
    color: 'rgba(0, 0, 0, 0.87)',
  },
});

const FormGroupStep = memo<{
  formGroup: FormGroup;
  objectType: SosiObjectType;
  elements: ReadonlyArray<XsdComplexTypeElement>;
  featureMember: FeatureMember;
  onFieldChange: () => void;
  withoutPaper?: boolean;
}>(
  ({
    formGroup,
    objectType,
    elements,
    featureMember,
    onFieldChange,
    withoutPaper = false,
  }): any => {
    const classes = formGroupStyles();
    const expandedElement = objectType.getElement(formGroup.toggle!);

    const [expanded, setExpand] = useState<boolean>(true);

    const [error, setError] = useState<boolean>(false);

    let content: React.ReactNode = elements
      .filter(e => e !== expandedElement)
      .map(e => {
        let style = {};
        const lastElement = elements[elements.length - 1] == e;
        if (lastElement) {
          style = {
            marginBottom: '0px',
          };
        }

        let node = featureMember.nodes.find(
          element => element.name?.toLowerCase() === e.name?.toLowerCase(),
        );

        if (!node) {
          let dependency = getDependencyForFeatureNode(
            featureMember.type!,
            e.name,
          );

          if (dependency != undefined) {
            dependency.dependsOnNode = featureMember.nodes.find(
              node =>
                node.name?.toLowerCase() ==
                dependency?.dependsOnNodeName.toLowerCase(),
            );
          }

          node = new FeatureNode(
            e.name,
            undefined,
            true,
            e.type as XsdPrimitiveType,
            e,
            getPlausibilityValidation(featureMember.type!, e.name),
            dependency,
          );
        }

        if (node.dependency != undefined) {
          // if (node.dependency.dependsOnNodeName == 'ledelinje') {
          //   if (
          //     node.dependency.dependsOnNode?.value == undefined ||
          //     node.dependency.dependsOnNode?.value?.toLowerCase() == 'ingen'
          //   )
          //     return <div></div>;
          // } else
          if (node.dependency.dependsOnValue.includes(',')) {
            const values = node.dependency.dependsOnValue.split(',');

            if (
              values.includes(node.dependency.dependsOnNode!.value) == false
            ) {
              return <div></div>;
            }
          }
          /// This is where the dependency value comparison takes place.
          else if (
            node.dependency.dependsOnNode!.value?.toLowerCase() !=
            node.dependency.dependsOnValue.toLowerCase()
          ) {
            return <div></div>;
          }
        }

        return (
          <div style={style}>
            <SequenceField
              key={e.name}
              node={node}
              onFieldChange={() => {
                onFieldChange();
                if (error == true && withoutPaper != true) setError(false);
              }}
              onError={error => {
                if (withoutPaper != true) setError(error);
              }}
            />
          </div>
        );
      });

    if (withoutPaper == true) {
      return <div style={{ padding: '0px 16px' }}>{content}</div>;
    }

    if (expanded !== null) {
      content = <Collapse in={expanded}>{content}</Collapse>;
    }

    return (
      <Paper elevation={3} style={{ padding: '0 16px' }}>
        <div className={classes.header}>
          {error == true ? (
            <CancelError
              style={{
                marginRight: '12px',
                color: 'rgb(176, 0, 32)',
              }}></CancelError>
          ) : null}
          <Typography variant={'h6'} className={classes.headerName}>
            {formGroup.name}
          </Typography>

          <IconButton onClick={() => setExpand(!expanded)}>
            {expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </div>
        {content}
      </Paper>
    );
  },
);

const styles = makeStyles(() =>
  createStyles({
    label: {
      '&$focusedLabel': {
        color: 'rgb(26, 88, 159)',
      },
      '&$erroredLabel': {
        color: 'orange',
      },
    },
    focusedLabel: {},
    erroredLabel: {},
    underline: {
      '&$error:after': {
        borderBottomColor: 'orange',
      },
      '&:after': {
        borderBottomColor: `rgb(26, 88, 159)`,
      },
    },
    error: {},
    input: {
      padding: '25px 12px 4px',
      fontSize: '14.5px',
    },
  }),
);

export const SequenceField = memo<{
  node: FeatureNode;
  onFieldChange: () => void;
  withDescription?: boolean;
  onError?: (error: boolean) => void;
}>(({ node, onFieldChange, withDescription = true, onError }) => {
  const classes = styles();

  const element = node.xsdElement!;

  const { validation } = useContext(ValidationContext);

  const required =
    ((node.xsdElement?.minOccurs ?? 0) > 0 || node.required) ?? false;

  React.useEffect(() => {
    if (error == true && onError) onError(true);
    if (element.name.toLowerCase() != 'tilgjengvurderingrulleauto')
      if (validation == true) {
        let fieldVerificationResp: FieldVerificationResponse = {
          valid: false,
          errorMsg: undefined,
        };

        if (nodeState.value != undefined)
          fieldVerificationResp = verifyFieldInput(
            nodeState,
            nodeState.value,
            true,
          );

        if (
          (required ||
            (node.plausibilityValidation != undefined && nodeState.value)) &&
          (!nodeState.value || fieldVerificationResp.valid == false)
        ) {
          setError(true);
          setErrorMsg(fieldVerificationResp.errorMsg);
        }
      }
  });

  React.useEffect(() => {
    if (node.required == false && error == true) {
      setError(false);
    }
  }, [node.required]);

  const type = element.type;

  let name = element.displayName;

  if (name == 'Tilgjengvurdering Rulle Man') {
    name = 'MIN tilgjengelighetsvurdering rullestol';
  } else if (name.toLowerCase() == 'tilgjengvurdering rulle auto') {
    name = 'AUTO tilgjengvurdering rullestol';
  } else if (
    name.toLowerCase().includes('elrull') ||
    name.toLowerCase() == 'tilgjengvurdering el rullestol' ||
    name.toLowerCase() == 'tilgjengvurdering el rull'
  ) {
    name = 'AUTO tilgjengvurdering el rullestol';
  }

  const documentation = element.annotation?.documentation ?? '';

  const simpleType = type as XsdSimpleType;
  const unionMemberTypes = simpleType.unionMemberTypes;

  const [nodeState, setNodeState] = useState<FeatureNode>(() => {
    if (element.name.toLowerCase() != 'tilgjengvurderingrulleauto') {
      node.valid = true;
    }
    if (node.value) {
      /// Refactor doubles with more than 1 decimal
      if (type === XsdPrimitiveType.double) {
        if (node.value.substring(node.value.indexOf('.')).length > 2) {
          node.value = node.value.substring(0, node.value.indexOf('.') + 2);
        }
      }

      if (required && !verifyFieldInput(node, node.value, false).valid)
        node.valid = false;

      return node;
    } else {
      if (
        required &&
        element.name.toLowerCase() != 'tilgjengvurderingrulleauto'
      ) {
        node.valid = false;
      }
      return node;
    }
  });

  const [error, setError] = useState(() => {
    if (nodeState.value != undefined) {
      const error = !verifyFieldInput(nodeState, nodeState.value, false).valid;

      if (error == true && onError) {
        onError(true);
      }

      return error;
    } else {
      return false;
    }
  });

  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  const onChange = event => {
    setErrorMsg(undefined);

    const value = event.target.value;

    if (value.length === 0) {
      node.value = undefined;
      if (nodeState.xsdElement?.minOccurs) {
        node.valid = false;
      } else {
        node.valid = true;
        setError(false);
        setNodeState({
          ...nodeState,
          value: undefined,
          valid: true,
        });
      }
    } else {
      const fieldVerificationResp: FieldVerificationResponse = unionMemberTypes
        ? { valid: true }
        : verifyFieldInput(nodeState, value, false);

      if (value.length > 0 && fieldVerificationResp.valid) {
        setError(false);
        node.value = value;
        node.valid = true;
        setNodeState({
          ...nodeState,
          value: value,
          valid: true,
        });
      } else if (!fieldVerificationResp.valid) {
        node.valid = false;
        setNodeState({ ...nodeState, valid: false });

        setError(true);

        if (fieldVerificationResp.errorMsg != undefined)
          setErrorMsg(fieldVerificationResp.errorMsg);
      }
    }
    onFieldChange();
  };

  const handleOnFocusOut = () => {
    let fieldValue = nodeState.value;
    if (type == XsdPrimitiveType.double && fieldValue) {
      if (!fieldValue.includes('.')) {
        fieldValue = fieldValue + '.0';
      } else if (fieldValue.indexOf('.') == fieldValue.length - 1) {
        fieldValue = fieldValue + '0';
      }
    }

    const fieldVerificationResp = verifyFieldInput(node, fieldValue, true);

    if (fieldVerificationResp.valid == false) {
      setError(true);
      setErrorMsg(fieldVerificationResp.errorMsg);
      node.valid = false;
    } else if (fieldVerificationResp.valid == true) {
      setError(false);
      setErrorMsg(undefined);
      node.valid = true;
    }

    setNodeState({
      ...nodeState,
      valid: fieldVerificationResp.valid,
      value: fieldValue,
    });

    console.log('ON FOCUS OUT');
  };

  const getDocumentation = (): string => {
    if (documentation == undefined) return '';

    let legitValuesText: string = '';

    const plaus = node.plausibilityValidation;

    if (plaus != undefined) {
      legitValuesText =
        'Lovlige verdier ' +
        plaus.min +
        ' - ' +
        plaus.max +
        ' ' +
        plaus.type +
        '.';
    }

    return documentation + '\n' + legitValuesText;
  };

  const disabled =
    element.name.toLowerCase() == 'tilgjengvurderingrulleauto' ||
    element.name.toLowerCase() == 'tilgjengvurderingelrull' ||
    element.name.toLowerCase() == 'tilgjengvurderingelrullestol' ||
    // element.name.toLowerCase() == 'rampetilgjengelig' ||
    element.name.toLowerCase() == 'objektnr';
  const { t } = useTranslation();

  switch (type) {
    case XsdPrimitiveType.double:
    case XsdPrimitiveType.integer:
    case XsdPrimitiveType.string:
      return (
        <div>
          <TextField
            style={{ paddingBottom: 2 }}
            fullWidth
            variant={'filled'}
            id={name}
            disabled={disabled}
            label={name}
            type={
              (type ?? XsdPrimitiveType.string) == XsdPrimitiveType.string
                ? 'text'
                : 'number'
            }
            helperText={
              <ShowMoreText
                lines={2}
                more={t(translations.showMore)}
                less={t(translations.showLess)}
                className={classes.label}
                width={280}>
                {errorMsg ?? getDocumentation()}
              </ShowMoreText>
            }
            placeholder={'Angi'}
            InputProps={{
              classes: {
                input: classes.input,
              },
            }}
            InputLabelProps={{
              classes: {
                root: classes.label,
                focused: classes.focusedLabel,
              },
            }}
            // InputLabelProps={{ shrink: true }}
            value={nodeState.value || ''}
            onChange={event => onChange(event)}
            required={element.minOccurs > 0 || node.required}
            error={error}
            onBlur={handleOnFocusOut}
          />
        </div>
      );

      break;
  }

  if (unionMemberTypes) {
    return (
      <FormControl
        style={{ paddingBottom: 2 }}
        variant="filled"
        fullWidth
        required={
          disabled == false &&
          (element.minOccurs > 0 || node.required) &&
          element.name.toLowerCase() != 'tilgjengvurderingrulleauto'
        }
        disabled={disabled}
        error={error}>
        <InputLabel shrink>{name}</InputLabel>
        <Select
          classes={{
            select: classes.input,
          }}
          value={nodeState.value || ''}
          onChange={event => onChange(event)}
          displayEmpty>
          <MenuItem value={''}>
            <em>Ikke valgt</em>
          </MenuItem>
          {unionMemberTypes
            .filter(e => e.restriction.enumeration !== undefined)
            .map(type => {
              const enumerations = type.restriction.enumeration;

              if (!enumerations) {
                throw 'Enumerations is undefined';
              }

              return enumerations.map(enumeration => (
                <MenuItem key={enumeration.value} value={enumeration.value}>
                  {enumeration.value}
                </MenuItem>
              ));
            })}
        </Select>
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, height: 0 }}
          value={nodeState.value || ''}
          required={
            disabled == false && (element.minOccurs > 0 || node.required)
          }
        />
        {withDescription ? (
          <div
            style={{
              padding: '0px 16px',
            }}>
            <ShowMoreText
              lines={2}
              more={t(translations.showMore)}
              less={t(translations.showLess)}
              className="MuiFormHelperText-root"
              width={280}>
              <FormHelperText>{documentation}</FormHelperText>
            </ShowMoreText>
          </div>
        ) : null}
      </FormControl>
    );
  }

  throw 'no solution in place for this element';
});

const SwitchableField = memo<{
  description: String;
  mainNode: FeatureNode;
  nodes: FeatureNode[];
  onFieldChange: () => void;
}>(({ description, onFieldChange, nodes, mainNode }) => {
  const classes = useStyles();

  const [expanded, setExpand] = useState<boolean>(() => {
    if (mainNode?.value) {
      if (mainNode.value == 'Ja') return true;
      else return false;
    }

    return false;
  });

  const [error, setError] = useState<boolean>(false);

  const filteredNodes = nodes.filter(node => {
    if (node.dependency != undefined) {
      node.dependency.dependsOnNode = nodes.find(
        n =>
          n.name.toLowerCase() ==
          node.dependency?.dependsOnNodeName.toLowerCase(),
      );

      if (node.dependency.dependsOnNodeName == 'ledelinje') {
        if (
          node.dependency.dependsOnNode?.value == undefined ||
          node.dependency.dependsOnNode?.value?.toLowerCase() == 'ingen'
        )
          return false;
      } else if (node.dependency.dependsOnValue.includes(',')) {
        const values = node.dependency.dependsOnValue.split(',');

        for (const val of values) {
          if (val.trim() == node.dependency.dependsOnNode!.value) {
            return true;
          }
        }
        return false;
      }
      /// This is where the dependency value comparison takes place.
      else if (
        node.dependency.dependsOnNode!.value?.toLowerCase() !=
        node.dependency.dependsOnValue.toLowerCase()
      ) {
        return false;
      }
    }
    return true;
  });

  let content = (
    <div>
      {filteredNodes.map((node, index) =>
        index !== 0 ? (
          <SequenceField
            node={node}
            onFieldChange={() => {
              onFieldChange();
              if (error == true && filteredNodes[0].value == 'Ja')
                setError(false);
            }}
            onError={error => {
              if (filteredNodes[0].value == 'Ja') {
                setError(error);
              }
            }}></SequenceField>
        ) : null,
      )}
    </div>
  );

  if (expanded !== null) {
    content = <Collapse in={expanded}>{content}</Collapse>;
  }

  return (
    <Paper elevation={3} className={classes.paper}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          height: '64px',
        }}>
        {error == true ? (
          <CancelError
            style={{
              marginRight: '12px',
              color: 'rgb(176, 0, 32)',
            }}></CancelError>
        ) : null}
        <Typography variant={'h6'} className={classes.headerName}>
          {description}
        </Typography>
        <div
          style={{
            float: 'right',
            display: 'inline-flex',
            alignItems: 'center',
          }}>
          <Typography variant={'h6'} className={classes.headerName}>
            {expanded ? 'Ja' : 'Nei'}
          </Typography>
          <Switch
            color="primary"
            style={{
              color: expanded ? 'rgb(26, 88, 159)' : 'white',
              backgroundColor: 'rgba(26, 88, 159, 0,3)',
            }}
            checked={expanded}
            onChange={(e, checked) => {
              if (checked === true) {
                mainNode.value = 'Ja';
              } else {
                mainNode.value = undefined;
              }
              onFieldChange();

              if (checked == false && error == true) {
                setError(false);
              }
              setExpand(checked);
            }}
          />
        </div>
      </div>
      {content}
    </Paper>
  );
});
