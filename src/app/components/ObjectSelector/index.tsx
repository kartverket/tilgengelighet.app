import React, {useEffect, useState} from 'react';
import {
  makeStyles,
  createStyles,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Paper,
} from '@material-ui/core';
import {getSchema} from '../../../sosi/schema_impl';
import {SosiSchema} from '../../../sosi/schema';
import ObjectListItem from './ObjectListItem';
import {ObjectProps} from 'app/containers/MapActions';
import useWindowDimensions from 'app/utils/windowDimensions';
import {useTranslation} from 'react-i18next';
import {translations} from 'locales/i18n';
import {FeatureMember} from 'app/model/FeatureMember';
import {TopBar} from '../ImportObjects/TopBar';
const useStyles = makeStyles(() =>
  createStyles({
    infoText: {
      padding: '15px 20px 0 15px',
      fontFamily: 'Arial',
      fontSize: '14px',
      lineHeight: '20px',
    },
    cardContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: '16px',
      lineHeight: '24px',
      marginTop: '6px',
    },
    cardText: {
      fontFamily: 'Arial',
      fontSize: '14px',
      lineHeight: '20px',
      color: 'rgba(0, 0, 0, 0.6)',
      width: '80%',
    },
    cardButton: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: '14px',
      lineHeight: '16px',
      color: 'rgb(26, 88, 159)',
      padding: '0 17px',
    },
    card: {
      marginTop: '16px',
    },
    cardContent: {
      paddingBottom: '0 !important',
    },
    checkboxH3: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: '16px',
      lineHeight: '24px',
      color: 'rgba(0, 0, 0, 0.87)',
      margin: 0,
    },
    flexCheckbox: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingRight: '10px',
    },
    notSelected: {
      width: '50%',
      height: '46px',
      textAlign: 'center',
      lineHeight: '46px',
    },
    selected: {
      width: '50%',
      color: '#2189D6',
      backgroundColor: 'rgba(33, 137, 214, 0.12)',
      height: '46px',
      textAlign: 'center',
      lineHeight: '46px',
      border: '1px solid #2189D6',
    },
  }),
);

export enum ObjectSelectorType {
  select,
  import,
  filter,
}

interface Props {
  onPop?: () => void;
  onSelect?: (props: ObjectProps) => void;
  type: ObjectSelectorType;
  onCheckChanged?: (categories: ObjectCategory[]) => void;
  categoryValues?: any;
  getCategoryValues?: (categoryValues: any) => void;
}

export type ObjectSubCategory = {
  name?: string;
  type: string;
  checked: boolean;
  copy?: FeatureMember;
};

export type ObjectCategory = {
  checked: boolean;
  name: string;
  subCategories: ObjectSubCategory[];
  type?: string;
};

const getCategories = (
  sosiSchema: SosiSchema,
  checked: boolean,
): ObjectCategory[] => {
  const friluftStrings: string[] = sosiSchema.objectTypeNames.filter(
    subName => {
      if (
        subName.substring(0, 7) === 'Friluft' &&
        subName.length > 7 &&
        subName != 'FriluftFriluftomrGr' &&
        subName != 'FriluftParkeringsområdeGr' &&
        subName != 'FriluftStSikrFriluftomrGr'
      ) {
        return true;
      } else {
        return false;
      }
    },
  );

  const friluft: ObjectCategory = {
    checked: checked,
    name: 'Friluft',
    subCategories: friluftStrings.map(subName => {
      return {type: subName, checked: checked};
    }),
  };

  const tettstedStrings: string[] = sosiSchema.objectTypeNames.filter(
    subName => {
      if (
        subName.substring(0, 8) === 'Tettsted' &&
        subName.length > 8 &&
        subName != 'TettstedParkeringsområdeGr'
      )
        return true;
      else return false;
    },
  );

  const tettsted: ObjectCategory = {
    checked: checked,
    name: 'Tettsted',
    subCategories: tettstedStrings.map(subName => {
      return {type: subName, checked: checked};
    }),
  };

  const sittegruppe: ObjectCategory = {
    checked: checked,
    name: 'Sittegruppe',
    type: 'sittegruppe',
    subCategories: [],
  };

  return [friluft, tettsted, sittegruppe];
};

const schema = getSchema();

export default function ObjectSelector (props: Props) {
  const classes = useStyles();

  const {t} = useTranslation();

  const {height, width} = useWindowDimensions();

  const [scrollable, setScrollable] = useState<boolean>(false);

  const theme = useTheme();

  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [copy, setCopy] = useState<boolean>(false);

  const containerRef = React.useRef<any>();

  const [categories] = useState<ObjectCategory[]>(() => {
    if (props.categoryValues?.size != undefined) {
      const categories = getCategories(schema, true);

      if (props.categoryValues.size > 0) {
        for (const filterKey of props.categoryValues.keys()) {
          for (const category of categories) {
            if (filterKey == category.type || filterKey == category.name)
              category.checked = true;

            if (category.subCategories.length > 0) {
              for (const subCat of category.subCategories) {
                if (filterKey == subCat.type || filterKey == subCat.name) {
                  subCat.checked = true;
                  category.checked = true;
                }
              }
            }
          }
        }
      }
      if (props.getCategoryValues) props.getCategoryValues(categories);

      return categories;
    } else {
      return (
        props.categoryValues ??
        getCategories(
          schema,
          props.type == ObjectSelectorType.import ? true : false,
        )
      );
    }
  });

  const [selectedCategory, setSelected] = useState<ObjectCategory>();

  useEffect(() => {
    const containerHeight = containerRef?.current?.clientHeight;

    if (!containerHeight) {
      if (scrollable == false) setScrollable(true);
    } else {
      if (containerHeight > height - 48 && scrollable == false)
        setScrollable(true);
      else if (scrollable == true) setScrollable(false);
    }
  }, []);

  const onSelect = (
    category: ObjectCategory | ObjectSubCategory,
    objectEditorProps: ObjectProps,
  ) => {
    const hasChildren: boolean =
      (category as ObjectCategory).subCategories.length > 0;

    if (objectEditorProps.type !== undefined) {
      if (props.onSelect)
        props.onSelect({
          name: objectEditorProps.name,
          type: objectEditorProps.type ?? objectEditorProps.name,
          copy: objectEditorProps.copy,
        });
    } else if (!hasChildren) {
      if (props.onSelect)
        props.onSelect({
          name: objectEditorProps.name,
          type: objectEditorProps.type ?? objectEditorProps.name,
          copy: objectEditorProps.copy,
        });
    } else {
      if (category as ObjectCategory) {
        if (selectedCategory?.name == category.name) setSelected(undefined);
        else setSelected(category as ObjectCategory);
      } else {
        console.log('objectSUBCategory');
      }
    }
    if (props.getCategoryValues) props.getCategoryValues(categories);
  };

  const onCheckChange = () => {
    if (props.onCheckChanged) props.onCheckChanged(categories);
    if (props.getCategoryValues) props.getCategoryValues(categories);
  };

  let listItems = (
    <div>
      {categories.map((category, index) => (
        <ObjectListItem
          isCopy={copy}
          type={props.type}
          key={index}
          category={category}
          onSelect={sub => onSelect(category, sub)}
          onCheckChange={() => onCheckChange()}
          isSelected={
            category.name === selectedCategory?.name
          }></ObjectListItem>
      ))}
    </div>
  );

  if (props.type == ObjectSelectorType.filter)
    return (
      <div
        style={{
          padding: '0px 0px 0px 16px',
          //width: '320px',
        }}>
        {listItems}
      </div>
    );

  let selectable = (
    <Card className={classes.card}>
      <CardContent
        style={{
          padding: '0px 0px 0px 16px',
        }}>
        {listItems}
      </CardContent>
    </Card>
  );

  if (props.type != ObjectSelectorType.select) return selectable;

  let content = (
    <div style={{backgroundColor: '#F5F5F5'}}>
      <TopBar
        isPop={smallScreen}
        onPop={() => props.onPop!()}
        title={t(translations.objectSelector.title)}
      />
      <Card className={classes.card}>
        <CardContent
          style={{
            marginTop: '4px',
            padding: '10px 15px',
          }}>
          <div
            style={{
              height: '46px',
              border: '1px solid rgb(245, 245, 245)',
              borderRadius: 4,
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'Arial',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <div
              onClick={() => setCopy(false)}
              className={!copy ? classes.selected : classes.notSelected}
              style={
                !copy
                  ? {
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4,
                  }
                  : {}
              }>
              {t(translations.objectSelector.newRegistration)}
            </div>
            <div
              onClick={() => setCopy(true)}
              className={!copy ? classes.notSelected : classes.selected}
              style={
                !copy
                  ? {
                    display: "flex",
                    height: "100%",
                        justifyContent: 'center'
                    //paddingLeft: 16
                  }
                  : {
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                  }
              }>
              {t(translations.objectSelector.newRegistrationCopy)}
            </div>
          </div>
        </CardContent>
      </Card>
      {selectable}
    </div>
  );

  // if (smallScreen) return content;
    if(smallScreen) {
        return (
            <Paper
                ref={containerRef}
                style={{
                    zIndex: 4000,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflowY: scrollable ? 'scroll' : 'auto',
                    margin: 0,
                    backgroundColor: '#F5F5F5',
                }}>
                {content}
            </Paper>
        );
    }

  return (
    <Paper
      ref={containerRef}
      style={{
        width: scrollable ? '355px' : '355px',
        overflowY: scrollable ? 'scroll' : 'auto',
        maxHeight: height,
        margin: 0,
        backgroundColor: '#F5F5F5',
      }}>
      {content}
    </Paper>
  );
}
