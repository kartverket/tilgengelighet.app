import React, { useContext, useEffect, useState } from 'react';
import { makeStyles, useMediaQuery, useTheme, Paper } from '@material-ui/core';
import { XsdElement, XsdPrimitiveType } from '../../../sosi/xsd';
import { groupBy } from 'lodash';
import { getSchema } from '../../../sosi/schema_impl';
import { getByTitle } from '@testing-library/react';
import { ObjectProps } from '../MapActions';
import useWindowDimensions from 'app/utils/windowDimensions';
import {
  FeatureMember,
  FeatureNode,
  FeatureComplexNode,
  ImageElement,
  getPlausibilityValidation,
  getDependencyForFeatureNode,
  getFeatureNodeValueWithDataType,
  getRequiredForFeatureNode,
  RegistrationStatus,
} from 'app/model/FeatureMember';
import { FormStep, createFormSteps } from 'app/views/ObjectEditorContent';
import CustomButton from 'app/components/ImportObjects/CustomButton';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import {
  AlterFeatureCollectionResponse,
  createFeatureMember,
  UpdateAction,
} from 'app/providers/DataProvider';
import { DataContext } from '../HomePage';
import { TopBar } from 'app/components/ImportObjects/TopBar';
import { formatSubcatName } from 'app/components/ObjectSelector/ObjectListItem';
import {
  friluftHcParkeringsplassRullestol,
  friluftParkeringsOmraadeRullestol,
  friluftParkeringsOmraadeRullestolEl,
  friluftTurveiRullestol,
} from 'app/accessiblity/accessibilityAssessment';
import { performAccessibilityAssessment } from 'app/accessiblity/accessibilityExecution';
import { LocalStorageProvider } from 'app/providers/LocalStorageProvider';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
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
  publishButtonInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.87)',
    color: 'rgba(0, 0, 0, 0.38)',
  },
});

interface ObjectEditorProps {
  objectProps: ObjectProps;
  onPop: () => void;
  onConfirm: () => void;
  featureMember?: FeatureMember;
  getFeatureMember: (featureMember: FeatureMember) => void;
  isNewReg: boolean;
}

export type EditorValidation = {
  validation?: boolean;
};

export const ValidationContext = React.createContext<EditorValidation>({});

export default function ObjectEditor(props: ObjectEditorProps) {
  const { t } = useTranslation();

  const classes = useStyles();

  const theme = useTheme();

  const {
    onCreateFeatureMember,
    saveData,
    demoModeActive,
    onRebuildObjectLayer,
  } = useContext(DataContext);

  const { height, width } = useWindowDimensions();

  const [editorValidation, setValidation] = useState<EditorValidation>({});

  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const formRef = React.useRef<any>();

  const schema = getSchema();

  const containerRef = React.useRef<any>();

  const [scrollable, setScrollable] = useState<boolean>(false);

  const [hasMadeChange, setHasMadeChange] = useState<boolean>(false);

  const [, updateState] = useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const disabledButtonStyle = {
    backgroundColor: 'lightgrey',
    color: 'rgba(0, 0, 0, 0.38)',
  };

  const objectTypeName = props.featureMember
    ? props.featureMember.type!
    : props.objectProps.type;

  if (!objectTypeName) throw 'Object type name is undefined!!!!!';

  const objectType = schema.getObjectTypeByName(objectTypeName)!! as XsdElement;

  const substitution = objectType.substitutionGroup!!;

  const initNewFeatureMember = (): FeatureMember => {
    const member = new FeatureMember();

    member.sosiElement = objectType;

    member.type = objectType.name;

    if (member.nodes.length < 1) {
      const elements = objectType.elements;

      for (let element of elements) {
        if (
          element.name?.toLowerCase()?.includes('baderampe') ||
          (!element.name?.toLowerCase()?.includes('bildefil') &&
            !element.name?.toLowerCase()?.includes('identifikasjon') &&
            !element.name?.toLowerCase()?.includes('rampe') &&
            !element.name?.toLowerCase()?.includes('trapp') &&
            !element.name?.toLowerCase()?.includes('datafangstdato'))
        )
          member.nodes.push(
            new FeatureNode(
              element.name,
              props.objectProps.copy?.nodes.find(e => e.name == element.name)
                ?.value ?? undefined,
              true,
              element.type as XsdPrimitiveType,
              element,
              getPlausibilityValidation(member.type, element.name),
              getDependencyForFeatureNode(member.type, element.name),
              getRequiredForFeatureNode(member.type, element.name),
            ),
          );
      }

      if (objectType.hasRampFields) {
        const rampType = schema.getObjectTypeByName('rampe');

        const required =
          elements.find(element => element.name == 'rampe')?.minOccurs! > 0;

        const children = rampType?.elements.map(
          element =>
            new FeatureNode(
              element.name,
              props.objectProps.copy?.nodes.find(
                e => e.name == element.name,
              )?.value,
              true,
              element.type as XsdPrimitiveType,
              element,
              getPlausibilityValidation(member.type!, element.name),
              getDependencyForFeatureNode('rampe', element.name),
              getRequiredForFeatureNode('rampe', element.name),
            ),
        );

        children![0].value = 'Nei';

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
              props.objectProps.copy?.nodes.find(
                e => e.name == element.name,
              )?.value,
              true,
              element.type as XsdPrimitiveType,
              element,
              getPlausibilityValidation(member.type!, element.name),
              getDependencyForFeatureNode('trapp', element.name),
              getRequiredForFeatureNode('trapp', element.name),
            ),
        );

        children![0].value = 'Nei';

        member.stairNode = new FeatureComplexNode('Trapp', children!, required);
      }
    }

    member.localId = props.objectProps.id;

    member.geometry = {
      type: props.objectProps.geoType!,
      coordinates: props.objectProps.coordinates!,
    };

    for (const node of member.nodes) {
      if (node.dependency != undefined) {
        node.dependency.dependsOnNode = member.nodes.find(
          e =>
            e.name?.toLowerCase() ==
            node.dependency?.dependsOnNodeName?.toLowerCase(),
        );
      }
    }

    props.getFeatureMember(member);
    return member;
  };

  const initExistingFeatureMember = (): FeatureMember | undefined => {
    if (props.featureMember) {
      for (let element of objectType.elements) {
        const name = element.name?.toLowerCase();
        if (
          name == 'geometri' ||
          name == 'rampe' ||
          name == 'trapp' ||
          name == 'identifikasjon' ||
          name == 'opphav' ||
          name == 'objektnr' ||
          name.includes('bildefil') ||
          name.includes('datafangstdato')
        ) {
          continue;
        }

        const correspondingNode = props.featureMember.getNodeInstance(
          element.name,
        );

        if (correspondingNode) {
          correspondingNode.xsdElement = element;
          correspondingNode.dependency = getDependencyForFeatureNode(
            props.featureMember.type!,
            element.name,
          );
          correspondingNode.required = getRequiredForFeatureNode(
            props.featureMember.type!,
            element.name,
          );
        } else {
          props.featureMember.nodes.push(
            new FeatureNode(
              element.name,
              undefined,
              true,
              element.type as XsdPrimitiveType,
              element,
              getPlausibilityValidation(
                props.featureMember.type!,
                element.name,
              ),
              getDependencyForFeatureNode(
                props.featureMember.type!,
                element.name,
              ),
              getRequiredForFeatureNode(
                props.featureMember.type!,
                element.name,
              ),
            ),
          );
        }
      }
      for (const node of props.featureMember.nodes) {
        if (node.dependency != undefined) {
          node.dependency.dependsOnNode = props.featureMember.nodes.find(
            e =>
              e.name?.toLowerCase() ==
              node.dependency?.dependsOnNodeName?.toLowerCase(),
          );
        }
      }
      return props.featureMember;
    }
  };

  const [featureMember, setFeatureMember] = useState<FeatureMember>(() => {
    onRebuildObjectLayer!(undefined);

    if (!props.featureMember) {
      return initNewFeatureMember();
    } else {
      return initExistingFeatureMember()!;
    }
  });

  useEffect(() => {
    const containerHeight = containerRef?.current?.clientHeight;

    if (!containerHeight) setScrollable(true);
    else {
      if (containerHeight > height - 48) setScrollable(true);
      else setScrollable(false);
    }
  });

  const [initialImages] = useState<ImageElement[]>(featureMember.images);

  const onFieldChange = () => {
    if (!hasMadeChange) setHasMadeChange(true);

    if (
      featureMember.nodes.find(n => n.name?.toLowerCase() == 'byggingpågår')
        ?.value == 'Nei'
    ) {
      setFeatureMember(initExistingFeatureMember()!);
    }

    featureMember.editedByUser = true;
    if (canPublish == undefined) setPublish(false);

    if (editorValidation.validation == true)
      setValidation({ validation: false });

    if (canPublish) setPublish(false);

    forceUpdate();
  };

  const getFormSteps = (): FormStep[] => {
    return createFormSteps(objectType, featureMember, onFieldChange);
  };

  const formSteps: FormStep[] = getFormSteps();

  const validate = (canUpdateState?: boolean): boolean => {
    let inputIsValid: boolean = true;

    let fields = featureMember.nodes;

    if (featureMember.rampNode) {
      if (featureMember.rampNode.nodes[0].value == 'Ja')
        fields = fields.concat(featureMember.rampNode.nodes);
    }

    if (featureMember.stairNode) {
      if (featureMember.stairNode.nodes[0].value == 'Ja')
        fields = fields.concat(featureMember.stairNode.nodes);
    }

    for (let node of fields) {
      if (
        node.valid == false ||
        (node.required == true && node.value == undefined)
      ) {
        /// Independent validation for node with dependency
        if (node.dependency != null) {
          if (
            node.dependency.dependsOnNode?.value?.toLowerCase() !=
            node.dependency.dependsOnValue?.toLowerCase()
          ) {
            continue;
          }
        }
        node.valid = false;
        inputIsValid = false;
        break;
      }
    }

    if (
      featureMember.nodes.find(n => n.name?.toLowerCase() == 'byggingpågår')
        ?.value == 'Ja'
    ) {
      if (featureMember.images.length < 1) {
        inputIsValid = false;
      }
    }

    if (!inputIsValid && canUpdateState != false) {
      setValidation({ validation: true });

      formRef?.current?.reportValidity();
    }

    if (inputIsValid && canUpdateState != false) {
      setPublish(true);
    }

    if (inputIsValid) {
      performAccessibilityAssessment(featureMember);
    }

    return inputIsValid;
  };

  const [canPublish, setPublish] = useState<boolean | undefined>();

  useEffect(() => {
    if (canPublish == undefined) setPublish(validate(false));
  });

  const onApproveRegistration = async () => {
    if (validate() == true) {
      props.onConfirm();

      onCreateFeatureMember!(featureMember);

      featureMember.onApproveForPublishing();

      const updateAction =
        featureMember.dbAction == UpdateAction.create
          ? UpdateAction.create
          : UpdateAction.replace;

      if (demoModeActive == true) {
        if (props.isNewReg == true) {
          featureMember.isDemo = true;
        }
      } else {
        const response: AlterFeatureCollectionResponse = await createFeatureMember(
          featureMember,
        );

        if (response.statusCode == 200) {
          featureMember.dbAction = UpdateAction.replace;
          featureMember.registrationStatus = RegistrationStatus.importedYTD;
          featureMember.editedByUser = false;
        } else {
          if (response.statusCode == 999) {
            featureMember.registrationStatus = RegistrationStatus.clientError;
          } else {
            featureMember.registrationStatus = RegistrationStatus.serverError;
          }

          LocalStorageProvider.setConnectionError(true);
        }
      }

      onRebuildObjectLayer!({
        id: featureMember.localId!,
        updateAction: updateAction,
      });
      saveData!(featureMember != undefined ? featureMember : undefined);
    }
  };

  const getTitle = (): string | undefined => {
    let categoryName;

    const objName = objectType.name;

    if (objName?.toLowerCase().includes('friluft')) {
      categoryName = 'Friluft';
    } else if (objName?.toLowerCase().includes('tettsted')) {
      categoryName = 'Tettsted';
    } else {
      return 'Sittegruppe';
    }

    if (objName == undefined || categoryName == undefined) return undefined;

    return categoryName + ' ' + formatSubcatName(objName, categoryName);
  };

  const assessButton = {
    id: 'assessButton',
    stepLabel: 'Assess',
    section: (
      <label
        htmlFor="button-for-validating-inputs"
        style={{ width: '100%', padding: '0px 16px' }}>
        <CustomButton
          type="submit"
          style={
            canPublish == true || canPublish == undefined
              ? disabledButtonStyle
              : {}
          }
          onClick={() => validate()}
          label={t(translations.objectEditor.validateInputs)}
          component="span"
        />
      </label>
    ),
  };

  if (
    featureMember.type?.toLowerCase() != 'friluftfriluftsområde' &&
    featureMember.type?.toLowerCase() != 'frilufthyttertilrettelagt' &&
    featureMember.type?.toLowerCase() != 'friluftstsikrfriluftomr'
  ) {
    formSteps.splice(formSteps.length - 1, 0, assessButton);
  } else {
    formSteps.push(assessButton);
  }

  let content = (
    <div className={classes.center}>
      <TopBar
        onPop={() => {
          onRebuildObjectLayer!(featureMember.localId!);
          props.onPop();
          if (hasMadeChange) {
            saveData!(featureMember != undefined ? featureMember : undefined);
          }
        }}
        title={getTitle() ?? objectType.name}
        isPop={smallScreen}
      />

      <ValidationContext.Provider value={editorValidation}>
        <form ref={formRef}>
          {formSteps.map((step, index) => (
            <div style={{ paddingTop: '16px', marginBottom: '16px' }}>
              {' '}
              {step.section}{' '}
            </div>
          ))}

          <div
            id="buttonWrapper"
            style={{
              padding: '14px 16px 40px 16px',
              position: 'relative',
              bottom: '10px',
              width: '100%',
              backgroundColor: '#F5F5F5',
            }}>
            <label
              htmlFor="button-for-approving-publishing"
              style={{ width: '100%', paddingTop: '14px' }}>
              <CustomButton
                style={canPublish != true ? disabledButtonStyle : {}}
                onClick={() => onApproveRegistration()}
                label={t(translations.objectEditor.approvePublishing)}
                component="span"
              />
            </label>
          </div>
        </form>
      </ValidationContext.Provider>
    </div>
  );

  // if (smallScreen) {
  //   return <div className={classes.root}>{content}</div>;
  // }

  if (smallScreen) {
    return (
      <Paper
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflowY: scrollable ? 'scroll' : 'auto',
          maxHeight: height,
          margin: 0,
          backgroundColor: '#F5F5F5',
        }}>
        {content}
      </Paper>
    );
  }

  return (
    <Paper
      style={{
        width: scrollable ? '382px' : '332px',
        overflowY: scrollable ? 'scroll' : 'auto',
        maxHeight: height,
        margin: 0,
        backgroundColor: '#F5F5F5',
      }}>
      {content}
    </Paper>
  );
}
