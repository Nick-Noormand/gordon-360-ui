import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Doughnut, defaults } from 'react-chartjs-2';

import { gordonColors } from '../../../../theme';
import user from '../../../../services/user';
import session from '../../../../services/session';
import GordonLoader from '../../../../components/Loader';

import './CLWChart.css';

export default class CLWCreditsDaysLeft extends Component {
  constructor(props) {
    super(props);

    this.loadData = this.loadData.bind(this);

    this.state = {
      daysLeft: [],
      chapelCredits: {},
      error: null,
      loading: true,
    };
  }

  componentWillMount() {
    this.loadData();
  }

  async loadData() {
    this.setState({ loading: true });
    try {
      const daysLeftPromise = session.getDaysLeft();
      const chapelCreditsPromise = user.getChapelCredits();
      const daysLeft = await daysLeftPromise;
      const chapelCredits = await chapelCreditsPromise;
      this.setState({ loading: false, daysLeft, chapelCredits });
    } catch (error) {
      this.setState({ error });
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }

    defaults.global.legend.display = false;
    let content;
    if (this.state.loading === true) {
      content = <GordonLoader />;
    } else {
      const daysLeft = this.state.daysLeft[0];
      const pastDays = this.state.daysLeft[1] - daysLeft;

      const options = {
        cutoutPercentage: 25,
        tooltips: {
          // Allow different tooltips for different datasets within the same pie;
          callbacks: {
            // Code taken from https://github.com/chartjs/Chart.js/issues/1417
            label: function(item, data) {
              return (
                data.datasets[item.datasetIndex].label[item.index] +
                ': ' +
                data.datasets[item.datasetIndex].data[item.index]
              );
            },
          },
        },
        legend: false,
      };

      const { current, required } = this.state.chapelCredits;
      const remaining = current > required ? 0 : required - current;

      const data = {
        legendEntries: ['Days Finished', 'CL&W Credits'],
        legendColors: [gordonColors.primary.blue, gordonColors.primary.cyan],
        datasets: [
          {
            label: ['Days Finished', 'Days Remaining'],
            data: [pastDays, daysLeft],
            backgroundColor: [gordonColors.primary.blue, gordonColors.neutral.lightGray],
          },
          {
            label: ['CL&W Credits Earned', 'CL&W Credits Remaining'],
            data: [current, remaining],
            backgroundColor: [gordonColors.primary.cyan, gordonColors.neutral.lightGray],
          },
        ],
      };

      content = (
        <div>
          <Grid
            container
            justify="space-around"
            spacing={0}
            style={{ paddingTop: 5, paddingBottom: 5 }}
          >
            <Grid item>
              <Typography variant="body1" style={{ color: 'gray', textAlign: 'center' }}>
                {`${daysLeft} Days Left in Semester`}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" style={{ color: 'gray', textAlign: 'center' }}>
                {`${current} CL&W Credit` + (current === 1 ? '' : 's') + ' Earned'}
              </Typography>
            </Grid>
          </Grid>
          <Grid container justify="center">
            <Grid item>
              <div class="legend">
                <div class="entry">
                  <span class="entry-label" style={{ background: gordonColors.primary.blue }} />
                  <span class="entry-text">Days Finished</span>
                </div>
                <div class="entry">
                  <span class="entry-label" style={{ background: gordonColors.primary.cyan }} />
                  <span class="entry-text">CL&W Credits</span>
                </div>
              </div>
            </Grid>
          </Grid>
          <Doughnut data={data} height={175} options={options} />
        </div>
      );
    }

    return (
      <Card>
        <CardContent>
          <Typography variant="headline" style={{ textAlign: 'center', paddingTop: 5 }}>
            Christian Life & Worship Credits
          </Typography>
          {content}
        </CardContent>
      </Card>
    );
  }
}