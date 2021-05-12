import React from 'react';

import {makeStyles, withStyles, createStyles, useTheme, Theme} from '@material-ui/core/styles';
import {openDB} from "idb";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  IconButton,
  Typography
} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from "moment";
import Tooltip from '@material-ui/core/Tooltip';
import DownloadedMapAccordion from "../../../components/Admin/DownloadedMapAccordion";
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import DeleteIcon from "@material-ui/icons/Delete";
import {controlSaveTiles} from "../../../components/ActualMap";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
  delBtn: {
    marginLeft: 10,
    backgroundColor: 'transparent',
    color: 'rgb(26, 88, 159);',
    fontSize: 14,
    fontWeight: 'bold',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'left',
      marginLeft: 0
    }
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  }
}));

export default function MapPage(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [downloadedLayers, setDownloadedLayers] = React.useState<null | Array<any>>(null);
  const tileStoreName = 'tileStore';
  const dbPromise = openDB('leaflet.offline', 2)
  const [deletion, setDeletion] = React.useState(false)

 async function getGroupFromDb() {
    return (await dbPromise).getAllFromIndex(tileStoreName, 'group')
  }


  React.useEffect(() => {
    getGroupFromDb().then(function (result) {
      setDownloadedLayers(groupArr(result))
      //groupArr(result).forEach(element =>  ThisArr.push(element))
      setDeletion(false)
    })
  }, [deletion])

// if(downloadedLayers){
// downloadedLayers.forEach(element => console.log(element[0]))
// }
  const groupArr = (arr) => {
    return Object.values( // get array from all the values
      arr.reduce((acc, el) => { // reduce to an object with the group as keys and the single items as value array
        if(acc[el.group] == null)
          acc[el.group] = [el];
        else
          acc[el.group].push(el);

        return acc;
      }, [])
    )
  }




  return (
    <div style={{marginTop: 30}}>
      <span className={classes.flexContainer}>
      <h1 style={{fontFamily: 'Meta Book', fontSize: 24, color: 'rgba(0,0,0,0,87)', marginLeft: 15}}>{t(translations.adminPage.downloadPage.title).toString()}</h1>
      <Button
        classes={{ root: classes.delBtn}}
        size="small"
        onClick={() => {
          controlSaveTiles._rmTiles()
          setDownloadedLayers(null)
        }}
      >
        {t(translations.adminPage.downloadPage.delete).toString()}
      </Button>
      </span>
      {downloadedLayers !== null && downloadedLayers.length > 0 ? downloadedLayers.slice(0).reverse().map((element, index) =>
       <DownloadedMapAccordion element={element} />
      ) :  (
        <p style={{fontFamily: 'Arial', color: 'rgba(0, 0, 0, 0.6)', marginLeft: 20}}>{t(translations.adminPage.downloadPage.noDownloads).toString()}</p>
      )}

    </div>
  );
}
