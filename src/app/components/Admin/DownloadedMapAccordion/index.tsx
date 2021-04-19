import React, {useReducer} from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  createStyles,
  IconButton,
  Theme
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import moment from "moment";
import Tooltip from "@material-ui/core/Tooltip";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import DeleteIcon from '@material-ui/icons/Delete';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import i18next from "i18next";


const useStyles = makeStyles((theme:Theme) =>
  createStyles({
  accordion: {
    marginTop: 15,
    padding: 5,
    backgroundColor: '#fff',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderShadow: 'none',
    borderRadius: 15,
    '&&:before': {
      backgroundColor: 'transparent'
    },
    '&&:last-child': {
      borderRadius: 15
    }
  },
  title: {
    fontSize: 20,
    fontWeight: 400,
    [theme.breakpoints.down('sm')]: {
      maxWidth: '80%'
    }
  },
  ul: {
    width: '100%',
    listStyle: 'none',
    padding: 0,
  },
  li: {
    padding: '10px 20px',
    backgroundColor: '#f1f1f1',
    marginTop: 10,
    borderRadius: 5,
    '&&:hover': {
      color: '#fff',
      backgroundColor: '#1A589F'
    }
  },
  tooltip: {
    backgroundColor: 'transparent'
  },
  deleteButton: {
    position: 'absolute',
    right: 50,
    '&&:hover': {
      backgroundColor: '#d6d6d6'
    },
    [theme.breakpoints.down('sm')]: {
      right: 30
    }
  },
    storage: {
    position:'absolute',
      right: 100,
      fontFamily: 'arial',
      margin: 0,
      [theme.breakpoints.down('sm')]: {
      right: 70
      }
    }
  })
);
export default function DownloadedMapAccordion(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [shownElements, setShownElements] = React.useState <any>(10);

  const increaseShownElements = (element) => {
    if(element.length <= shownElements + 10) {
      setShownElements(element.length)
    }else if(element.length > shownElements) {
      setShownElements(shownElements + 10)
    }
  }


  let momentConverted = moment(props.element[0].timestamp, 'YYYY-MM-DD HH:mm:ss').format();

  return (
    <Accordion key={props.element} classes={{root: classes.accordion}}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <span style={{display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
          <span style={{ display: 'block'}}>
          {props.element.length > 5000 ? (<p style={{color: 'red', fontFamily: 'arial'}}>{t(translations.adminPage.downloadPage.largeGroup).toString()}</p>) : null}
        <h2 className={classes.title}><b>{t(translations.adminPage.downloadPage.numberOfTiles).toString()} {props.element.length} </b> - {t(translations.adminPage.downloadPage.downloaded).toString()}: {moment(momentConverted).fromNow().toString()}</h2>
          <p className={classes.storage}>{props.storage}</p>
          </span>
        </span>
      </AccordionSummary>
      <AccordionDetails>
        <ul className={classes.ul}>
          <p style={{fontFamily: 'arial', marginLeft: 5}}>{t(translations.adminPage.downloadPage.holdOverText).toString()}</p>
          {props.element.slice(0, shownElements).map(e =>
            <Tooltip classes={{tooltip: classes.tooltip}} title={
              <React.Fragment>
                <div>
                  <img style={{borderRadius: 5}} src={e.url} />
                </div>
              </React.Fragment>
            }>
              <li key={e.key} className={classes.li}>{e.url}</li>
            </Tooltip>
          )}
          <p style={{marginTop: 10, marginLeft: 5, color: '#818181', fontFamily: 'arial'}}>{t(translations.adminPage.downloadPage.showing).toString()} {shownElements} {t(translations.adminPage.downloadPage.mapTiles).toString()} {props.element.length}... <Button style={{color: '#818181'}} onClick={() => increaseShownElements(props.element)}>{t(translations.adminPage.downloadPage.loadMore).toString()}</Button></p>
        </ul>
      </AccordionDetails>
    </Accordion>
  )
}
