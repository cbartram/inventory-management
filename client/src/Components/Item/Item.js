import React, { useState, useEffect} from 'react';
import './Item.css';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import {GET_IMAGES, GOOGLE_SEARCH_URL} from "../../constants";

const useStyles = makeStyles(theme => ({
  card: {
    display: 'flex',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 151,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    height: 38,
    width: 38,
  },
}));


export default function Item(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [image, setImage] = useState('');
  useEffect( () => {
    async function getImages() {
      const images = await (await fetch(GET_IMAGES + props.name)).json();
      console.log('Images: ', images);
      setImage(images);
    }
    getImages();

  });
      return (
          <Card className={classes.card}>
            <div className={classes.details}>
              <CardContent className={classes.content}>
                <Typography component="h5" variant="h5">
                  {props.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Quantity: {props.quantity}
                </Typography>
              </CardContent>
              <div className={classes.controls}>
                <IconButton aria-label="previous">
                  {theme.direction === 'rtl' ? <SkipNextIcon /> : <SkipPreviousIcon />}
                </IconButton>
                <IconButton aria-label="play/pause">
                  <PlayArrowIcon className={classes.playIcon} />
                </IconButton>
                <IconButton aria-label="next">
                  {theme.direction === 'rtl' ? <SkipPreviousIcon /> : <SkipNextIcon />}
                </IconButton>
              </div>
            </div>
            <CardMedia
                className={classes.cover}
                image={image[0]}
                title="Live from space album cover"
            />
          </Card>
      );
}
