import React, { memo } from 'react';
import { SosiNode } from '../../sosi/sosi';
import {
  Button,
  Paper,
  Typography,
  Icon,
  Collapse,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AddAPhotoOutlined } from '@material-ui/icons';
import ArrowDownIcon from '@material-ui/icons/ExpandMore';
import ArrowUpIcon from '@material-ui/icons/ExpandLess';
import RemoveIcon from '@material-ui/icons/Cancel';
import { ImageElement } from 'app/model/FeatureMember';
import CancelError from '@material-ui/icons/Cancel';

const useStyles = makeStyles({
  paper: {
    padding: '0px 16px 20px 16px',
  },
  imageRemoveBtn: {
    color: 'rgba(255,255,255,0.6)',
    '&:hover': {
      color: '#ad0f03',
    },
  },
});

const inputId = 'upload-object-images';

export default memo<{
  imageList: ImageElement[];
  required: Boolean;
}>(({ imageList, required }) => {
  const classes = useStyles();

  const [expanded, setExpand] = React.useState<boolean>(true);

  const [images, updateImageList] = React.useState<ImageElement[]>(imageList);

  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    updateImageList(imageList);
  }, [imageList]);

  const handleUploadFile = ({ target }) => {
    if (images.length > 2) {
      if (!error) setError(true);
      return;
    }

    const fileReader = new FileReader();

    if (target.files.length) {
      const file = target.files[0];
      fileReader.readAsDataURL(file);
      const imageElement: ImageElement = {
        url: URL.createObjectURL(file),
        imageFile: file,
        id: 'id',
        isUploaded: false,
      };

      imageList.push(imageElement);

      updateImageList([...imageList]);
      // modifyToProperties();
      fileReader.onload = e => {
        console.log(e.target?.result);
      };
    }
    target.value = '';
  };

  const removeImage = (image, index) => {
    imageList.splice(index, 1);

    updateImageList([...imageList]);

    // modifyToProperties();
    if (error) {
      setError(false);
    }
  };

  let content = (
    <>
      <input
        color="primary"
        accept="image/*"
        type="file"
        onChange={event => handleUploadFile(event)}
        id={inputId}
        style={{ display: 'none' }}
        disabled={images.length > 2}
      />
      <label htmlFor={inputId} style={{ width: '100%' }}>
        <Button
          component="span"
          style={{ color: 'rgb(26, 88, 159)', height: '40px' }}
          fullWidth={true}
          variant={'outlined'}
          startIcon={<AddAPhotoOutlined />}
          onClick={() => {
            if (images.length > 2) setError(true);
          }}>
          <Typography
            style={{
              fontWeight: 'bold',
              letterSpacing: 1.25,
              fontSize: '14.26px',
            }}>
            Legg til bilder
          </Typography>
        </Button>
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {images.map((image, index) => (
          <div
            style={{
              width: '50%',
              position: 'relative',
            }}>
            <img
              style={{
                borderRadius: 25,
                padding: '16px 8px',
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
              }}
              src={
                image.url?.includes('blob')
                  ? image.url
                  : image.url?.includes('.jpg')
                  ? image.url
                  : image.url + '.jpg'
              } //image.url : image.url + '.jpg'
              alt={'bilde ' + index.toString()}></img>
            <IconButton
              classes={{ root: classes.imageRemoveBtn }}
              onClick={() => removeImage(image, index)}
              children={<RemoveIcon />}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
              }}></IconButton>
          </div>
        ))}
      </div>
    </>
  );

  if (expanded !== null) {
    content = <Collapse in={expanded}>{content}</Collapse>;
  }

  return (
    <Paper elevation={3} className={classes.paper}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {required && imageList.length < 1 ? (
          <CancelError
            style={{
              marginRight: '12px',
              color: 'rgb(176, 0, 32)',
            }}></CancelError>
        ) : null}

        <Typography
          style={{
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: '16.3px',
            flex: 1,
          }}>
          Last opp bilder
        </Typography>

        <Typography
          style={{
            fontSize: '12.23px',
            fontWeight: 'bold',
            fontFamily: 'Arial',
            color: !error ? 'rgba(0, 0, 0, 0.6)' : 'red',
            letterSpacing: 2,
          }}>
          {images?.length + '/3'}
        </Typography>
        <IconButton onClick={() => setExpand(!expanded)}>
          {expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </IconButton>
      </div>

      {content}
    </Paper>
  );
});
