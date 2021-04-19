import React, { useEffect, useState } from 'react';
import {
  CardContent,
  Card,
  makeStyles,
  createStyles,
  Divider,
  Collapse,
  IconButton,
} from '@material-ui/core';
import { ObjectCategory, ObjectSelectorType, ObjectSubCategory } from '.';
import ArrowDownIcon from '@material-ui/icons/ExpandMore';
import ArrowUpIcon from '@material-ui/icons/ExpandLess';
import ArrowRight from '@material-ui/icons/ArrowRight';
import CheckBoxList from '../ImportObjects/CheckBoxList';
import { useContext } from 'react';
import { DataContext } from 'app/containers/HomePage';
import { FeatureMember } from 'app/model/FeatureMember';

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      marginTop: '16px',
      marginBottom: '16px',
    },
  }),
);

type ObjectListItemProps = {
  category: ObjectCategory;
  onSelect: any;
  isSelected: boolean;
  type: ObjectSelectorType;
  onCheckChange: () => void;
  isCopy: boolean;
};

export default function ObjectListItem(props: ObjectListItemProps) {
  const classes = useStyles();

  const category: ObjectCategory = props.category;

  const hasSubs: boolean = category.subCategories.length > 0;

  const [showSubs, setShowSubs] = useState<boolean>(() => {
    if (props.type == ObjectSelectorType.import) {
      return false;
    } else {
      const show = hasSubs && props.isSelected;
      // ||
      // (props.type == ObjectSelectorType.filter && category.checked));

      return show;
    }
  });

  const { featureCollection, objectFilter } = useContext(DataContext);

  const [checked, setChecked] = useState<boolean>(category.checked);

  const [, updateState] = useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const onCheckedChange = (val: boolean) => {
    if (hasSubs) {
      for (let sub of category.subCategories) {
        sub.checked = val;
      }
    }
    category.checked = val;
    setChecked(val);

    props.onCheckChange();
  };

  const getIcon = () => {
    let icon;
    if (hasSubs) {
      if (
        (props.type == ObjectSelectorType.filter && showSubs) ||
        (props.type != ObjectSelectorType.filter && props.isSelected)
      ) {
        icon = <ArrowUpIcon style={{ float: 'right' }}></ArrowUpIcon>;
      } else {
        icon = <ArrowDownIcon style={{ float: 'right' }}></ArrowDownIcon>;
      }
    } else if (props.type == ObjectSelectorType.filter) {
      icon = (
        <ArrowRight
          onClick={() => {
            if (checked == true) props.onSelect({ name: category.name });
          }}
          style={{
            color: checked ? 'black' : 'rgba(0, 0, 0, 0.54)',
          }}></ArrowRight>
      );
    }

    if (icon)
      return (
        <IconButton size="small" style={{ float: 'right', top: '0px' }}>
          {icon}
        </IconButton>
      );

    return <div></div>;
  };

  const [categoryLastRegistration, setCategoryLastRegistration] = useState<
    FeatureMember | undefined
  >();

  const getLastCategoryRegistration = (
    objectType: string,
  ): FeatureMember | undefined => {
    if (!featureCollection || featureCollection?.featureMembers?.length < 1) {
      return undefined;
    } else {
      const matchingFeatureMembers = featureCollection.featureMembers.filter(
        element => element.type!.toLowerCase() == objectType.toLowerCase(),
      );
      if (!matchingFeatureMembers || matchingFeatureMembers.length < 1) {
        return undefined;
      } else {
        let featureMemberMatch: FeatureMember | undefined = undefined;
        for (let featureMember of matchingFeatureMembers) {
          let origin = featureMember.nodes.find(node => node.name == 'opphav');

          // TODO: Bruk nåværende bruker
          // && origin.value == "nåværende_bruker"
          if (origin) {
            if (
              featureMemberMatch == undefined &&
              featureMember.nodes.find(
                element => element.name.toLowerCase() == 'førstedatafangstdato',
              )?.value
            ) {
              featureMemberMatch = featureMember;
            } else {
              const currentMatch =
                featureMemberMatch?.getNodeInstance('datafangstdato')?.value ??
                featureMemberMatch?.getNodeInstance('førstedatafangstdato')
                  ?.value;
              const potentialMatch =
                featureMember.getNodeInstance('datafangstdato')?.value ??
                featureMember.getNodeInstance('førstedatafangstdato')?.value;

              if (potentialMatch && potentialMatch > currentMatch) {
                featureMemberMatch = featureMember;
              }
            }
          }
        }
        if (featureMemberMatch) {
          if (categoryLastRegistration) {
            const potentialMatch =
              featureMemberMatch.getNodeInstance('datafangstdato')?.value ??
              featureMemberMatch.getNodeInstance('førstedatafangstdato')?.value;
            const currentMatch =
              categoryLastRegistration.getNodeInstance('datafangstdato')
                ?.value ??
              categoryLastRegistration.getNodeInstance('førstedatafangstdato')
                ?.value;

            if (potentialMatch > currentMatch) {
              setCategoryLastRegistration(featureMemberMatch);
            }
          } else {
            setCategoryLastRegistration(featureMemberMatch);
          }
        }
        if (category.subCategories.length > 0) {
          category.subCategories.find(
            element => element.type == objectType,
          )!.copy = featureMemberMatch;
        }
        return featureMemberMatch;
      }
    }
  };

  const getLastRegistrationDate = (
    featureMember: FeatureMember | undefined,
  ): string | undefined => {
    if (!featureMember) return undefined;
    else return 'Siste registrering: ' + featureMember.getCreatedAtDate(true);
  };

  if (
    category.name.toLowerCase() == 'sittegruppe' &&
    !categoryLastRegistration
  ) {
    getLastCategoryRegistration('sittegruppe');
  }

  const getFilterValuesCount = (objectType: string) => {
    const featureMember: FeatureMember | undefined = objectFilter?.objects.get(
      objectType,
    );

    if (featureMember == undefined) return '';

    let count = 0;

    if (featureMember.availabilityNode?.filterNode?.isApplied == true) count++;

    for (const node of featureMember.nodes) {
      if (node.value != undefined) count++;
    }

    return ` (${count.toString()})`;
  };

  const backgroundColor = props.isSelected ? 'rgba(33, 137, 214, 0.12)' : '';

  let subContent = (
    <div>
      {category.subCategories.map((sub, index) => {
        const content = (
          <div
            key={index}
            onClick={() => {
              if (props.type == ObjectSelectorType.select) {
                props.onSelect({
                  name: formatSubcatName(sub.type, category.name),
                  type: sub.type,
                  copy: props.isCopy ? sub.copy : undefined,
                });
              }
            }}>
            <div
              style={{
                height: '64px',
                width: '100%',
                fontSize: '14.26px',
                fontFamily: 'Arial',
                lineHeight: '20px',
                color: 'rgba(0,0,0, 0.87)',
                alignContent: 'center',
              }}>
              <div
                style={{
                  paddingLeft: '16px',
                  top: '35%',
                  position: 'relative',
                  display: 'grid',
                  gridAutoFlow: 'column',
                  gridColumnGap: '10px',
                }}>
                {formatSubcatName(sub.type, category.name)}
                {getFilterValuesCount(sub.type)}
              </div>

              {props.type == ObjectSelectorType.filter ? (
                <IconButton
                  onClick={() => {
                    if (
                      props.type == ObjectSelectorType.filter &&
                      sub.checked == true
                    ) {
                      props.onSelect({
                        name: formatSubcatName(sub.type, category.name),
                        type: sub.type,
                        copy: props.isCopy ? sub.copy : undefined,
                      });
                    }
                  }}
                  size="small"
                  style={{ float: 'right', top: '0px' }}>
                  <ArrowRight
                    style={{
                      color: sub.checked ? 'black' : 'rgba(0, 0, 0, 0.54)',
                    }}></ArrowRight>
                </IconButton>
              ) : null}
            </div>
            {props.isCopy && getLastCategoryRegistration(sub.type) ? (
              <div
                style={{
                  paddingLeft: '16px',
                  paddingBottom: '16px',
                  position: 'relative',
                  display: 'grid',
                  gridAutoFlow: 'column',
                  fontSize: '14px',
                  gridColumnGap: '10px',
                }}>
                {getLastRegistrationDate(getLastCategoryRegistration(sub.type))}
              </div>
            ) : null}
            <Divider style={{ marginLeft: '16px' }}></Divider>
          </div>
        );

        if (props.type == ObjectSelectorType.select) return content;

        return (
          <CheckBoxList
            checked={checked === false ? false : sub.checked}
            onChange={val => {
              if (val === true && checked === false) {
                category.checked = true;
                setChecked(true);
              }

              sub.checked = val;

              if (val == false) {
                let checkChecked = false;
                for (let sub of category.subCategories) {
                  if (sub.checked == true) checkChecked = true;
                }
                if (checkChecked == false) {
                  category.checked = false;
                  setChecked(false);
                }
              }

              forceUpdate();
              props.onCheckChange();
            }}
            content={content}></CheckBoxList>
        );
      })}
    </div>
  );

  if (showSubs !== null) {
    subContent = <Collapse in={showSubs}>{subContent}</Collapse>;
  }

  let content = (
    <div
      style={{
        marginLeft: '-16px',
      }}>
      <div
        onClick={() => {
          if (
            category.name.toLowerCase() != 'sittegruppe' ||
            props.type == ObjectSelectorType.select
          )
            props.onSelect({
              name: category.name,
              copy:
                category.name.toLowerCase() == 'sittegruppe' && props.isCopy
                  ? categoryLastRegistration
                  : undefined,
            });

          setShowSubs(!showSubs);
        }}
        style={{
          height: '64px',
          fontWeight: 'bold',
          fontSize: '16.3px',
          fontFamily: 'Arial',
          lineHeight: '24px',
          backgroundColor:
            props.type == ObjectSelectorType.select ? backgroundColor : '',
          color: 'rgba(0,0,0, 0.87)',
        }}>
        <div
          style={{
            paddingLeft: '16px',
            top: '35%',
            position: 'relative',
            display: 'grid',
            gridAutoFlow: 'column',
            gridColumnGap: '10px',
          }}>
          {category.name}
          {category.name.toLowerCase() == 'sittegruppe' &&
          props.type == ObjectSelectorType.filter
            ? getFilterValuesCount(category.name)
            : null}
          <div style={{ paddingRight: '16px' }}>{getIcon()}</div>
        </div>
      </div>
      {props.isCopy ? (
        <div
          onClick={() =>
            props.onSelect({
              name: category.name,
              copy:
                category.name.toLowerCase() == 'sittegruppe' && props.isCopy
                  ? categoryLastRegistration
                  : null,
            })
          }
          style={{
            paddingLeft: '16px',
            paddingBottom: '16px',
            position: 'relative',
            display: 'grid',
            fontSize: '14px',
            gridAutoFlow: 'column',
            backgroundColor:
              props.type == ObjectSelectorType.select ? backgroundColor : '',

            gridColumnGap: '10px',
          }}>
          {categoryLastRegistration
            ? getLastRegistrationDate(categoryLastRegistration)
            : 'Ingen registreringer funnet'}
        </div>
      ) : null}
      <Divider style={{ marginLeft: '16px' }}></Divider>

      {subContent}
    </div>
  );

  if (props.type == ObjectSelectorType.select) return content;

  return (
    <CheckBoxList
      checked={checked}
      onChange={checked => onCheckedChange(checked)}
      content={content}></CheckBoxList>
  );
}

export const formatSubcatName = (sub: string, categoryName: string): string => {
  var name = sub.substring(categoryName.length);

  if (name.substring(name.length - 2).toLowerCase() === 'gr') {
    name = name.substring(0, name.length - 2) + ' gruppe';
  }

  var isHC: boolean = false;

  if (!name.includes('område')) {
    if (name.includes('omr')) {
      name = name.replace('omr', 'område');
    }
  }

  if (name.startsWith('HC')) {
    name = name.substr(0, 2) + ' ' + name.substring(2);
    isHC = true;
  }

  const proxy = name;

  const posOfUpperCases: number[] = [];

  for (let i = 0; i < proxy.length; i++) {
    if (isHC !== true || i > 2) {
      const letter = proxy[i];

      if (letter == letter.toUpperCase()) {
        posOfUpperCases.push(i);
      }
    }
  }

  for (let i = 0; i < posOfUpperCases.length; i++) {
    const pos = posOfUpperCases[i];
    name = name.substring(0, pos + i) + ' ' + name.substring(pos + i);
  }

  name = name.trim();

  if (name.startsWith('St')) {
    name = name.replace('St', 'Statlig');
  }

  if (name.includes(' Sikr ')) {
    name = name.replace('Sikr', 'Sikret');
  }

  return name;
};
