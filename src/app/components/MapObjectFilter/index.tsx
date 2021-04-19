import { Button, Divider, IconButton, Paper } from '@material-ui/core';
import useWindowDimensions from 'app/utils/windowDimensions';
import React, { useContext, useEffect, useState } from 'react';
import { TopBar } from '../ImportObjects/TopBar';
import FavoriteIconOutlined from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import DeleteIcon from '@material-ui/icons/Delete';
import ObjectSelector, {
  ObjectCategory,
  ObjectSelectorType,
} from '../ObjectSelector';
import { ObjectProps } from 'app/containers/MapActions';
import { DataContext } from 'app/containers/HomePage';
import FeatureMemberFilterView, {
  FilterItemProps,
} from './FeatureMemberFilterView';
import { FeatureMember, FeatureNode } from 'app/model/FeatureMember';
import AddFavoriteFilter from './AddFavoriteFilter';

export type ObjectFilter = {
  objects: Map<string, FeatureMember | undefined>;
  apply: boolean;
  favorites?: FavoriteFilter[];
  favoriteApplied: boolean;
  appliedFavoriteFilter?: FavoriteFilter;
  mapValueNotifier: string[];
};

export type FavoriteFilter = {
  name: string;
  filter: Map<string, FeatureMember | undefined>;
};

interface Props {
  onPop: () => void;
}

export function MapObjectFilter(props: Props) {
  const { height, width } = useWindowDimensions();

  const [objectSelectorKey, setObjectSelectorKey] = useState<string>(
    'SelectorKey',
  );

  const {
    applyFilter,
    objectFilter,
    setFilter,
    onFavoriteFilterChanged,
  } = useContext(DataContext);

  if (objectFilter?.apply == false) applyFilter!(true);

  const containerRef = React.useRef<any>();

  const [scrollable, setScrollable] = useState<boolean>(false);

  const [categoryValues, setCategoryValues] = useState<any>();

  const [showFavoriteFilters, setShowFavoriteFilters] = useState<boolean>(
    false,
  );

  const [isInit, setIsInit] = useState<boolean>(true);

  const [showAddFavorite, setShowAddFavorite] = useState<boolean>(false);

  const [, updateState] = React.useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [selectedFeatureType, setSelectedFeatureType] = useState<
    string | undefined
  >();

  useEffect(() => {
    const containerHeight = containerRef?.current?.clientHeight;

    if (!containerHeight) setScrollable(true);
    else {
      if (containerHeight > height - 48) setScrollable(true);
      else setScrollable(false);
    }
  });

  const onCategoryCheckChanged = (categories: ObjectCategory[]) => {
    for (let category of categories) {
      if (category.name == 'Sittegruppe') {
        if (category.checked)
          objectFilter?.objects.set('Sittegruppe', undefined);
        else {
          if (selectedFeatureType == 'Sittegruppe') {
            setSelectedFeatureType(undefined);
          }

          objectFilter?.objects.delete('Sittegruppe');
        }
      } else {
        for (let sub of category.subCategories) {
          if (sub.checked) {
            if (objectFilter?.objects.get(sub.type) == undefined)
              objectFilter?.objects.set(sub.type, undefined);
          } else {
            if (selectedFeatureType == sub.type) {
              setSelectedFeatureType(undefined);
            }

            objectFilter?.objects.delete(sub.type);
          }
        }
      }
    }

    if (showFavoriteFilters == true) {
      setShowFavoriteFilters(false);
    }
    setFilter!(objectFilter!);
    /// ApplyFilter changed to setFilter to make sure that favorite filters are saved
    /// on category check change
    // applyFilter!(true);
  };

  const resetFilter = () => {
    objectFilter!.objects.forEach((val, key) =>
      objectFilter!.objects.delete(key),
    );
    objectFilter!.mapValueNotifier = [];

    setCategoryValues(undefined);
    setSelectedFeatureType(undefined);
    setObjectSelectorKey(objectSelectorKey + objectSelectorKey);
    setFilter!(objectFilter!);
  };

  const onSelect = (objectProps: ObjectProps) => {
    setSelectedFeatureType(objectProps.type);
  };

  const onFeatureMemberFilterChanged = (featureMember: FeatureMember) => {
    const nodes: FeatureNode[] = [];

    for (const node of featureMember.nodes) nodes.push(node);

    if (featureMember.rampNode) {
      for (const node of featureMember.rampNode.nodes) nodes.push(node);
    }

    if (featureMember.stairNode) {
      for (const node of featureMember.stairNode.nodes) nodes.push(node);
    }

    for (const node of nodes) {
      const newVal = featureMember.type! + node.name + node.value;

      // let deletetion = false;

      // objectFilter?.mapValueNotifier.forEach(val => {
      //   if (newVal == val) {
      //     objectFilter.mapValueNotifier.delete(val);
      //     deletetion = true;
      //   }
      // });

      // if (!deletetion)

      const valExists = objectFilter?.mapValueNotifier.includes(newVal);

      objectFilter?.mapValueNotifier.push(valExists ? newVal + newVal : newVal);

      // else {
      //   objectFilter?.mapValueNotifier.forEach(val => {
      //     if (val.includes(featureMember.type! + node.name)) {
      //       objectFilter.mapValueNotifier.(val);
      //     }
      //   });
      // }
    }

    let hasValues =
      featureMember.availabilityNode?.filterNode?.isApplied == true;

    const availabilityFilter = featureMember.availabilityNode?.filterNode;

    if (availabilityFilter != undefined) {
      availabilityFilter!.wheelchair.forEach((entryValue, entryKey) => {
        if (entryValue == true && hasValues == true) {
          objectFilter?.mapValueNotifier.push(featureMember.type! + entryKey);
        }
        //  else {
        //   objectFilter?.mapValueNotifier.delete(featureMember.type! + entryKey);
        // }
      });

      availabilityFilter!.electricWheelChair.forEach((entryValue, entryKey) => {
        if (entryValue == true && hasValues == true) {
          objectFilter?.mapValueNotifier.push(
            featureMember.type! + 'el' + entryKey,
          );
        }
        // else {
        //   objectFilter?.mapValueNotifier.delete(
        //     featureMember.type! + 'el' + entryKey,
        //   );
        // }
      });
    }

    if (hasValues == false)
      for (const node of nodes) {
        if (node.value != undefined) hasValues = true;
      }

    objectFilter?.objects.set(
      featureMember.type!,
      hasValues ? featureMember : undefined,
    );
    applyFilter!(true);
    setFilter!(objectFilter!);
  };

  const getFavoriteIcon = () => {
    if (objectFilter?.favoriteApplied == true)
      return (
        <FavoriteIcon
          style={{
            color: `rgb(26, 88, 159)`,
          }}></FavoriteIcon>
      );
    else
      return (
        <FavoriteIconOutlined
          style={{
            color: 'rgb(117, 117, 117)',
          }}></FavoriteIconOutlined>
      );
  };

  const handleOnClickFavorite = () => {
    if (objectFilter?.favoriteApplied == true) {
      objectFilter.favoriteApplied = false;

      objectFilter.objects = new Map();
      resetFilter();
    } else {
      if (showAddFavorite != true) setShowAddFavorite(true);
      else setShowAddFavorite(false);
    }

    if (showFavoriteFilters) setShowFavoriteFilters(false);
  };

  const handleOnAddFavorite = (name: string) => {
    const filter: FavoriteFilter = {
      name: name,
      filter: objectFilter?.objects!,
    };

    const favoriteFilters = objectFilter!.favorites!;

    favoriteFilters.push(filter);

    objectFilter!.appliedFavoriteFilter = filter;

    objectFilter!.favoriteApplied = true;

    onFavoriteFilterChanged!(favoriteFilters);

    setShowAddFavorite(false);
  };

  let addFavoriteContent;

  if (showAddFavorite) {
    addFavoriteContent = (
      <AddFavoriteFilter
        onSave={name => handleOnAddFavorite(name)}></AddFavoriteFilter>
    );
  }

  const handleOnSelectFavoriteFilter = (name: string) => {
    const favoriteFilter = objectFilter?.favorites!.find(e => e.name == name);

    if (favoriteFilter != undefined && objectFilter != undefined) {
      objectFilter.appliedFavoriteFilter = favoriteFilter;
      objectFilter.favoriteApplied = true;

      objectFilter.objects = favoriteFilter.filter;

      setFilter!(objectFilter);

      setShowFavoriteFilters(false);

      setCategoryValues(undefined);
      setObjectSelectorKey(objectSelectorKey + objectSelectorKey);
    } else throw 'FAVORITEFILTER CANN NOTTT BE UNDEFINED';
  };

  const handleShowFavoriteFilters = () => {
    if (showFavoriteFilters != true) setShowFavoriteFilters(true);
    else setShowFavoriteFilters(false);

    if (showAddFavorite) setShowAddFavorite(false);
  };

  const handleOnDeleteFavoriteFilter = (name: string) => {
    const favoriteFilter = objectFilter?.favorites!.find(e => e.name == name);

    if (favoriteFilter != undefined) {
      if (objectFilter?.appliedFavoriteFilter?.name == name) {
        objectFilter.appliedFavoriteFilter = undefined;
        objectFilter.favoriteApplied = false;
      }

      const favoriteFilters = objectFilter!.favorites!;

      favoriteFilters.splice(favoriteFilters.indexOf(favoriteFilter), 1);
      if (favoriteFilters.length == 0) {
        setShowFavoriteFilters(false);
      }
      forceUpdate();

      onFavoriteFilterChanged!(favoriteFilters);
    } else throw 'FAVORITEFILTER CANN NOTTT BE UNDEFINED';
  };

  const onSetCategoryValues = values => {
    setCategoryValues(values);
    if (isInit) {
      onCategoryCheckChanged(values);
      setIsInit(false);
    }
  };

  let selectFavoriteFilter;

  if (showFavoriteFilters) {
    let favoriteFilterItems;

    const favoriteFilterItemsName: string[] = [];

    if (objectFilter?.favorites!.length == 0) {
      favoriteFilterItems = <text>Du har ingen lagrede filtere</text>;
    } else {
      favoriteFilterItems = objectFilter?.favorites!.map(favorite => (
        <div
          onClick={() => handleOnSelectFavoriteFilter(favorite.name)}
          style={{
            display: 'inline-flex',
            width: '100%',
            paddingBottom: '10px',
          }}>
          <text style={{ flex: 1 }}>{favorite.name}</text>
          <IconButton
            size="small"
            style={{ float: 'right', top: '0px' }}
            onClick={() => handleOnDeleteFavoriteFilter(favorite.name)}>
            <DeleteIcon></DeleteIcon>
          </IconButton>
        </div>
      ));
    }

    selectFavoriteFilter = (
      <Paper
        elevation={10}
        style={{
          width: '268px',
          position: 'fixed',
          zIndex: 300,
          alignSelf: 'center',
        }}>
        <div style={{ padding: '10px' }}>{favoriteFilterItems}</div>
      </Paper>
    );
  }

  let featureCollectionFilterView = (
    <Paper
      ref={containerRef}
      elevation={10}
      style={{
        width: scrollable ? '342px' : '332px',
        overflowY: scrollable ? 'scroll' : 'auto',
        maxHeight: height - 48,
        margin: 0,
        backgroundColor: 'white',
        display: 'fixed',
        zIndex: 300,
      }}>
      <TopBar
        isPop={false}
        title={'Filtrer objekter'}
        greyBackground={true}
        onPop={() => {
          //applyFilter!(false);
          props.onPop();
        }}></TopBar>
      <div style={{ backgroundColor: '#F5F5F5' }}>
        <div
          style={{
            height: '40px',
            display: 'inline-flex',
            width: '100%',
            alignItems: 'center',
            fontSize: '14.26px',
            letterSpacing: '0.25px',
            fontFamily: 'Arial',
          }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <IconButton size="small" onClick={() => handleOnClickFavorite()}>
              {getFavoriteIcon()}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleShowFavoriteFilters()}>
              {showFavoriteFilters ? (
                <ArrowDropUp
                  style={{
                    color: 'rgb(117, 117, 117)',
                  }}></ArrowDropUp>
              ) : (
                <ArrowDropDown
                  style={{
                    color: 'rgb(117, 117, 117)',
                  }}></ArrowDropDown>
              )}
            </IconButton>
          </div>
          <Divider orientation="vertical"></Divider>
          <Button
            style={{
              flex: 1,
            }}
            onClick={() => resetFilter()}>
            <a
              style={{
                flex: 1,
                textAlign: 'center',
                color: 'rgba(0, 0, 0, 0.6)',
              }}>
              Fjern alle
            </a>
          </Button>
        </div>
        <Divider></Divider>
      </div>
      {addFavoriteContent}
      {selectFavoriteFilter}
      <ObjectSelector
        key={objectSelectorKey}
        type={ObjectSelectorType.filter}
        onSelect={(objectProps: ObjectProps) => onSelect(objectProps)}
        onCheckChanged={(categories: ObjectCategory[]) =>
          onCategoryCheckChanged(categories)
        }
        getCategoryValues={values => onSetCategoryValues(values)}
        categoryValues={
          categoryValues ?? objectFilter?.objects
        }></ObjectSelector>
    </Paper>
  );

  if (selectedFeatureType == undefined) {
    return featureCollectionFilterView;
  } else {
    const existingFeatureMemberFilter:
      | FeatureMember
      | undefined = objectFilter?.objects.get(selectedFeatureType);

    let featureMemberFilter;

    if (existingFeatureMemberFilter != undefined) {
      const appliedNodeFilterItems: FilterItemProps[] = [];

      if (
        existingFeatureMemberFilter.availabilityNode?.filterNode?.isApplied ==
        true
      ) {
        appliedNodeFilterItems.push({
          name: 'Tilgjengelighetsvurdering',
          type: 'Tilgjengelighetsvurdering',
        });
      }

      for (const node of existingFeatureMemberFilter.nodes) {
        if (node.value != undefined)
          appliedNodeFilterItems.push({
            name: node.xsdElement?.displayName!,
            type: node.name,
          });
      }

      featureMemberFilter = {
        featureMember: existingFeatureMemberFilter,
        appliedNodeFilterItems: appliedNodeFilterItems,
      };
    }

    return (
      <div style={{ display: 'flex' }}>
        {featureCollectionFilterView}
        <FeatureMemberFilterView
          key={selectedFeatureType}
          onPop={() => setSelectedFeatureType(undefined)}
          objectType={selectedFeatureType}
          onChanged={featureMember =>
            onFeatureMemberFilterChanged(featureMember)
          }
          featureMemberFilter={featureMemberFilter}></FeatureMemberFilterView>
      </div>
    );
  }
}
