import React, { useEffect } from 'react';
import {
  makeStyles,
  Theme,
  createStyles,
  createMuiTheme,
} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import { Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import ClearIcon from '@material-ui/icons/Clear';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '3px 4px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      boxShadow: '0px 8px 10px 1px rgba(0,0,0,0.14)',
      [theme.breakpoints.up('md')]: {
        width: '330px',
      },
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      color: 'rgba(0, 0, 0, 0.8)',
      fontFamily: 'Arial',
      backgroundColor: 'white',
      '&&&:before': {
        border: 'none',
      },
      '&&:after': {
        border: 'none',
      },
      '&&:hover': {
        backgroundColor: '#fff',
      },
      '&.Mui-focused': {
        backgroundColor: '#fff',
      },
    },
    iconButton: {
      //padding: '10px 10px 10px 5px',
      color: 'rgb(29, 29, 29)',
      flex: 1,
    },
    clear: {
      padding: '10px 3px 10px 5px',
      color: 'rgb(29, 29, 29)',
    },
    searchIcon: {
      color: 'rgb(29, 29, 29)',
    },
    popper: {
      width: '330px !important',
      left: '-25px !important',
      marginTop: '8px',
      [theme.breakpoints.down('md')]: {
        width: '310px !important',
        left: '-25px !important',
        marginTop: '8px',
      },
      [theme.breakpoints.down('xs')]: {
        width: '95% !important',
        left: '-8px !important',
        marginTop: '8px',
      },
    }
  }),
);

interface Stedsnavn {
  ssrId: string;
  navnetype: string;
  kommunenavn: string;
  fylkesnavn: string;
  stedsnavn: string;
  aust: string;
  nord: string;
  skrivemaatestatus: string;
  spraak: string;
  skrivemaatenavn: string;
  epsgKode: string;
}

export default function Search(props) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [locationData, setLocationData] = React.useState<Stedsnavn[]>([]);
  const [searchValue, setSearchValue] = React.useState('');

  const transformSuggestions = response => {
    if (!Array.isArray(response.stedsnavn)) {
      return [response.stedsnavn];
    }
    return response.stedsnavn;
  };

  const fetchData = () =>
    new Promise((resolve, reject) => {
      fetch(
        `https://ws.geonorge.no/SKWS3Index/ssr/json/sok?navn=${searchValue}&epsgKode=4258`,
      )
        .then(response => response.json())
        .then(response => {
          if (response && typeof response === 'object' && response.stedsnavn) {
            resolve(transformSuggestions(response));
          }
        })
        .catch(err => reject(err));
    });

  useEffect(() => {
    const fetchDebounce = _.debounce(function () {
      fetchData().then(items => setLocationData(items as Array<Stedsnavn>));
    }, 100);
    fetchDebounce();
  }, [searchValue]);

  const handleClear = () => {
      setLocationData([]);
      setSearchValue('');
      props.clearPosition();
  };

  // @ts-ignore
  return (
    <>
      <Paper component="form" className={classes.root}>
        <IconButton
          className={classes.iconButton}
          aria-label="menu"
          onMouseDown={event => {
            event.preventDefault();
          }}
          onClick={props.menuOnClick}

        >
          <MenuIcon />
        </IconButton>
        <Autocomplete
          noOptionsText={t(translations.searchBar.noResults)}
          style={{ width: "94%" }}
          //freeSolo
          openOnFocus
          classes={{popper: classes.popper }}
          autoSelect={true}
          autoHighlight={true}
          id="free-solo-demo"
          inputValue={
              searchValue
          }
          getOptionLabel={option => {
              return locationData.length > 1 ?
                  `${option.stedsnavn}, ${option.navnetype} i ${option.kommunenavn}` : searchValue;
          }}
          options={locationData}
          onInputChange={(e, value) => value !== undefined ? setSearchValue(value) : setSearchValue('')}
          onChange={props.onOptionClick}
          //@ts-ignore
          onKeyDown={(e, value) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if(!value) {
                e.preventDefault();
              }
            }
          }}
          renderInput={params => (
            <TextField
              {...params}
              variant="standard"
              placeholder={t(translations.searchBar.searchMap)}
              style={{width: '95%'}}
              InputProps={{
                ...params.InputProps,
                className: classes.input,
                endAdornment: (
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {searchValue.length > 1 ? (
                      <IconButton
                        className={classes.clear}
                        aria-label="clear"
                        onClick={handleClear}
                      >
                        <ClearIcon />
                      </IconButton>
                    ) : null}
                    <SearchIcon className={classes.searchIcon} />
                  </span>
                ),
              }}
            />
          )}
        />
      </Paper>
    </>
  );
}
