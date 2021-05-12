import React, { memo, useContext } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import { FeatureNode } from 'app/model/FeatureMember';
import municipalities from '../../config/municipalities.json';
import { ValidationContext } from 'app/containers/ObjectEditor';
import { DataContext } from 'app/containers/HomePage';

type Municipality = { id: string; name: string };

export default memo<{
  node: FeatureNode;
  onFieldChange: () => void;
  withoutMargin?: boolean;
  register?: boolean;
}>(({ node, onFieldChange, withoutMargin = false, register }) => {
  const { featureCollection } = useContext(DataContext);

  const [value, setValue] = React.useState<FeatureNode>(() => {
    const featureMembers = featureCollection?.featureMembers;
    if (
      node.value == undefined &&
      featureMembers != undefined &&
      featureMembers.length > 0
    ) {
      let currentLatestRegistratedFeatureMember;
      for (const member of featureMembers) {
        let origin = member.nodes.find(node => node.name == 'opphav');
        // TODO: Bruk nåværende bruker
        // && origin.value == "nåværende_bruker"

        let memberMuni = member.nodes.find(
          element => element.name?.toLowerCase() == 'kommreel',
        )?.value;

        if (memberMuni == undefined) continue;

        let regDate =
          member.nodes.find(
            element => element.name?.toLowerCase() == 'datafangstdato',
          )?.value ??
          member.nodes.find(
            element => element.name?.toLowerCase() == 'førstedatafangstdato',
          )?.value;

        let currentLatestRegistratedFeatureMemberRegDate =
          currentLatestRegistratedFeatureMember?.nodes.find(
            element => element.name?.toLowerCase() == 'datafangstdato',
          )?.value ??
          currentLatestRegistratedFeatureMember?.nodes.find(
            element => element.name?.toLowerCase() == 'førstedatafangstdato',
          )?.value;

        if (regDate != undefined) {
          if (
            currentLatestRegistratedFeatureMember == undefined ||
            regDate > currentLatestRegistratedFeatureMemberRegDate
          ) {
            currentLatestRegistratedFeatureMember = member;
          }
        } else continue;
      }
      if (currentLatestRegistratedFeatureMember != undefined) {
        const latestRegMuniValue = currentLatestRegistratedFeatureMember.nodes.find(
          element => element.name?.toLowerCase() == 'kommreel',
        )?.value;

        if (latestRegMuniValue != undefined) node.value = latestRegMuniValue;
        else throw 'LATESTREGMUNIVALUE CAN NOT BE UNDEFINED';
      }
      onFieldChange();
    }
    return node;
  });

  const { validation } = useContext(ValidationContext);

  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!node.value || node.value == '') {
      node.valid = false;
    }
    if (validation != undefined) {
      if (!node.value || node.value == '') {
        setError(true);
      }
    }
  });

  const onChange = event => {
    const text = event.target.textContent;

    let kommuneNr;

    if (text.length > 0)
      kommuneNr = text.substring(text.indexOf('(') + 1, text.indexOf(')'));

    console.log(kommuneNr);
    node.valid = true;
    node.value = kommuneNr;
    setError(false);
    onFieldChange();

    setValue({ ...value, value: kommuneNr });
  };

  const munis: Municipality[] = municipalities;

  return (
    <div style={{ width: '100%' }}>
      <Autocomplete<Municipality>
        options={munis}
        value={
          value?.value !== undefined
            ? munis.find(element => element.id === value.value)
            : undefined
        }
        getOptionLabel={i => `${i.name} (${i.id})`}
        // renderOption={(i) => `${i.name} (${i.id})`}
        style={{
          margin: withoutMargin ? '' : '0 16px 0 16px',
          backgroundColor: 'rgba(26, 88, 159, 0.1)',
        }}
        onChange={event => onChange(event)}
        renderInput={params => (
          <TextField
            {...params}
            label="Kommune"
            variant="filled"
            required={true}
            error={error}
            // value={value.value ?? ''}
          />
        )}
      />
    </div>
  );
});
