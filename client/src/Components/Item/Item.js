import React from 'react';
import './Item.css';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';
import Checkbox from '@material-ui/core/Checkbox';

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
      return (
          <Card className={classes.card}>
            <div className={classes.details}>
              <CardContent className={classes.content}>
                <Typography component="h5" variant="h5">
                {
                  props.selectMode &&
                  <Checkbox
                      value="secondary"
                      color="primary"
                      onChange={({ target }) => props.onCheckChange(target.checked, props.name)}
                  />
                }
                  {props.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Quantity: {props.quantity}
                </Typography>
              </CardContent>
              <div className={classes.controls}>
                <IconButton aria-label="previous" onClick={() => props.onQuantityChange('minus')}>
                  <RemoveRoundedIcon className={classes.playIcon} />
                </IconButton>
                <IconButton aria-label="next" onClick={() => props.onQuantityChange('plus')}>
                  <AddRoundedIcon className={classes.playIcon} />
                </IconButton>
              </div>
            </div>
            <CardMedia
                className={classes.cover}
                image={props.image}
                title="Live from space album cover"
            />
          </Card>
      );
}
